use crate::entity::novels;
use std::error::Error;

use chrono::{DateTime, Utc};
use sea_orm::{IntoActiveModel, JsonValue};
use serde::{Deserialize, Serialize};
use strum;

#[derive(Clone, Debug, PartialEq, strum::EnumString, strum::Display, Deserialize, Serialize)]
pub enum Status {
    Reading,
    Completed,
    Waiting,
    Dropped,
    Hiatus,
    Invalid,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NovelEntry {
    pub id: i32,
    pub country: String,
    pub title: String,
    pub chapter: String,
    pub rating: u32,
    pub status: Status,
    pub tags: Vec<String>,
    pub notes: String,
    pub date_modified: DateTime<Utc>,
    pub date_started: Option<DateTime<Utc>>,
    pub date_completed: Option<DateTime<Utc>>,
}

// used when importing from csv
#[derive(Debug)]
pub struct NovelTagsRecordParsed {
    pub title: String,
    pub tags: Vec<String>,
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
}

pub fn novel_entry_to_active_model(novel: &NovelEntry) -> novels::ActiveModel {
    novels::Model { 
        id: novel.id,
        country: Some(novel.country.clone()), 
        title: Some(novel.title.clone()), 
        chapter: Some(novel.chapter.clone()), 
        rating: Some(novel.rating as i32), 
        status: Some(novel.status.to_string()), 
        tags: serde_json::to_value(novel.tags.clone()).unwrap(),
        notes: Some(novel.notes.clone()), 
        date_modified: novel.date_modified.naive_utc(),
        date_started: novel.date_started.map(|date| date.naive_utc()),
        date_completed: novel.date_completed.map(|date| date.naive_utc()),
    }.into_active_model()
}

pub fn model_to_novel_entry(model: novels::Model) -> NovelEntry {
    NovelEntry {
        id: model.id.clone(),
        country: model.country.unwrap_or_default(),
        title: model.title.unwrap_or_default(), 
        chapter: model.chapter.unwrap_or_default(),
        rating: model.rating.unwrap_or_default() as u32,
        status: Status::new(&model.status.unwrap_or_default()),
        tags: json_value_to_vec_str(&model.tags).unwrap_or_default(),
        notes: model.notes.unwrap_or_default(), 
        date_modified: model.date_modified.and_utc(),
        date_started: model.date_started.map(|date| date.and_utc()),
        date_completed: model.date_completed.map(|date| date.and_utc()),
    }
}

fn json_value_to_vec_str(val: &JsonValue) -> Result<Vec<String>, Box<dyn Error>> {
    match val {
        JsonValue::Array(arr) => {
            let mut vec = Vec::new();
            for item in arr {
                if let JsonValue::String(s) = item {
                    vec.push(s.clone());
                }
                else {
                    return Err("Not all elements in JSON value are strings".into())
                }
            }
            Ok(vec)
        }
        _ => Err("The JSON value is not an array".into()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_display_status() {
        assert_eq!(Status::Reading.to_string(), "Reading");
        assert_eq!(Status::Completed.to_string(), "Completed");
        assert_eq!(Status::Waiting.to_string(), "Waiting");
        assert_eq!(Status::Dropped.to_string(), "Dropped");
        assert_eq!(Status::Hiatus.to_string(), "Hiatus");
        assert_eq!(Status::Invalid.to_string(), "Invalid");
    }
}
