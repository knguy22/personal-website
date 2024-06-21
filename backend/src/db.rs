use std::{error::Error, env, time::Duration};
use crate::novel_entry::{NovelEntry, Chapters, Status};
use crate::entity::{novels, prelude::Novels};
use sea_orm::{ConnectOptions, Database, DatabaseConnection, EntityTrait, IntoActiveModel, JsonValue};

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

pub async fn fetch_novel_entries_from_table(db: &DatabaseConnection) -> Result<Vec<NovelEntry>, Box<dyn Error>> {
    let models = Novels::find()
        .all(db)
        .await?;

    let mut novel_entries = Vec::new();
    for model in models {
        novel_entries.push(model_to_novel_entry(model));
    }
    Ok(novel_entries)
}

pub async fn insert_novel_entries_into_table(db: &DatabaseConnection, rows: &Vec<NovelEntry>) -> Result<(), Box<dyn Error>>{
    let mut to_insert = Vec::new();
    for row in rows {
        to_insert.push(novel_entry_to_model(row));
    }

    let _ = Novels::insert_many(to_insert).exec(db).await?;
    Ok(())
}

fn novel_entry_to_model(novel: &NovelEntry) -> novels::ActiveModel {
    novels::Model { 
        country: Some(novel.country.clone()), 
        title: novel.title.clone(), 
        chapter: Some(novel.chapter.to_str()), 
        rating: Some(novel.rating as i32), 
        status: Some(novel.status.to_str()), 
        tags: serde_json::to_value(novel.tags.clone()).unwrap(),
        notes: Some(novel.notes.clone()), 
        date_modified: novel.date_modified.naive_utc(),
    }.into_active_model()
}

fn model_to_novel_entry(model: novels::Model) -> NovelEntry {
    NovelEntry {
        country: model.country.unwrap_or_default(),
        title: model.title.clone(), 
        chapter: Chapters::new(&model.chapter.unwrap_or_default()),
        rating: model.rating.unwrap_or_default() as u32,
        status: Status::new(&model.status.unwrap_or_default()),
        tags: json_value_to_vec_str(&model.tags).unwrap_or_default(),
        notes: model.notes.unwrap_or_default(), 
        date_modified: model.date_modified.and_utc(),
    }
}

fn json_value_to_vec_str(val: &JsonValue) -> Result<Vec<String>, Box<dyn Error>> {
    match val {
        JsonValue::Array(arr) => {
            let mut vec = Vec::new();
            for item in arr {
                if let JsonValue::String(s) = item {
                    vec.push(s.clone());
                }
                else {
                    return Err("Not all elements in JSON value are strings".into())
                }
            }
            Ok(vec)
        }
        _ => Err("The JSON value is not an array".into()),
    }
}
