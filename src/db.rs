use sqlx::{self};
use sqlx::{postgres, Row};
use std::{error::Error, env};

pub async fn init() -> Result<(), Box<dyn Error>> {
    let max_conn = 5;
    let table_name = "test_table";
    let conn_url: String = env::var("DATABASE_URL").expect("DATABASE_URL not set");

    let pool = postgres::PgPoolOptions::new()
            .max_connections(max_conn)
            .connect(&conn_url).await?;

    // check table exists
    let table_exists: bool = sqlx::query!("
        SELECT EXISTS (
        SELECT FROM 
            pg_tables
        WHERE 
            schemaname = 'public' AND 
            tablename  = $1
        );", table_name)
    .fetch_one(&pool)
    .await?
    .exists.unwrap_or_default();
    println!("Table '{}' exists status: {}", table_name, table_exists);

    // make sure table is created
    let create_table_query = format!(
        "CREATE TABLE IF NOT EXISTS {} (
            col1 bigint PRIMARY KEY,
            col2 bigint NOT NULL
        );", table_name);
    let create_table_res = sqlx::query(&
        create_table_query)
    .execute(&pool)
    .await?;
    println!("{} rows affected", create_table_res.rows_affected());
    
    // try inserting
    let insert_query = format!( "INSERT INTO {} VALUES ($1, $2) ON CONFLICT DO NOTHING", table_name);
    let insert_res = sqlx::query(&insert_query)
    .bind(1).bind(2)
    .execute(&pool)
    .await?;
    println!("{} rows affected", insert_res.rows_affected());
    
    // check contents
    let check_query = format!( "SELECT * FROM {} WHERE col1 = $1", table_name);
    let check_rows = sqlx::query(&check_query)
    .bind(1)
    .fetch_all(&pool)
    .await?;

    for row in check_rows {
        let col1: i64 = row.get("col1");
        let col2: i64 = row.get("col2");
        println!("col1 {}", col1);
        println!("col2 {}", col2);
    }

    Ok(())
}