use sea_orm_migration::prelude::*;
use crate::novels::Novels;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .drop_column(Novels::Tags)
            .add_column(ColumnDef::new(Novels::Tags).json())
            .to_owned();
        manager.alter_table(table).await
        }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .drop_column(Novels::Tags)
            .add_column(ColumnDef::new(Novels::Tags).string())
            .to_owned();
        manager.alter_table(table).await
    }
}
