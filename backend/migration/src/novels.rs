use sea_orm_migration::prelude::*;

// based on novel_entry::NovelEntry
#[allow(unused)]
#[derive(DeriveIden)]
pub enum Novels {
    Id,
    Table,
    Country,
    Title,
    Chapter,
    Rating,
    Status,
    Tags,
    Notes,
    DateModified,
    DateStarted,
    DateCompleted,
}
