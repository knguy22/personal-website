use sea_orm_migration::prelude::*;
use crate::novels::Novels;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .drop_column(Novels::Title) // need to drop and then add again since it's a primary key
            .add_column(ColumnDef::new(Novels::Id).integer())
            .add_column(ColumnDef::new(Novels::Title).string())
            .to_owned();
        manager.alter_table(table).await
        }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let table = Table::alter()
            .table(Novels::Table)
            .drop_column(Novels::Id)
            .modify_column(ColumnDef::new(Novels::Title).string().not_null().primary_key().unique_key())
            .to_owned();
        manager.alter_table(table).await
    }
}


