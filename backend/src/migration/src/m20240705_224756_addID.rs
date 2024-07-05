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
            .drop_column(Novels::Title)
            .add_column(ColumnDef::new(Novels::Id).integer())
            .add_column(ColumnDef::new(Novels::Title).string())
            .to_owned();
        manager.alter_table(table).await
        }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        todo!();
    }
}


