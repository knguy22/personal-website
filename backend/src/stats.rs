use crate::db;
use crate::novel_entry::NovelEntry;
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

pub async fn get_stats(db: &DatabaseConnection) -> Result<Stats, Box<dyn Error>> {
    let novels = db::fetch_novel_entries(db).await?;
    let novel_count = novels.len() as u32;
    let chapter_count = novels.iter().map(|novel| novel.chapter.parse().unwrap_or(0)).sum();
    let volumes_completed: u32 = novels.iter().map(|novel| completed_volume(&novel.chapter)).sum();
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

// volumes without any trailing information can be naively counted fully
// novels with volumes can take the form of v{number} or v{number}{trailing info}
// volumes with trailing info can only count of to {number - 1} completed
// Ex: V11 = 11 volumes completed
// Ex: V11C3 = 10 volumes completed
fn completed_volume(chapter: &str) -> u32 {
    // check if the novel contains volumes
    if !chapter.starts_with("v") && !chapter.starts_with("V") {
        return 0
    }

    // check if the rest of the chapter can be parsed as an integer
    // if so, that means there is no trailing information
    let volumes = chapter[1..].parse::<u32>().unwrap_or(u32::MAX);
    if volumes != u32::MAX {
        return volumes;
    }

    // handle the case where there is trailing information
    // the last novel isn't completed
    let mut volumes = 0;
    for c in chapter[1..].chars() {
        if c.is_numeric() {
            volumes *= 10;
            volumes += c.to_digit(10).unwrap();
        } else {
            break;
        }
    }

    volumes - 1
}

fn find_status_dist(novels: &[NovelEntry]) -> HashMap<String, u32> {
    let mut status_dist = HashMap::<String, u32>::new();
    for novel in novels {
        let status = novel.status.to_string();
        *status_dist.entry(status).or_insert(0) += 1;
    }
    status_dist
}

fn find_chapter_country_dist(novels: &[NovelEntry]) -> (HashMap<String, u32>, HashMap<String, u32>) {
    fn dist_to_string(low: u32, high: u32) -> String {
        low.to_string() + "-" + &high.to_string()
    }

    let mut chapter_dist = HashMap::<ChapterCountBucket, u32>::new();
    let mut country_dist = HashMap::<String, u32>::new();
    for novel in novels {
        // count the frequency of each chapter count bucket
        let chapter_count = novel.chapter.parse::<u32>().unwrap_or(0);
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
    let last_value = chapter_dist.remove(&last_key).unwrap();
    chapter_dist.insert(last_bucket.0.to_string() + "+", last_value);

    (country_dist, chapter_dist)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_completed_volume() {
        assert_eq!(completed_volume("v0"), 0);
        assert_eq!(completed_volume("v1"), 1);
        assert_eq!(completed_volume("v10"), 10);
        assert_eq!(completed_volume("v11"), 11);
        assert_eq!(completed_volume("v11C3"), 10);
        assert_eq!(completed_volume("v22C3P2"), 21);
    }
}
