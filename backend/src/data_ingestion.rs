mod browser;
pub mod novelupdates;
pub mod royalroad;
pub mod csv;

use crate::{db, novel_entry::Provider};
use crate::novel_entry::NovelEntry;

use anyhow::{Error, Result};
use itertools::Itertools;
use sea_orm::DatabaseConnection;

use std::{thread, time::Duration};

pub async fn fetch_novel_tags(conn: &DatabaseConnection) -> Result<()> {
    let novels = db::fetch_novel_entries(conn).await?;
    let novels_to_fetch = novels.iter()
        .filter(|novel| novel.tags.is_empty())
        .filter(|novel| novel.provider.is_some())
        .collect_vec();
    println!("Fetching tags for {} novels out of {}...", novels_to_fetch.len(), novels.len());

    let mut modified_novels = Vec::new();
    for novel in novels_to_fetch {
        // scrape as required
        let scraped_tags = match novel.provider.as_ref().unwrap() {
            Provider::NovelUpdates => novelupdates::scrape_genres_and_tags(&novel.title, 5, None),
            Provider::RoyalRoad => royalroad::scrape_tags(&novel.title, 3),
        };

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
                println!("Failure:\n  Novel: {}\n  Provider: {:?}\n  Error: {}",
                novel.title, novel.provider, e);
                thread::sleep(Duration::from_secs(15));
            },
        }
    }

    db::update_novel_entries(conn, &modified_novels).await?;
    println!("Finished modifying {} novels", modified_novels.len());
    Ok(())
}

pub async fn single_fetch_novel_tags(conn: &DatabaseConnection, title: &str, url: Option<String>) -> Result<()> {
    println!("Attempting to fetch tags for [{title}]");

    let novel = db::fetch_single_novel(conn, title).await?;
    let scraped_tags = match novel.provider {
        Some(Provider::NovelUpdates) => novelupdates::scrape_genres_and_tags(title, 2, url)?,
        Some(Provider::RoyalRoad) => royalroad::scrape_tags(title, 3)?,
        None => Err(Error::msg(format!("Novel doesn't contain a provider: {}", novel.title)))?
    };
    let new_novel = vec![NovelEntry {
        tags: scraped_tags,
        ..novel.clone()
    }];
    db::update_novel_entries(conn, &new_novel).await?;

    println!("Success: [{title}]");
    Ok(())
}
