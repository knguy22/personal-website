use crate::novel_entry::{NovelEntry, model_to_novel_entry, novel_entry_to_model};
use crate::entity::prelude::Novels;
use std::{error::Error, env, time::Duration};
use sea_orm::{ConnectOptions, Database, DatabaseConnection, EntityTrait};

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
        to_insert.push(novel_entry_to_model(row));
    }

    let _ = Novels::insert_many(to_insert).exec(db).await?;
    Ok(())
}
