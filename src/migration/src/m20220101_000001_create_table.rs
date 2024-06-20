use sea_orm_migration::prelude::*;

// based on novel_entry::NovelEntry
#[derive(DeriveIden)]
pub enum Novels {
    Table,
    Country,
    Title,
    Chapter,
    Rating,
    Status,
    Tags,
    Notes,
    DateModified,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Novels::Table)
                    .if_not_exists()
                    .col( ColumnDef::new(Novels::Country).string())
                    .col(ColumnDef::new(Novels::Title).string().not_null().primary_key().unique_key())
                    .col(ColumnDef::new(Novels::Chapter).integer())
                    .col(ColumnDef::new(Novels::Rating).integer())
                    .col(ColumnDef::new(Novels::Status).string())
                    .col(ColumnDef::new(Novels::Tags).string())
                    .col(ColumnDef::new(Novels::Notes).string())
                    .col(ColumnDef::new(Novels::DateModified).date_time())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Novels::Table).to_owned())
            .await
    }
}
