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
