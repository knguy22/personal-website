use chrono::{DateTime, Utc};
use strum;

#[derive(Clone, Debug, PartialEq, strum::EnumString)]
pub enum Status {
    Reading,
    Completed,
    Waiting,
    Dropped,
    Hiatus,
    Invalid,
}

#[derive(Clone, PartialEq, Debug)]
pub enum Chapters {
    Web(u32),
    Novel{volume: u32, chapter: u32, part: u32},
    Invalid,
}

#[derive(Clone, Debug)]
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