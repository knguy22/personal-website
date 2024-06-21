mod novel_entry;
mod import_csv;
mod db;
mod entity;

use std::{error::Error, os::unix::net::SocketAddr};
use dotenv::dotenv;

use axum::{
    response::{self, Html, IntoResponse, Json}, routing::get, Router
};

use novel_entry::NovelEntry;

#[tokio::main]
async fn main() {
    // build our application with a route
    let app = Router::new()
        .route("/", get(main_handler))
        .route("/novels", get(novel_handler));

    // run it
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn main_handler() -> Html<&'static str> {
    Html("<h1>Hello, World!</h1>")
}

async fn novel_handler() -> impl IntoResponse {
    let novels = read_csv().await.unwrap_or_default();
    Json(novels)
}

async fn read_csv() -> Result<Vec<NovelEntry>, Box<dyn Error>> {
    dotenv().ok();
    let csv_file: String = "../data.csv".to_string();
    let rows = import_csv::read_csv(&csv_file)?;
    let db = db::init().await?;
    let fetch_res = db::fetch_novel_entries_from_table(&db).await?;
    println!("{} rows fetched", fetch_res.len());
    
    let _ = db::insert_novel_entries_into_table(&db, &rows).await;

    Ok(fetch_res)
}
