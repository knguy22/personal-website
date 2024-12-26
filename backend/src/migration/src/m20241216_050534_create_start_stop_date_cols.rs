use sea_orm_migration::prelude::*;
use crate::novels::Novels;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .add_column(ColumnDef::new(Novels::DateStarted).date_time().null())
            .add_column(ColumnDef::new(Novels::DateCompleted).date_time().null())
            .to_owned();
        manager.alter_table(table).await
        }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .drop_column(Novels::DateStarted)
            .drop_column(Novels::DateCompleted)
            .to_owned();
        manager.alter_table(table).await
    }
}

