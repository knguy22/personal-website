mod novel_entry;
mod import_csv;
mod db;
mod entity;

use std::{error::Error, env};
use dotenv::dotenv;

use axum::{
    response::{Html, IntoResponse, Json}, extract::State, Router, routing::get
};
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
    let novels = db::fetch_novel_entries_from_table(&state.conn).await.unwrap_or_default();
    Json(novels)
}

async fn init() -> Result<DatabaseConnection, Box<dyn Error>> {
    dotenv().ok();
    let csv_file: String = "../data.csv".to_string();
    let rows = import_csv::read_csv(&csv_file)?;
    let conn = db::init().await?;
    let fetch_res = db::fetch_novel_entries_from_table(&conn).await?;
    println!("{} rows fetched", fetch_res.len());
    
    let insert_res = db::insert_novel_entries_into_table(&conn, &rows).await;
    match insert_res {
        Err(e) => println!("{:?}", e),
        _ => (),
    }

    Ok(conn)
}
