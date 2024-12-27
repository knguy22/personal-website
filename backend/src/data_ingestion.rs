mod browser;
pub mod novelupdates;
pub mod royalroad;
pub mod csv;

use crate::{db, novel_entry::Provider};
use crate::novel_entry::NovelEntry;

use anyhow::{Error, Result};
use sea_orm::DatabaseConnection;

use std::{thread, time::Duration};

pub async fn fetch_novel_tags(conn: &DatabaseConnection) -> Result<()> {
    let novels = db::fetch_novel_entries(conn).await?;
    let mut modified_novels = Vec::new();
    println!("Attempting to fetch tags for {} novels...", novels.len());

    for novel in &novels {
        // don't do redundant work
        if !novel.tags.is_empty() {
            continue;
        }

        // scrape as required
        let scraped_tags = match novel.provider {
            Some(Provider::Novelupdates) => novelupdates::scrape_genres_and_tags(&novel.title, 5, None).await,
            Some(Provider::Royalroad) => royalroad::scrape_tags(&novel.title, 3).await,
            None => continue,
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
                println!(
                r#"Failure:
                  * Novel: {},  
                  * Provider: {:?}
                  * Error: {}"#, 
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
        Some(Provider::Novelupdates) => novelupdates::scrape_genres_and_tags(title, 2, url).await?,
        Some(Provider::Royalroad) => royalroad::scrape_tags(title, 3).await?,
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
