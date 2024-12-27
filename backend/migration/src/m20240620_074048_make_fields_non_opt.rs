use sea_orm_migration::prelude::*;
use crate::novels::Novels;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .modify_column(ColumnDef::new(Novels::Tags).json().not_null())
            .modify_column(ColumnDef::new(Novels::DateModified).date_time().not_null())
            .to_owned();
        manager.alter_table(table).await
        }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .modify_column(ColumnDef::new(Novels::Tags).json())
            .modify_column(ColumnDef::new(Novels::DateModified).date_time())
            .to_owned();
        manager.alter_table(table).await
    }
}
