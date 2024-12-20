use crate::novel_entry::{model_to_novel_entry, novel_entry_to_active_model, NovelEntry, Status, NovelTagsRecordParsed};
use crate::entity::{prelude::Novels, novels};
use std::{error::Error, env, time::Duration};

use chrono::Local;
use itertools::Itertools;
use sea_orm::TryIntoModel;
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

pub async fn init() -> Result<DatabaseConnection, Box<dyn Error>> {
    // init database
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    println!("Connecting to: {}", database_url);

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

pub async fn fetch_novel_entries(db: &DatabaseConnection) -> Result<Vec<NovelEntry>, Box<dyn Error>> {
    let models = Novels::find()
        .all(db)
        .await?;

    let mut novel_entries = Vec::new();
    for model in models {
        novel_entries.push(model_to_novel_entry(model));
    }
    Ok(novel_entries)
}

pub async fn insert_novel_entries(db: &DatabaseConnection, rows: &Vec<NovelEntry>) -> Result<(), Box<dyn Error>>{
    let mut to_insert = Vec::new();
    for row in rows {
        to_insert.push(novel_entry_to_active_model(row));
    }

    let _ = Novels::insert_many(to_insert).exec(db).await?;
    Ok(())
}

pub async fn update_novel_entries(db: &DatabaseConnection, rows: &Vec<NovelEntry>) -> Result<Vec<NovelEntry>, Box<dyn Error>> {
    let mut updated_novels: Vec<NovelEntry> = Vec::new();
    for row in rows.iter() {
        let model = Novels::find()
            .filter(novels::Column::Id.eq(row.id))
            .one(db)
            .await?;

        if let Some(model) = model {
            let mut active_model = model.into_active_model();
            active_model.country = Set(Some(row.country.clone()));
            active_model.title = Set(Some(row.title.clone()));
            active_model.chapter = Set(Some(row.chapter.clone()));
            active_model.rating = Set(Some(row.rating as i32));
            active_model.status = Set(Some(row.status.to_str()));
            active_model.tags = Set(serde_json::to_value(row.tags.clone()).unwrap());
            active_model.notes = Set(Some(row.notes.clone()));
            active_model.date_modified = Set(Local::now().naive_utc());
            active_model.date_started = Set(row.date_started.map(|date| date.naive_utc()));
            active_model.date_completed = Set(row.date_completed.map(|date| date.naive_utc()));

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

pub async fn update_novel_tags(db: &DatabaseConnection, rows: &Vec<NovelTagsRecordParsed>) -> Result<(), Box<dyn Error>> {
    let mut novels_updated = 0;

    for row in rows.iter() {
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
    println!("Updated {} novels", novels_updated);

    Ok(())
}

pub async fn drop_all_novels(db: &DatabaseConnection) -> Result<(), Box<dyn Error>> {
    let _ = Novels::delete_many().exec(db).await?;
    Ok(())
}

pub async fn delete_novel_entry(db: &DatabaseConnection, id: i32) -> Result<(), Box<dyn Error>> {
    let _ = Novels::delete_by_id(id).exec(db).await?;
    Ok(())
}

pub async fn create_empty_row(db: &DatabaseConnection) -> Result<NovelEntry, Box<dyn Error>> {
    let novel = NovelEntry {
        id: get_next_id(db).await?,
        country: String::new(),
        title: String::new(),
        chapter: String::new(),
        rating: 0,
        status: Status::Invalid,
        tags: Vec::new(),
        notes: String::new(),
        date_modified: Local::now().to_utc(),
        date_started: None,
        date_completed: None,
    };
    let model = novel_entry_to_active_model(&novel);
    let _ = model.insert(db).await?;

    Ok(novel)
}

pub async fn get_next_id(db: &DatabaseConnection) -> Result<i32, Box<dyn Error>> {
    let model = Novels::find()
        .order_by_desc(novels::Column::Id)
        .one(db)
        .await?;

    match model {
        Some(model) => Ok(model.id + 1),
        None => Ok(1),
    }
}