use sea_orm_migration::prelude::*;
use sea_orm::Statement;

use crate::novels::Novels;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table_name = Novels::Table.to_string();
        let column = Novels::Provider.to_string();

        let query = format!("UPDATE {table_name} SET {column} = 'NovelUpdates' WHERE {column} = 'Novelupdates';");
        let db = manager.get_connection();
        db.execute(Statement::from_string(
                sea_orm::DatabaseBackend::Postgres,
                query
            ))
            .await?;

        let query = format!("UPDATE {table_name} SET {column} = 'RoyalRoad' WHERE {column} = 'Royalroad';");
        let db = manager.get_connection();
        db.execute(Statement::from_string(
                sea_orm::DatabaseBackend::Postgres,
                query
            ))
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table_name = Novels::Table.to_string();
        let column = Novels::Provider.to_string();

        let query = format!("UPDATE {table_name} SET {column} = 'Novelupdates' WHERE {column} = 'NovelUpdates';");
        let db = manager.get_connection();
        db.execute(Statement::from_string(
                sea_orm::DatabaseBackend::Postgres,
                query
            ))
            .await?;

        let query = format!("UPDATE {table_name} SET {column} = 'Royalroad' WHERE {column} = 'RoyalRoad';");
        let db = manager.get_connection();
        db.execute(Statement::from_string(
                sea_orm::DatabaseBackend::Postgres,
                query
            ))
            .await?;

        Ok(())
    }
}
