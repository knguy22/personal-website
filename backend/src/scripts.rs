use crate::db;
use crate::novel_entry::{NovelEntry, NovelTagsRecordParsed};
use crate::scraper::scrape_genres_and_tags;

use std::path::{Path, PathBuf};
use std::thread;
use std::time::Duration;

use anyhow::Result;
use clap::Parser;
use csv::Reader;
use sea_orm::DatabaseConnection;

#[derive(Parser)]
#[command(version, about, long_about = None)]
struct Cli {
    /// Drops everything currently in the table; this will not drop any newly imported novel entries
    #[clap(short, long, action, value_name = "BOOL")]
    drop_all_novels: bool,

    /// Manually fetches the novel tags by webscraping Novelupdates
    #[arg(short, long, action, value_name = "BOOL")]
    fetch_novel_tags: bool,

    /// Manually fetch a single novel by webscraping Novelupdates
    #[arg(short, long, value_name = "STRING")]
    single_fetch_novel_tags: Option<String>,

    /// Specify a url to fetch tags from if automatic parsing isn't working; a novel must also be specified
    #[arg(short, long, value_name = "URL")]
    url_single_fetch_novel_tags: Option<String>,

    /// Imports novel tags and genres from a csv file (see <https://github.com/shaido987/novel-dataset>)
    #[arg(short, long, value_name = "FILE")]
    import_novel_tags_csv: Option<PathBuf>,
}

pub async fn run_cli(conn: &DatabaseConnection) -> Result<()> {
    let cli = Cli::parse();

    if cli.drop_all_novels {
        db::drop_all_novels(conn).await?;
    }

    if cli.fetch_novel_tags {
        fetch_novel_tags(conn).await?;
    }

    if let Some(title) = cli.single_fetch_novel_tags {
        single_fetch_novel_tags(conn, &title, cli.url_single_fetch_novel_tags).await?;
    }

    if let Some(csv_file) = cli.import_novel_tags_csv {
        let rows = read_novel_tags_csv(&csv_file)?;
        db::update_novel_tags(conn, &rows).await?;
    }

    Ok(())
}

async fn fetch_novel_tags(conn: &DatabaseConnection) -> Result<()> {
    let novels = db::fetch_novel_entries(conn).await?;
    let mut modified_novels = Vec::new();
    println!("Attempting to fetch tags for {} novels...", novels.len());

    for novel in &novels {
        let scraped_tags = scrape_genres_and_tags(&novel.title, 5, None).await;
        match scraped_tags {
            Ok(new_tags) => {
                let new_novel = NovelEntry {
                    tags: new_tags,
                    ..novel.clone()
                };
                modified_novels.push(new_novel);
                println!("Success: [{}]", novel.title);
            },

            Err(e) => {
                println!("Failure: [{}], {}", novel.title, e);
                thread::sleep(Duration::from_secs(15));
            },
        }
    }

    db::update_novel_entries(conn, &modified_novels).await?;
    Ok(())
}

async fn single_fetch_novel_tags(conn: &DatabaseConnection, title: &str, url: Option<String>) -> Result<()> {
    println!("Attempting to fetch tags for [{title}]");

    let novel = db::fetch_single_novel(conn, title).await?;
    let scraped_tags = scrape_genres_and_tags(title, 2, url).await?;
    let new_novel = vec![NovelEntry {
        tags: scraped_tags,
        ..novel.clone()
    }];
    db::update_novel_entries(conn, &new_novel).await?;

    println!("Success: [{title}]");
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

fn read_novel_tags_csv(csv_file: &Path) -> Result<Vec<NovelTagsRecordParsed>> {
    let mut rdr = Reader::from_path(csv_file).unwrap();
    let mut data = Vec::new();

    let headers = rdr.headers()?;
    println!("Headers read: {headers:?}");

    for res in rdr.deserialize() {
        let t: NovelTagsCsvRecord;
        match res {
            Ok(r) => t = r,
            Err(err) => {
                println!("{err}");
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
fn strip_novel_tags(tags: &mut [String]) {
    for tag in tags {
        *tag = tag.replace('\"', "");
        *tag = tag.replace('#', "");
        *tag = tag.replace('[', "");
        *tag = tag.replace(']', "");
        *tag = tag.replace('\'', "");
        *tag = tag.replace('\"', "");
        *tag = tag.trim().to_string();
    }
}
