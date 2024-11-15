mod db;
mod entity;
mod novel_entry;
mod scripts;
mod stats;

use std::{env, error::Error, sync::Arc};

use axum::{
    response::{Html, IntoResponse, Json}, extract::State, http::StatusCode, Router, routing::{get, post, delete}, extract::Path
};
use dotenv::dotenv;
use itertools::Itertools;
use rand::{rngs::StdRng, seq::SliceRandom, SeedableRng};
use sea_orm::DatabaseConnection;
use tokio::sync::Mutex;

// global state for routing
#[derive(Clone)]
struct AppState {
    conn: DatabaseConnection,
    rng: Arc<Mutex<StdRng>>
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // initialize everything; run scripts if applicable
    let conn = init().await.unwrap();
    scripts::run_cli(&conn).await.unwrap();
    let rng = Arc::new(Mutex::new(StdRng::from_entropy()));

    // build our application with a route
    let state = AppState { conn, rng };
    let domain = env::var("DOMAIN").unwrap();
    let app = Router::new()
        .route("/", get(main_handler))
        .route("/api/novels", get(novel_handler))
        .route("/api/update_novels", post(update_novels_handler))
        .route("/api/create_novel", get(create_novel_row_handler))
        .route("/api/delete_novel/:id", delete(delete_novel_handler))
        .route("/api/novels_stats", get(get_novels_stats))
        .route("/api/random_novels/:num_novels", get(get_random_novels))
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

// all handlers must:
// return a non-null JSON
// return a status code (can be implicit)

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
        Ok(novels) => Ok((StatusCode::CREATED, Json(novels))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }
}

async fn create_novel_row_handler(state: State<AppState>) -> impl IntoResponse {
    println!("Creating novel row");
    let novel = db::create_empty_row(&state.conn).await.unwrap();
    Json(novel)
}

type DeleteNovelResponse = Result<(StatusCode, Json<i32>), (StatusCode, Json<String>)>;
async fn delete_novel_handler(state: State<AppState>, Path(id): Path<i32>) -> DeleteNovelResponse{
    println!("Deleting novels");
    let res = db::delete_novel_entry(&state.conn, id).await;
    match res {
        Ok(()) => Ok((StatusCode::OK, Json(id))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(e.to_string()))),
    }
}

async fn get_novels_stats(state: State<AppState>) -> impl IntoResponse {
    println!("Getting novels stats");
    let stats = stats::get_stats(&state.conn).await.unwrap();
    Json(stats)
}

async fn get_random_novels(state: State<AppState>, Path(num_novels): Path<usize>) -> impl IntoResponse {
    println!("Fetching random novels: {num_novels}");

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

async fn init() -> Result<DatabaseConnection, Box<dyn Error>> {
    dotenv().ok();
    let conn = db::init().await?;

    Ok(conn)
}
