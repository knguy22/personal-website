use chrono::{DateTime, Utc};

enum Status {
    Reading,
    Completed,
    Waiting,
    Dropped,
    Hiatus,
}

enum Chapters {
    Web(u32),
    Novel{volume: u32, chapter: u32, part: u32},
}

struct NovelEntry {
    country: String,
    title: String,
    chapter: Chapters,
    rating: u32,
    status: Status,
    tags: Vec<String>,
    notes: String,
    date_modified: DateTime<Utc>,
}

fn main() -> () {

}
