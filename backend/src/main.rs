mod cli;
mod chapter;
mod data_ingestion;
mod db;
mod entity;
mod image_to_tetris;
mod novel_entry;
mod stats;

use std::{borrow::ToOwned, env, path::PathBuf, sync::Arc};

use anyhow::Result;
use axum::{
    extract::{
        multipart::{Field, Multipart, MultipartError},
        DefaultBodyLimit,
        State},
    http::{
        header,
        StatusCode},
        response::{IntoResponse, Json},
    routing::{
        delete,
        get,
        post
    },
    Router
};
use dotenv::dotenv;
use novel_entry::{NovelEntry, NovelSubsets};
use rand::{rngs::StdRng, seq::SliceRandom, SeedableRng};
use sea_orm::DatabaseConnection;
use tokio::sync::Mutex;

// global state for routing
#[derive(Clone)]
struct AppState {
    conn: DatabaseConnection,
    rng: Arc<Mutex<StdRng>>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // initialize everything; run scripts if applicable
    dotenv().ok();
    let rng = Arc::new(Mutex::new(StdRng::from_entropy()));
    let conn = db::init().await?;
    cli::run_cli(&conn).await?;

    // build our application with a route
    let payload_limit = 5_000_000; // 5 megabytes
    let state = AppState { conn, rng };
    let domain = env::var("DOMAIN")?;
    let app = Router::new()
        .route("/api/novels", post(novels_handler))
        .route("/api/update_novels", post(update_novels_handler))
        .route("/api/upload_novels_backup", post(upload_novels_backup))
        .route("/api/create_novel", get(create_novel_row_handler))
        .route("/api/delete_novel", delete(delete_novel_handler))
        .route("/api/novels_stats", get(get_novels_stats))
        .route("/api/random_novels", post(get_random_novels))
        .route("/api/image_to_tetris", post(image_to_tetris))
        .with_state(state)
        .layer(DefaultBodyLimit::max(payload_limit));

    // run it
    let listener = tokio::net::TcpListener::bind(domain.clone())
        .await?;
    println!("Listening on {domain}");
    axum::serve(listener, app).await?;

    Ok(())
}

/* 
all handlers must:
return a non-null JSON
return a status code (can be implicit)
*/

async fn novels_handler(state: State<AppState>, subset: Json<NovelSubsets>) -> impl IntoResponse {
    println!("Fetching novels: {subset:?}");
    let novels = db::fetch_novel_entries(&state.conn, *subset).await.unwrap_or_default();
    Json(novels)
}

type UpdateNovelsResponse = Result<(StatusCode, Json<Vec<novel_entry::NovelEntry>>), (StatusCode, Json<String>)>;
async fn update_novels_handler(state: State<AppState>, Json(rows): Json<Vec<novel_entry::NovelEntry>>) -> UpdateNovelsResponse {
    println!("Updating novels {}", rows.len());
    let res = db::update_novel_entries(&state.conn, &rows).await;
    match res {
        Ok(novels) => Ok((StatusCode::OK, Json(novels))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }
}

async fn upload_novels_backup(state: State<AppState>, mut multipart: Multipart) -> impl IntoResponse {
    println!("Uploading novels backup");

    // parse the multipart form into novel entries
    let mut rows = Vec::new();
    while let Some(field) = multipart.next_field()
        .await.map_err(|e| mtp_err(&e))?
    {
        if let Some(filename) = field.file_name() {
            if filename.to_lowercase().ends_with(".json") {
                let bytes = match field.bytes().await {
                    Ok(bytes) => bytes,
                    Err(e) => return Err(mtp_err(&e)),
                };

                match serde_json::from_slice::<Vec<NovelEntry>>(&bytes) {
                    Ok(data) => rows.extend(data),
                    Err(err) => return Err((StatusCode::UNPROCESSABLE_ENTITY, Json(err.to_string()))),
                }
            }
        }
    }

    // drop all existing novels to reset it
    if let Err(err) = db::drop_all_novels(&state.conn).await {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(err.to_string()),
        ))
    };

    // upload the backup novels
    let res = db::insert_novel_entries(&state.conn, &rows).await;
    match res {
        Ok(()) => Ok((StatusCode::ACCEPTED, Json(rows.len().to_string()))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }

}

async fn create_novel_row_handler(state: State<AppState>) -> impl IntoResponse {
    println!("Creating novel row");
    match db::create_empty_row(&state.conn).await {
        Ok(novel) => Ok((StatusCode::CREATED, Json(novel))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string())))
    }
}

