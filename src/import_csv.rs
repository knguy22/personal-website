use csv;
use crate::novel_entry::{Status, Chapters, NovelEntry};
use chrono::Local;
use std::error::Error;

type Record = (Option<String>, Option<String>, Option<String>, Option<u32>, Option<String>, Option<String>, Option<String>);

pub fn read_csv(csv_file: &String) -> Result<Vec<NovelEntry>, Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path(csv_file).unwrap();
    let mut data = Vec::new();

    let headers = rdr.headers()?;
    println!("Headers read: {:?}", headers);

    for res in rdr.deserialize() {
        let t: Record;
        match res {
            Ok(r) => t = r,
            Err(err) => {
                println!("{}", err);
                continue
            },
        }
        
        let record = NovelEntry{
            country: t.0.unwrap_or_default(),
            title: t.1.unwrap_or_default(),
            chapter: Chapters::new(&t.2.unwrap_or_default()),
            rating: t.3.unwrap_or_default(),
            status: Status::new(&t.4.unwrap_or_default()),
            tags: NovelEntry::parse_tags(&t.5.unwrap_or_default()),
            notes: t.6.unwrap_or_default(),
            date_modified: Local::now().to_utc(),
        };

        if !record.is_empty() {
            data.push(record);
        }
    }

    println!("Entries read: {}", data.len());
    Ok(data)
}
