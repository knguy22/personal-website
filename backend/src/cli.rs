use crate::db;
use crate::data_ingestion;

use std::path::PathBuf;

use anyhow::Result;
use clap::{Parser, Subcommand};
use sea_orm::DatabaseConnection;

#[derive(Debug, Parser)]
#[command(version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    manage_novels: Option<ManageNovels>
}

#[derive(Debug, Subcommand)]
enum ManageNovels {
    /// Fetches all novel information from supported websites
    FetchAllNovels,

    /// Manually fetches a single novel's information
    FetchSingle{ title: String, url: Option<String> },

    /// Imports novel tags and genres from a csv file (see <https://github.com/shaido987/novel-dataset>)
    ImportCsv{ file: PathBuf },

    /// Drops everything currently in the novel table
    DropAllNovels,
}

pub async fn run_cli(conn: &DatabaseConnection) -> Result<()> {
    let cli = Cli::parse();

    if let Some(command) = cli.manage_novels {
        match command {
            ManageNovels::FetchAllNovels => data_ingestion::fetch_novel_tags(conn).await?,
            ManageNovels::FetchSingle { title, url } => data_ingestion::single_fetch_novel_tags(conn, &title, url).await?,
            ManageNovels::ImportCsv { file } => {
                let rows = data_ingestion::csv::read_novel_tags_csv(&file)?;
                db::update_novel_tags(conn, &rows).await?;
            },
            ManageNovels::DropAllNovels => db::drop_all_novels(conn).await?,
        }
    }

    Ok(())
}