type DeleteNovelResponse = Result<(StatusCode, Json<i32>), (StatusCode, Json<String>)>;
async fn delete_novel_handler(state: State<AppState>, id: Json<i32>) -> DeleteNovelResponse{
    println!("Deleting novels");
    match db::delete_novel_entry(&state.conn, *id).await {
        Ok(()) => Ok((StatusCode::OK, Json(*id))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }
}

async fn get_novels_stats(state: State<AppState>) -> impl IntoResponse {
    println!("Getting novels stats");
    match stats::get_stats(&state.conn).await {
        Ok(res) => Ok((StatusCode::OK, Json(res))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }
}

async fn get_random_novels(state: State<AppState>, subset: Json<NovelSubsets>) -> impl IntoResponse {
    println!("Fetching random novels: {subset:?}");

    let num_novels: usize = 10;
    let novels = db::fetch_novel_entries(&state.conn, *subset).await.unwrap_or_default();
    let amount = num_novels.min(novels.len());

    // access the rng in a thread-safe way
    let mut rng = state.rng.lock().await;
    let random_novels: Vec<NovelEntry> = novels
        .choose_multiple(&mut *rng, amount).cloned().collect();
    Json(random_novels)
}

async fn image_to_tetris(mut multipart: Multipart) -> impl IntoResponse {
    println!("Performing image to tetris");

    // parse the multipart into the arguments
    let mut image: Option<Vec<u8>> = None;
    let mut image_format: Option<String> = None;
    let mut board_width: Option<u32> = None;
    let mut board_height: Option<u32> = None;
    let mut prioritize_tetrominos: Option<bool> = None;
    while let Some(field) = multipart.next_field().await
        .map_err(|e| mtp_err(&e))?
    {
        match field.name() {
            Some("image") => {
                image_format = PathBuf::from(
                        &field.file_name()
                        .ok_or((StatusCode::BAD_REQUEST, Json("No file name found".to_string())))?
                    )
                    .extension()
                    .and_then(|ext| ext.to_str())
                    .map(ToOwned::to_owned);
                image = Some(field.bytes().await.map_err(|e| mtp_err(&e))?.to_vec());
            },
            Some("board_width") => board_width = parse_mtp_int(field).await?,
            Some("board_height") => board_height = parse_mtp_int(field).await?,
            Some("prioritize_tetrominos") => prioritize_tetrominos = parse_mtp_int(field).await?.map(|f| f != 0),
            _ => return Err((StatusCode::BAD_REQUEST, Json("Invalid field".to_string())))
        }
    }

    let Some(image) = image else {
        return Err((StatusCode::BAD_REQUEST, Json("No image field found".to_string())));
    };
    let Some(image_format) = image_format else {
        return Err((StatusCode::BAD_REQUEST, Json("No image format found (ex: png, jpg)".to_string())));
    };
    let Some(board_width) = board_width else {
        return Err((StatusCode::BAD_REQUEST, Json("No board width field found".to_string())));
    };
    let Some(board_height) = board_height else {
        return Err((StatusCode::BAD_REQUEST, Json("No board height field found".to_string())));
    };
    let Some(prioritize_tetrominos) = prioritize_tetrominos else {
        return Err((StatusCode::BAD_REQUEST, Json("No prioritize tetrominos field found".to_string())));
    };

    // then process the image
    let body = image_to_tetris::run(board_width, board_height, prioritize_tetrominos, &image, &image_format).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string())))?;

    let headers = [
        (header::CONTENT_TYPE, "image/png; charset=utf-8"),
        (
            header::CONTENT_DISPOSITION,
            "attachment; filename=result.png",
        ),
    ];

    Ok((StatusCode::OK, (headers, body)))
}

// function helpers for routes
type ErrorRes = (StatusCode, Json<String>);
fn mtp_err(e: &MultipartError) -> ErrorRes {
    (e.status(), Json(e.to_string()))
}

async fn parse_mtp_int(field: Field<'_>) -> Result<Option<u32>, ErrorRes> {
    let data = match field.bytes().await {
        Ok(data) => data,
        Err(e) => return Err(mtp_err(&e)),
    };
    Ok(Some(u32::from_le_bytes(data[0..4]
        .try_into()
        .map_err(|_| (StatusCode::BAD_REQUEST, Json("Invalid integer".to_string())))?
    )))
}
