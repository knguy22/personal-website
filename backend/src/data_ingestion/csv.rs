use crate::novel_entry::{NovelEntry, NovelTagsRecordParsed};

use std::path::Path;

use anyhow::Result;
use csv::Reader;

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

pub fn read_novel_tags_csv(csv_file: &Path) -> Result<Vec<NovelTagsRecordParsed>> {
    let mut rdr = Reader::from_path(csv_file)?;
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