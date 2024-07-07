use crate::novel_entry::{Status, NovelEntry};
use crate::db;

use std::error::Error;
use std::path::PathBuf;

use clap::Parser;
use csv;
use chrono::Local;
use sea_orm::DatabaseConnection;

#[derive(Parser)]
#[command(version, about, long_about = None)]
struct Cli {
    /// Drops everything currently in the table; this will not drop any newly imported novel entries
    #[clap(long, short, action)]
    drop_all_novels: bool,

    /// Imports and inserts new novel entries from a csv file
    #[arg(short, long, value_name = "FILE")]
    insert_novels_csv: Option<PathBuf>,

    /// Imports and updates novel entries from a csv file
    #[arg(short, long, value_name = "FILE")]
    update_novels_csv: Option<PathBuf>,
}

pub async fn run_cli(conn: &DatabaseConnection) -> Result<(), Box<dyn Error>> {
    let cli = Cli::parse();

    if cli.drop_all_novels {
        db::drop_all_novels(conn).await?;
    }

    if cli.insert_novels_csv.is_some() {
        let start_id = db::get_next_id(conn).await?;
        let rows = read_csv(start_id,&cli.insert_novels_csv.unwrap().to_str().unwrap().to_string()).await?;
        let _ = db::insert_novel_entries(conn, &rows).await?;
    }

    if cli.update_novels_csv.is_some() {
        let rows = read_csv(0, &cli.update_novels_csv.unwrap().to_str().unwrap().to_string()).await?;
        let _ = db::update_novel_entries(conn, &rows).await?;
    }

    Ok(())
}


type CsvRecord = (Option<String>, Option<String>, Option<String>, Option<u32>, Option<String>, Option<String>, Option<String>);
pub async fn read_csv(mut start_id: i32, csv_file: &String) -> Result<Vec<NovelEntry>, Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path(csv_file).unwrap();
    let mut data = Vec::new();

    let headers = rdr.headers()?;
    println!("Headers read: {:?}", headers);

    for res in rdr.deserialize() {
        let t: CsvRecord;
        match res {
            Ok(r) => t = r,
            Err(err) => {
                println!("{}", err);
                continue
            },
        }
        
        let record = NovelEntry{
            id: start_id,
            country: t.0.unwrap_or_default(),
            title: t.1.unwrap_or_default(),
            chapter: t.2.unwrap_or_default(),
            rating: t.3.unwrap_or_default(),
            status: Status::new(&t.4.unwrap_or_default()),
            tags: NovelEntry::parse_tags(&t.5.unwrap_or_default()),
            notes: t.6.unwrap_or_default(),
            date_modified: Local::now().to_utc(),
        };

        if !record.is_empty() {
            data.push(record);
        }

        start_id += 1;
    }

    println!("Entries read: {}", data.len());
    Ok(data)
}
