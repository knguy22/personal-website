use crate::db;
use crate::novel_entry::Status;
use std::error::Error;
use std::collections::HashMap;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};

type ChapterCountBucket = (u32, u32);
const CHAPTER_COUNT_BUCKETS: [ChapterCountBucket; 6] = [
    (1, 20),
    (21, 50),
    (51, 80),
    (81, 150),
    (151, 400),
    (400, 10000),
];

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Stats {
    pub novel_count: u32,
    pub chapter_count: u32,
    pub average_rating: f32,
    pub novels_completed: u32,
    pub novels_not_started: u32,

    // each index corresponds to a rating = index + 1
    pub rating_dist: [u32; 10],

    // each entry in the map corresponds to a chapter count bucket
    pub chapter_dist: HashMap<String, u32>,
}

pub async fn get_stats(db: &DatabaseConnection) -> Result<Stats, Box<dyn Error>> {
    let novels = db::fetch_novel_entries(db).await?;
    let novel_count = novels.len() as u32;
    let chapter_count = novels.iter().map(|novel| novel.chapter.parse().unwrap_or(0)).sum();
    let novels_completed = novels.iter().filter(|novel| novel.status == Status::Completed).count() as u32;
    let novels_not_started = novels.iter().filter(|novel| novel.chapter.len() == 0).count() as u32;

    let rating_sum: u32 = novels.iter().map(|novel| novel.rating).sum();
    let non_zero_ratings = novels.iter().filter(|novel| novel.rating > 0).count();
    let average_rating = if non_zero_ratings > 0 {
        rating_sum as f32 / non_zero_ratings as f32
    } else {
        0.0
    };

    // count the frequency of each valid rating
    let mut rating_dist = [0; 10];
    for novel in &novels {
        if novel.rating > 0 {
            rating_dist[(novel.rating - 1) as usize] += 1;
        }
    }

    // count the frequency of each chapter count bucket
    let mut chapter_dist = HashMap::<ChapterCountBucket, u32>::new();
    for novel in &novels {
        let chapter_count = novel.chapter.parse::<u32>().unwrap_or(0);
        for (start, end) in &CHAPTER_COUNT_BUCKETS {
            if chapter_count >= *start && chapter_count <= *end {
                *chapter_dist.entry((*start, *end)).or_insert(0) += 1;
                break;
            }
        }
    }

    // convert the bucket keys to strings
    let chapter_dist = chapter_dist
        .into_iter()
        .map(|(k, v)| (k.0.to_string() + "-" + &k.1.to_string(), v))
        .collect();

    Ok(Stats {
        novel_count,
        chapter_count,
        average_rating,
        novels_completed,
        novels_not_started,
        rating_dist,
        chapter_dist,
    })
}