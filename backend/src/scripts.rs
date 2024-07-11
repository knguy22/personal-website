use crate::novel_entry::{Status, NovelEntry, NovelTagsRecordParsed};
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
    #[arg(long, value_name = "FILE")]
    insert_novels_csv: Option<PathBuf>,

    /// Imports and updates novel entries from a csv file
    #[arg(short, long, value_name = "FILE")]
    update_novels_csv: Option<PathBuf>,

    /// Imports novel tags and genres from a csv file (see https://github.com/shaido987/novel-dataset)
    #[arg(long, value_name = "FILE")]
    import_novel_tags_csv: Option<PathBuf>,
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

    if cli.import_novel_tags_csv.is_some() {
        let rows = read_novel_tags_csv(&cli.import_novel_tags_csv.unwrap().to_str().unwrap().to_string()).await?;
        let _ = db::update_novel_tags(conn, &rows).await?;
    }

    Ok(())
}


type CsvRecord = (Option<String>, Option<String>, Option<String>, Option<u32>, Option<String>, Option<String>, Option<String>);
async fn read_csv(mut start_id: i32, csv_file: &String) -> Result<Vec<NovelEntry>, Box<dyn Error>> {
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

// id,name,assoc_names,original_language,authors,genres,tags,start_year,licensed,original_publisher,english_publisher,complete_original,chapters_original_current,complete_translated,release_freq,activity_week_rank,activity_month_rank,activity_all_time_rank,on_reading_lists,reading_list_month_rank,reading_list_all_time_rank,rating,rating_votes,related_series_ids,recommended_series_ids,recommendation_list_ids,chapter_latest_translated
#[derive(Debug, serde::Deserialize, Eq, PartialEq)]
struct NovelTagsCsvRecord {
    id: Option<i32>,
    name: Option<String>,
    assoc_names: Option<String>,
    original_language: Option<String>,
    authors: Option<String>,
    genres: Option<String>,
    tags: Option<String>,
    start_year: Option<String>,
    licensed: Option<String>,
    original_publisher: Option<String>,
    english_publisher: Option<String>,
    complete_original: Option<String>,
    chapters_original_current: Option<String>,
    complete_translated: Option<String>,
    release_freq: Option<String>,
    activity_week_rank: Option<String>,
    activity_month_rank: Option<String>,
    activity_all_time_rank: Option<String>,
    on_reading_lists: Option<String>,
    reading_list_month_rank: Option<String>,
    reading_list_all_time_rank: Option<String>,
    rating: Option<String>,
    rating_votes: Option<String>,
    related_series_ids: Option<String>,
    recommended_series_ids: Option<String>,
    recommendation_list_ids: Option<String>,
    chapter_latest_translated: Option<String>,
}

async fn read_novel_tags_csv(csv_file: &String) -> Result<Vec<NovelTagsRecordParsed>, Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path(csv_file).unwrap();
    let mut data = Vec::new();

    let headers = rdr.headers()?;
    println!("Headers read: {:?}", headers);

    for res in rdr.deserialize() {
        let t: NovelTagsCsvRecord;
        match res {
            Ok(r) => t = r,
            Err(err) => {
                println!("{}", err);
                continue
            },
        }
        
        // push both tags and genre into the final tags
        let mut parsed = NovelTagsRecordParsed {
            title: t.name.unwrap_or_default(),
            tags: NovelEntry::parse_tags(&t.tags.unwrap_or_default()),
        };
        parsed.tags.append(&mut NovelEntry::parse_tags(&t.genres.unwrap_or_default()));
        strip_novel_tags(&mut parsed.tags);

        data.push(parsed);
    }

    println!("Entries read: {}", data.len());
    Ok(data)
}

// strip extra space on edges, strip quotes, strip #, strip []
fn strip_novel_tags(tags: &mut Vec<String>) {
    for i in 0..tags.len() {
        tags[i] = tags[i].replace("\"", "");
        tags[i] = tags[i].replace("#", "");
        tags[i] = tags[i].replace("[", "");
        tags[i] = tags[i].replace("]", "");
        tags[i] = tags[i].replace("'", "");
        tags[i] = tags[i].replace("\"", "");
        tags[i] = tags[i].trim().to_string();
    }
}
