pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20240620_064351_use_correct_chapter_type;
mod m20240620_072646_use_vec_for_tags;
mod m20240620_074048_make_fields_non_opt;
mod m20240705_224756_add_id;
mod m20240705_232421_nonopt_id;
mod m20241216_050534_create_start_stop_date_cols;
mod novels;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20240620_064351_use_correct_chapter_type::Migration),
            Box::new(m20240620_072646_use_vec_for_tags::Migration),
            Box::new(m20240620_074048_make_fields_non_opt::Migration),
            Box::new(m20240705_224756_add_id::Migration),
            Box::new(m20240705_232421_nonopt_id::Migration),
            Box::new(m20241216_050534_create_start_stop_date_cols::Migration),
        ]
    }
}
