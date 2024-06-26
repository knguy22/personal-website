use crate::novel_entry::{model_to_novel_entry, novel_entry_to_active_model, NovelEntry};
use crate::entity::{prelude::Novels, novels};
use std::{error::Error, env, time::Duration};
use sea_orm::{
    ActiveModelTrait,
    ColumnTrait,
    ConnectOptions,
    entity::Set,
    Database,
    DatabaseConnection,
    EntityTrait,
    IntoActiveModel,
    QueryFilter};

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

pub async fn update_novel_entries(db: &DatabaseConnection, rows: &Vec<NovelEntry>) -> Result<(), Box<dyn Error>> {
    for row in rows.iter() {
        let model = Novels::find()
            .filter(novels::Column::Title.eq(&row.title))
            .one(db)
            .await?;

        if let Some(model) = model {
            let mut active_model = model.into_active_model();
            active_model.country = Set(Some(row.country.clone()));
            active_model.chapter = Set(Some(row.chapter.clone()));
            active_model.rating = Set(Some(row.rating as i32));
            active_model.status = Set(Some(row.status.to_str()));
            active_model.tags = Set(serde_json::to_value(row.tags.clone()).unwrap());
            active_model.notes = Set(Some(row.notes.clone()));
            active_model.date_modified = Set(row.date_modified.naive_utc());
            active_model.update(db).await?;
        }
        else {
            Novels::insert(novel_entry_to_active_model(row)).exec(db).await?;
        }
    }

    Ok(())
}