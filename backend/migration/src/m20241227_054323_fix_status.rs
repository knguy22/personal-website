use sea_orm_migration::prelude::*;
use sea_orm::Statement;

use crate::novels::Novels;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table_name = Novels::Table.to_string();
        let status_column = Novels::Status.to_string();
        let query = format!("UPDATE {table_name} SET {0} = NULL WHERE {0} = 'Invalid';", status_column);
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
        let status_column = Novels::Status.to_string();
        let query = format!("UPDATE {table_name} SET {0} = 'Invalid' WHERE {0} = NULL;", status_column);
        let db = manager.get_connection();
        db.execute(Statement::from_string(
                sea_orm::DatabaseBackend::Postgres,
                query
            ))
            .await?;
        Ok(())
    }
}



