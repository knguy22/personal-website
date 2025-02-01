use crate::{db, novel_entry::NovelSubsets};
use crate::novel_entry::NovelEntry;

use std::collections::HashMap;

use anyhow::Result;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};

type ChapterCountBucket = (u32, u32);
const CHAPTER_COUNT_BUCKETS: [ChapterCountBucket; 6] = [
    (1, 20),
    (21, 50),
    (51, 80),
    (81, 150),
    (151, 400),
    (400, u32::MAX),
];

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Stats {
    pub novel_count: u32,
    pub chapter_count: u32,
    pub average_rating: f32,
    pub volumes_completed: u32,
    pub novels_not_started: u32,

    // each index corresponds to a rating = index + 1
    pub rating_dist: [u32; 10],

    // each entry in the map corresponds to a status
    pub status_dist: HashMap<String, u32>,

    // each entry in the map corresponds to a chapter count bucket
    pub chapter_dist: HashMap<String, u32>,

    // each entry in the map corresponds to a country count bucket
    pub country_dist: HashMap<String, u32>,
}

#[allow(clippy::cast_precision_loss)]
pub async fn get_stats(db: &DatabaseConnection) -> Result<Stats> {
    let novels = db::fetch_novel_entries(db, NovelSubsets::All).await?;
    let novel_count = u32::try_from(novels.len())?;
    let chapter_count = novels.iter().map(|novel| novel.chapter.count_chapters()).sum();
    let volumes_completed: u32 = novels.iter().map(|novel| novel.chapter.count_volumes()).sum();
    let novels_not_started = u32::try_from(novels.iter().filter(|novel| novel.chapter.unstarted()).count())?;

    let rating_sum: u32 = novels.iter().map(|novel| novel.rating).sum();
    let non_zero_ratings = novels.iter().filter(|novel| novel.rating > 0).count();
    let average_rating = if non_zero_ratings > 0 {
        rating_sum as f32 /  non_zero_ratings as f32
    } else {
        0.0
    };

    // count the frequency of each valid rating
    let mut rating_dist = [0; 10];
    for novel in &novels {
        if novel.rating == 0 {
            continue;
        }
        if let Some(rating_count) = rating_dist.get_mut((novel.rating - 1) as usize) {
            *rating_count += 1;
        }
    }

    let status_dist = find_status_dist(&novels);
    let (country_dist, chapter_dist) = find_chapter_country_dist(&novels);

    Ok(Stats {
        novel_count,
        chapter_count,
        average_rating,
        volumes_completed,
        novels_not_started,
        rating_dist,
        status_dist,
        chapter_dist,
        country_dist,
    })
}

fn find_status_dist(novels: &[NovelEntry]) -> HashMap<String, u32> {
    let mut status_dist = HashMap::<String, u32>::new();
    for novel in novels {
        let status = match &novel.status {
            Some(s) => s.to_string(),
            None => "Unselected".to_string(),
        };
        *status_dist.entry(status).or_insert(0) += 1;
    }
    status_dist
}

fn find_chapter_country_dist(novels: &[NovelEntry]) -> (HashMap<String, u32>, HashMap<String, u32>) {
    fn dist_to_string(low: u32, high: u32) -> String {
        format!("{low}-{high}")
    }

    let mut chapter_dist = HashMap::<ChapterCountBucket, u32>::new();
    let mut country_dist = HashMap::<String, u32>::new();
    for novel in novels {
        // count the frequency of each chapter count bucket
        let chapter_count = novel.chapter.count_chapters();
        for (start, end) in &CHAPTER_COUNT_BUCKETS {
            if chapter_count >= *start && chapter_count <= *end {
                *chapter_dist.entry((*start, *end)).or_insert(0) += 1;
                break;
            }
        }

        // count the frequency of each country
        let country = novel.country.to_lowercase();
        if !country.is_empty() {
            *country_dist.entry(country).or_insert(0) += 1;
        }
    }

    // convert the bucket keys to strings
    let mut chapter_dist: HashMap<String, u32> = chapter_dist
        .into_iter()
        .map(|(k, v)| (dist_to_string(k.0, k.1), v))
        .collect();

    // change the largest key to not include the higher bound
    let last_bucket = CHAPTER_COUNT_BUCKETS[CHAPTER_COUNT_BUCKETS.len() - 1];
    let last_key = dist_to_string(last_bucket.0, last_bucket.1);
    let last_value = chapter_dist.remove(&last_key).expect("chapter_dist should contain the last key");
    chapter_dist.insert(format!("{}+", last_bucket.0), last_value);

    (country_dist, chapter_dist)
}
