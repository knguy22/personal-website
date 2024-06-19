mod novel_entry;
mod import_csv;
mod db;

use std::error::Error;
use dotenv::dotenv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();
    let csv_file: String = "data.csv".to_string();
    let _ = import_csv::read_csv(&csv_file);
    let _ = db::init().await;
    Ok(())
}
