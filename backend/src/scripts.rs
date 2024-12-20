use crate::novel_entry::{NovelEntry, NovelTagsRecordParsed};
use crate::db;

use std::error::Error;
use std::path::PathBuf;

use clap::Parser;
use csv;
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

    if cli.import_novel_tags_csv.is_some() {
        let rows = read_novel_tags_csv(&cli.import_novel_tags_csv.unwrap().to_str().unwrap().to_string()).await?;
        let _ = db::update_novel_tags(conn, &rows).await?;
    }

    Ok(())
}

/*
The novel tags come from the novelupdates data collected in this repository: https://github.com/shaido987/novel-dataset.
*/
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
