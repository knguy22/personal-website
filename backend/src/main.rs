mod db;
mod entity;
mod novel_entry;
mod scripts;
mod stats;

use std::{error::Error, env};

use axum::{
    response::{Html, IntoResponse, Json}, extract::State, Router, routing::{get, post, delete}, extract::Path
};
use dotenv::dotenv;
use sea_orm::DatabaseConnection;

// global state for routing
#[derive(Clone)]
struct AppState {
    conn: DatabaseConnection,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // initialize everything; run scripts if applicable
    let conn = init().await.unwrap();
    scripts::run_cli(&conn).await.unwrap();

    // build our application with a route
    let state = AppState { conn };
    let domain = env::var("DOMAIN").unwrap();
    let app = Router::new()
        .route("/", get(main_handler))
        .route("/api/novels", get(novel_handler))
        .route("/api/update_novels", post(update_novels_handler))
        .route("/api/create_novel", get(create_novel_row_handler))
        .route("/api/delete_novel/:id", delete(delete_novel_handler))
        .route("/api/novels_stats", get(get_novels_stats))
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

async fn novel_handler(state: State<AppState>) -> impl IntoResponse {
    println!("Fetching novels");
    let novels = db::fetch_novel_entries(&state.conn).await.unwrap_or_default();
    println!("Fetched novels size {}", novels.len());
    Json(novels)
}

async fn update_novels_handler(state: State<AppState>, Json(rows): Json<Vec<novel_entry::NovelEntry>>) -> impl IntoResponse {
    println!("Updating novels {}", rows.len());
    let res = db::update_novel_entries(&state.conn, &rows).await;
    match res {
        Ok(novels) => Json(novels),
        Err(_) => Json(Vec::new()),
    }
}

async fn create_novel_row_handler(state: State<AppState>) -> impl IntoResponse {
    println!("Creating novel row");
    let novel = db::create_empty_row(&state.conn).await.unwrap();
    Json(novel)
}

async fn delete_novel_handler(state: State<AppState>, Path(id): Path<i32>) -> impl IntoResponse {
    println!("Deleting novels");
    let res = db::delete_novel_entry(&state.conn, id).await;
    match res {
        Ok(()) => Json(r#"{"Success": true}"#.to_string()),
        Err(_) => Json(r#"{"Success": false}"#.to_string()),
    }
}

async fn get_novels_stats(state: State<AppState>) -> impl IntoResponse {
    println!("Getting novels stats");
    let stats = stats::get_stats(&state.conn).await.unwrap();
    Json(stats)
}

async fn init() -> Result<DatabaseConnection, Box<dyn Error>> {
    dotenv().ok();
    let conn = db::init().await?;

    Ok(conn)
}
