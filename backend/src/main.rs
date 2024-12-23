mod db;
mod entity;
mod novel_entry;
mod scraper;
mod scripts;
mod stats;

use std::{env, error::Error, sync::Arc};

use axum::{
    response::{Html, IntoResponse, Json},
    extract::{State, multipart::Multipart},
    routing::{get, post, delete},
    http::StatusCode, Router,
};
use dotenv::dotenv;
use headless_chrome::Browser;
use itertools::Itertools;
use novel_entry::NovelEntry;
use rand::{rngs::StdRng, seq::SliceRandom, SeedableRng};
use sea_orm::DatabaseConnection;
use tokio::sync::Mutex;

// global state for routing
#[derive(Clone)]
struct AppState {
    conn: DatabaseConnection,
    browser: Arc<Mutex<Browser>>,
    rng: Arc<Mutex<StdRng>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // initialize everything; run scripts if applicable
    dotenv().ok();
    let rng = Arc::new(Mutex::new(StdRng::from_entropy()));
    let browser = Arc::new(Mutex::new(scraper::init().unwrap()));
    let conn = db::init().await.unwrap();
    scripts::run_cli(&conn).await.unwrap();

    // build our application with a route
    let state = AppState { conn, browser, rng };
    let domain = env::var("DOMAIN").unwrap();
    let app = Router::new()
        .route("/", get(main_handler))
        .route("/api/novels", get(novel_handler))
        .route("/api/update_novels", post(update_novels_handler))
        .route("/api/upload_novels_backup", post(upload_novels_backup))
        .route("/api/create_novel", get(create_novel_row_handler))
        .route("/api/delete_novel", delete(delete_novel_handler))
        .route("/api/novels_stats", get(get_novels_stats))
        .route("/api/random_novels", post(get_random_novels))
        .route("/api/scrape_novel_tags", post(get_novel_tags))
        .with_state(state);

    // run it
    let listener = tokio::net::TcpListener::bind(domain.clone())
        .await
        .unwrap();
    println!("Listening on {}", domain);
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

async fn main_handler() -> Html<&'static str> {
    Html("<h1>Hello, World!</h1>")
}

/* 
all handlers must:
return a non-null JSON
return a status code (can be implicit)
*/

async fn novel_handler(state: State<AppState>) -> impl IntoResponse {
    println!("Fetching novels");
    let novels = db::fetch_novel_entries(&state.conn).await.unwrap_or_default();
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

    let mut rows = Vec::new();
    while let Some(field) = multipart.next_field().await.map_err(|op| (StatusCode::BAD_REQUEST, Json(op.to_string())))?{
        if let Some(filename) = field.file_name() {
            if filename.ends_with(".json") {
                // Read the JSON file content
                let bytes = field.bytes().await.unwrap();

                // Deserialize JSON into MyData struct
                match serde_json::from_slice::<Vec<NovelEntry>>(&bytes) {
                    Ok(data) => {
                        rows.extend(data);
                    }
                    Err(err) => {
                        return Err((
                            StatusCode::UNPROCESSABLE_ENTITY,
                            Json(err.to_string()),
                        ))
                    }
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
    let novel = db::create_empty_row(&state.conn).await.unwrap();
    Json(novel)
}

type DeleteNovelResponse = Result<(StatusCode, Json<i32>), (StatusCode, Json<String>)>;
async fn delete_novel_handler(state: State<AppState>, id: Json<i32>) -> DeleteNovelResponse{
    println!("Deleting novels");
    let res = db::delete_novel_entry(&state.conn, *id).await;
    match res {
        Ok(()) => Ok((StatusCode::OK, Json(*id))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }
}

async fn get_novels_stats(state: State<AppState>) -> impl IntoResponse {
    println!("Getting novels stats");
    let stats = stats::get_stats(&state.conn).await.unwrap();
    Json(stats)
}

async fn get_random_novels(state: State<AppState>, num_novels: Json<usize>) -> impl IntoResponse {
    println!("Fetching random novels: {}", *num_novels);

    let novels = db::fetch_novel_entries(&state.conn).await.unwrap_or_default();
    let amount = num_novels.min(novels.len());

    // access the rng in a thread-safe way
    let mut rng = state.rng.lock().await;
    let random_novels = novels
        .choose_multiple(&mut *rng, amount)
        .map(|novel| novel.clone())
        .collect_vec();
    Json(random_novels)
}

async fn get_novel_tags(state: State<AppState>, novel_title: Json<String>) -> impl IntoResponse {
    println!("Getting novel tags for: {}", *novel_title);
    let res = scraper::scrape_genres_and_tags(&mut *state.browser.lock().await, &novel_title).await;
    println!("Finished getting novel tags for: {}", *novel_title);
    if res.is_err() {
        println!("Error: {:?}", res.as_ref().unwrap_err());
    }

    match res {
        Ok(tags) => Ok((StatusCode::OK, Json(tags))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }
}
