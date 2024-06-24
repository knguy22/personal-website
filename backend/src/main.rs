mod novel_entry;
mod import_csv;
mod db;
mod entity;

use std::{error::Error, env};

use axum::{
    response::{Html, IntoResponse, Json}, extract::State, Router, routing::{get, post}
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
    let conn = init().await.unwrap();
    let state = AppState { conn };
    let domain = env::var("DOMAIN").unwrap();

    // build our application with a route
    let app = Router::new()
        .route("/", get(main_handler))
        .route("/novels", get(novel_handler))
        .route("/api/update_novels", post(update_novels_handler))
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
    let novels = db::fetch_novel_entries(&state.conn).await.unwrap_or_default();
    Json(novels)
}

async fn update_novels_handler(state: State<AppState>, Json(rows): Json<Vec<novel_entry::NovelEntry>>) -> impl IntoResponse {
    let res = db::update_novel_entries(&state.conn, &rows).await;
    match res {
        Ok(()) => Json(format!(r#"{{"Success": true, "Rows": "{}"}}"#, rows.len())),
        Err(_) => Json(r#"{"Success": false}"#.to_string()),
    }
}

async fn init() -> Result<DatabaseConnection, Box<dyn Error>> {
    dotenv().ok();
    let csv_file: String = "../data.csv".to_string();
    let rows = import_csv::read_csv(&csv_file)?;
    let conn = db::init().await?;
    let fetch_res = db::fetch_novel_entries(&conn).await?;
    println!("{} rows fetched", fetch_res.len());
    
    let insert_res = db::insert_novel_entries(&conn, &rows).await;
    match insert_res {
        Err(e) => println!("{:?}", e),
        _ => (),
    }
    let _ = db::update_novel_entries(&conn, &rows).await;

    Ok(conn)
}
