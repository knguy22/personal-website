use crate::db;
use std::error::Error;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};

#[derive(Copy, Clone, Debug, Serialize, Deserialize)]
pub struct Stats {
    pub novel_count: u32,
    pub chapter_count: u32,
}

pub async fn get_stats(db: &DatabaseConnection) -> Result<Stats, Box<dyn Error>> {
    let novels = db::fetch_novel_entries(db).await?;
    let novel_count = novels.len() as u32;
    let chapter_count = novels.iter().map(|novel| novel.chapter.parse().unwrap_or(0)).sum();

    Ok(Stats {
        novel_count,
        chapter_count,
    })
}