mod novel_entry;
mod import_csv;
mod db;
mod entity;

use std::error::Error;
use dotenv::dotenv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();
    let csv_file: String = "../data.csv".to_string();
    let rows = import_csv::read_csv(&csv_file)?;
    let db = db::init().await?;
    let fetch_res = db::fetch_novel_entries_from_table(&db).await?;
    println!("{} rows fetched", fetch_res.len());
    
    let _ = db::insert_novel_entries_into_table(&db, &rows).await;

    Ok(())
}
