mod novel_entry;
mod import_csv;

use sqlx::postgres::PgPoolOptions;

// #[tokio::main]
// async fn main() -> Result<(), sqlx::Error> {
//     let pool = PgPoolOptions::new()
//             .max_connections(5)
//             .connect("postgres://postgres:doubl@localhost/test").await?;
    
//     let row: (i64,) = sqlx::query_as("SELECT $1")
//         .bind(150_i64)
//         .fetch_one(&pool).await?;

//     assert_eq!(row.0, 150);

//     Ok(())
// }


fn main() {
    let csv_file: String = "data.csv".to_string();
    let _ = import_csv::read_csv(&csv_file);
}