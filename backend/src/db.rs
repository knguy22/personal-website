use crate::entity::{novels, prelude::Novels};
use crate::novel_entry::{model_to_novel_entry, novel_entry_to_active_model, NovelEntry, NovelTagsRecordParsed};
use std::{env, time::Duration};

use anyhow::{Result, Error};
use chrono::Local;
use itertools::Itertools;
use sea_orm::{TryIntoModel, Unchanged};
use serde_json::from_value;
use sea_orm::{
    ActiveModelTrait,
    ColumnTrait,
    ConnectOptions,
    entity::Set,
    Database,
    DatabaseConnection,
    EntityTrait,
    IntoActiveModel,
    QueryFilter,
    QueryOrder,
};

pub async fn init() -> Result<DatabaseConnection> {
    // init database
    let database_url = env::var("DATABASE_URL")?;
    println!("Connecting to: {database_url}");

    let mut conn_opt = ConnectOptions::new(database_url);
    conn_opt.max_connections(5)
            .min_connections(5)
            .connect_timeout(Duration::from_secs(5))
            .acquire_timeout(Duration::from_secs(5))
            .idle_timeout(Duration::from_secs(5))
            .max_lifetime(Duration::from_secs(5))
            .set_schema_search_path("public");
    let db = Database::connect(conn_opt).await?;
    println!("Connected");

    Ok(db)
}

pub async fn fetch_novel_entries(db: &DatabaseConnection) -> Result<Vec<NovelEntry>> {
    let models = Novels::find()
        .all(db)
        .await?;

    let mut novel_entries = Vec::new();
    for model in models {
        novel_entries.push(model_to_novel_entry(model));
    }
    Ok(novel_entries)
}

pub async fn fetch_single_novel(db: &DatabaseConnection, title: &str) -> Result<NovelEntry> {
    let query = Novels::find()
        .filter(novels::Column::Title.eq(title))
        .one(db)
        .await?;
    match query {
        Some(model) => Ok(model_to_novel_entry(model)),
        None => Err(Error::msg(format!{"Novel not found in db: {title}"}))
    }
}

pub async fn insert_novel_entries(db: &DatabaseConnection, rows: &Vec<NovelEntry>) -> Result<()>{
    let mut to_insert = Vec::new();
    for row in rows {
        to_insert.push(novel_entry_to_active_model(row));
    }

    let _ = Novels::insert_many(to_insert).exec(db).await?;
    Ok(())
}

#[allow(clippy::cast_possible_wrap)]
pub async fn update_novel_entries(db: &DatabaseConnection, rows: &[NovelEntry]) -> Result<Vec<NovelEntry>> {
    let mut updated_novels: Vec<NovelEntry> = Vec::new();
    for row in rows {
        let model = Novels::find()
            .filter(novels::Column::Id.eq(row.id))
            .one(db)
            .await?;

        if model.is_some() {
            // create the active model; everything should be updated already except for date_modified
            // date_modified is handeled by the backend to ensure time consistency
            let mut active_model = novel_entry_to_active_model(row).reset_all();
            active_model.date_modified = Set(Local::now().naive_utc());
            active_model.id = Unchanged(row.id);

            // update the results
            updated_novels.push(model_to_novel_entry(active_model.clone().try_into_model()?));

            // update the database 
            active_model.update(db).await?;
        }
        else {
            updated_novels.push(row.clone());
            Novels::insert(novel_entry_to_active_model(row)).exec(db).await?;
        }
    }

    Ok(updated_novels)
}

pub async fn update_novel_tags(db: &DatabaseConnection, rows: &[NovelTagsRecordParsed]) -> Result<()> {
    let mut novels_updated = 0;

    for row in rows {
        let model = Novels::find()
            .filter(novels::Column::Title.eq(&row.title))
            .one(db)
            .await?;
        
        if let Some(model) = model {
            novels_updated += 1;

            // add the new tags to the old ones
            let mut new_tags: Vec<String> = from_value(model.tags.clone()).expect("update_novel_tags: JSON value is not an array");
            new_tags.extend(row.tags.clone());

            // make tags unique
            new_tags = new_tags.into_iter().unique().collect();

            // update the model
            let mut active_model = model.into_active_model();
            active_model.tags = Set(serde_json::to_value(new_tags).unwrap());
            active_model.update(db).await?;
        }
    }
    println!("Updated {novels_updated} novels");

    Ok(())
}

pub async fn drop_all_novels(db: &DatabaseConnection) -> Result<()> {
    let _ = Novels::delete_many().exec(db).await?;
    Ok(())
}

pub async fn delete_novel_entry(db: &DatabaseConnection, id: i32) -> Result<()> {
    let _ = Novels::delete_by_id(id).exec(db).await?;
    Ok(())
}

pub async fn create_empty_row(db: &DatabaseConnection) -> Result<NovelEntry> {
    let novel = NovelEntry::empty(get_next_id(db).await?);
    let model = novel_entry_to_active_model(&novel);
    let _ = model.insert(db).await?;

    Ok(novel)
}

pub async fn get_next_id(db: &DatabaseConnection) -> Result<i32> {
    let model = Novels::find()
        .order_by_desc(novels::Column::Id)
        .one(db)
        .await?;

    match model {
        Some(model) => Ok(model.id + 1),
        None => Ok(1),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dotenv::dotenv;

    #[tokio::test]
    #[ignore]
    async fn test_init() {
        dotenv().ok();
        let _db = init().await.unwrap();
    }
}