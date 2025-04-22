mod browser;
pub mod novelupdates;
pub mod royalroad;
pub mod csv;

use crate::db::{self, UpdateDateModified};
use crate::novel_entry::{NovelEntry, NovelSubsets, Provider};

use anyhow::{Error, Result};
use itertools::Itertools;
use sea_orm::DatabaseConnection;
use tokio::time::sleep;

use std::time::Duration;

pub async fn fetch_novel_tags(conn: &DatabaseConnection, reset_novels: bool) -> Result<()> {
    let novels = db::fetch_novel_entries(conn, NovelSubsets::All).await?;
    let novels_to_fetch = novels.iter()
        .filter(|novel| novel.tags.is_empty() || reset_novels)
        .filter(|novel| novel.provider.is_some())
        .collect_vec();
    println!("Fetching tags for {} novels out of {}...", novels_to_fetch.len(), novels.len());

    let mut modified_novels = Vec::new();
    for (idx, novel) in novels_to_fetch.into_iter().enumerate() {
        // scrape as required
        let scraped_tags = match novel.provider.as_ref().expect("novels without providers should not be here") {
            Provider::NovelUpdates => novelupdates::scrape_genres_and_tags(&novel.title, 5, None).await,
            Provider::RoyalRoad => royalroad::scrape_tags(&novel.title, 3).await,
        };

        match scraped_tags {
            Ok(new_tags) => {
                // only update if the tags have been modified
                // this prevents updating `date_modified` unnecessarily
                if new_tags == novel.tags {
                    println!("{}. Unmodified: [{}]", idx + 1, novel.title);
                    continue;
                }

                let new_novel = NovelEntry {
                    tags: new_tags,
                    ..novel.clone()
                };
                modified_novels.push(new_novel);
                println!("{}. Success: [{}]", idx + 1, novel.title);
            },

            Err(e) => {
                println!("Failure:\n  Novel: {}\n  Provider: {:?}\n  Error: {}",
                novel.title, novel.provider, e);
                sleep(Duration::from_secs(15)).await;
            },
        }
    }

    db::update_novel_entries(conn, &modified_novels, UpdateDateModified::False).await?;
    println!("Finished modifying {} novels", modified_novels.len());
    Ok(())
}

pub async fn single_fetch_novel_tags(conn: &DatabaseConnection, title: &str, url: Option<String>) -> Result<()> {
    println!("Attempting to fetch tags for [{title}]");

    let novel = db::fetch_single_novel(conn, title).await?;
    let scraped_tags = match novel.provider {
        Some(Provider::NovelUpdates) => novelupdates::scrape_genres_and_tags(title, 2, url).await?,
        Some(Provider::RoyalRoad) => royalroad::scrape_tags(title, 3).await?,
        None => Err(Error::msg(format!("Novel doesn't contain a provider: {}", novel.title)))?
    };
    let new_novel = [NovelEntry {
        tags: scraped_tags,
        ..novel.clone()
    }];
    db::update_novel_entries(conn, &new_novel, UpdateDateModified::False).await?;

    println!("Success: [{title}]");
    Ok(())
}
