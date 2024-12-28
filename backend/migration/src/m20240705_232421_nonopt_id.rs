use sea_orm_migration::prelude::*;
use crate::novels::Novels;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // modify columns
        let table = Table::alter()
            .table(Novels::Table)
            .modify_column(ColumnDef::new(Novels::Id).integer().not_null().primary_key().unique_key().auto_increment())
            .to_owned();
        manager.alter_table(table).await
        }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .modify_column(ColumnDef::new(Novels::Id).integer())
            .to_owned();
        manager.alter_table(table).await
    }
}
