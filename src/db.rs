use std::{error::Error, env, time::Duration};
use crate::novel_entry::{self, NovelEntry};
use crate::entity::novels;
use sea_orm::{ConnectOptions, Database, DatabaseConnection};

pub async fn init() -> Result<DatabaseConnection, Box<dyn Error>> {
    // init database
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let mut conn_opt = ConnectOptions::new(database_url);
    conn_opt.max_connections(5)
            .min_connections(5)
            .connect_timeout(Duration::from_secs(5))
            .acquire_timeout(Duration::from_secs(5))
            .idle_timeout(Duration::from_secs(5))
            .max_lifetime(Duration::from_secs(5))
            .set_schema_search_path("my_schema"); // Setting default PostgreSQL schema
    let db = Database::connect(conn_opt).await?;

    Ok(db)
}

pub async fn insert_csv_into_table(db: DatabaseConnection, table_name: &String, rows: &Vec<NovelEntry>) {

}