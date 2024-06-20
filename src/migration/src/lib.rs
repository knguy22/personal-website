pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20240620_064351_use_correct_chapter_type;
mod novels;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20240620_064351_use_correct_chapter_type::Migration),
        ]
    }
}
