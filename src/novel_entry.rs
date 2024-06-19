use core::fmt;
use chrono::{DateTime, Utc};
use std::fmt::Formatter;
use strum;

#[derive(PartialEq)]
#[derive(strum::EnumString)]
pub enum Status {
    Reading,
    Completed,
    Waiting,
    Dropped,
    Hiatus,
    Invalid,
}

#[derive(PartialEq)]
pub enum Chapters {
    Web(u32),
    Novel{volume: u32, chapter: u32, part: u32},
    Invalid,
}

pub struct NovelEntry {
    pub country: String,
    pub title: String,
    pub chapter: Chapters,
    pub rating: u32,
    pub status: Status,
    pub tags: Vec<String>,
    pub notes: String,
    pub date_modified: DateTime<Utc>,
}

// formatters

impl fmt::Display for Status {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Status::Reading => write!(f, "R"),
            Status::Completed => write!(f, "C"),
            Status::Waiting => write!(f, "W"),
            Status::Dropped => write!(f, "D"),
            Status::Hiatus => write!(f, "H"),
            Status::Invalid => write!(f, "I"),
        }
    }
}

impl fmt::Display for Chapters {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Chapters::Web(i) => write!(f, "{}", i.to_string()),
            Chapters::Novel { volume, chapter, part } => {
                if *part != 0 {
                    write!(f, "v{:?}c{:?}p{:?}", volume, chapter, part)
                }
                else if *chapter != 0 {
                    write!(f, "v{:?}c{:?}", volume, chapter)
                }
                else {
                    write!(f, "v{:?}", volume)
                }
            },
            Chapters::Invalid => write!(f, "Invalid"),
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

// other impls

impl Chapters {
    pub fn new(s: &String) -> Chapters {
        match s.parse::<u32>() {
            Ok(i) => Chapters::Web(i),
            _ => Chapters::parse_vcp(s),
        }
    }

    fn parse_vcp(s: &String) -> Chapters {
        let radix = 10;
        let v = s.chars().nth(1).unwrap_or_default().to_digit(radix).unwrap_or_default();
        let c = s.chars().nth(3).unwrap_or_default().to_digit(radix).unwrap_or_default();
        let p = s.chars().nth(5).unwrap_or_default().to_digit(radix).unwrap_or_default();

        if v == 0 && c == 0 && p == 0 {
            return Chapters::Invalid;
        }
        Chapters::Novel { volume: v, chapter: c, part: p }
    }
}

impl Status {
    pub fn new(s: &String) -> Status {
        match s.chars().nth(0).unwrap_or_default() {
            'R' => Status::Reading,
            'C' => Status::Completed,
            'W' => Status::Waiting,
            'D' => Status::Dropped,
            'H' => Status::Hiatus,
            _ => Status::Invalid,
        }
    }
}

impl NovelEntry {
    pub fn parse_tags(s: &String) -> Vec<String> {
        s.split_terminator(',').map(String::from).collect()
    }
    
    pub fn is_empty(&self) -> bool {
        self.country.is_empty() &&
        self.title.is_empty() &&
        self.chapter == Chapters::Invalid &&
        self.rating == 0 &&
        self.status == Status::Invalid &&
        self.tags.is_empty() &&
        self.notes.is_empty()
    }
}