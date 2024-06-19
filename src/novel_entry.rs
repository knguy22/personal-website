use core::fmt;
use chrono::{DateTime, Utc};
use std::fmt::Formatter;
use strum;

#[derive(strum::EnumString)]
pub enum Status {
    Reading,
    Completed,
    Waiting,
    Dropped,
    Hiatus,
}

pub enum Chapters {
    Web(u32),
    Novel{volume: u32, chapter: u32, part: u32},
}

pub struct NovelEntry {
    country: String,
    title: String,
    chapter: Chapters,
    rating: u32,
    status: Status,
    tags: Vec<String>,
    notes: String,
    date_modified: DateTime<Utc>,
}

impl fmt::Display for Status {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Status::Reading => write!(f, "R"),
            Status::Completed => write!(f, "C"),
            Status::Waiting => write!(f, "W"),
            Status::Dropped => write!(f, "D"),
            Status::Hiatus => write!(f, "H"),
        }
    }
}

impl fmt::Display for Chapters {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Chapters::Web(i) => write!(f, "{}", i.to_string()),
            Chapters::Novel { volume, chapter, part } => write!(f, "v{:?}c{:?}p{:?}", volume, chapter, part)
        }
    }
}

impl fmt::Display for NovelEntry {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let mut tags_str = String::new();
        for tag in self.tags.iter() {
            tags_str.push_str(&tag);
        }

        write!(f, "Country: {}, Title: {}, Chapter: {}, Rating: {}, Status: {}, Tags: {}, Notes: {}, Date_Modified: {}", 
            self.country, 
            self.title,
            self.chapter,
            self.rating,
            self.status,
            tags_str,
            self.notes,
            self.date_modified
        )
    }
}
