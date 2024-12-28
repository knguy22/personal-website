use std::str::FromStr;

use crate::entity::novels;

use anyhow::{Result, Error};
use chrono::{DateTime, Local, Utc};
use sea_orm::{IntoActiveModel, JsonValue};
use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};

#[derive(Clone, Debug, PartialEq, Display, EnumString, Deserialize, Serialize)]
pub enum Provider {
    NovelUpdates,
    RoyalRoad,
}

#[derive(Clone, Debug, PartialEq, Display, EnumString, Deserialize, Serialize)]
pub enum Status {
    Reading,
    Completed,
    Waiting,
    Dropped,
    Hiatus,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NovelEntry {
    pub id: i32,
    pub country: String,
    pub title: String,
    pub chapter: String,
    pub rating: u32,
    pub status: Option<Status>,
    pub tags: Vec<String>,
    pub notes: String,
    pub provider: Option<Provider>,
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

impl NovelEntry {
    pub fn empty(id: i32) -> Self {
        Self {
            id,
            country: String::new(),
            title: String::new(),
            chapter: String::new(),
            rating: 0,
            status: None,
            tags: Vec::new(),
            notes: String::new(),
            provider: None,
            date_modified: Local::now().to_utc(),
            date_started: None,
            date_completed: None,
        }
    }

    pub fn parse_tags(s: &str) -> Vec<String> {
        s.split_terminator(',').map(String::from).collect()
    }

    #[allow(clippy::cast_possible_wrap)]
    pub fn to_active_model(&self) -> novels::ActiveModel {
        novels::Model {
            id: self.id,
            country: self.country.clone(),
            title: self.title.clone(),
            chapter: self.chapter.clone(),
            rating: Some(self.rating as i32),
            status: self.status.as_ref().map(ToString::to_string),
            tags: serde_json::to_value(self.tags.clone()).unwrap(),
            notes: self.notes.clone(),
            provider: self.provider.as_ref().map(ToString::to_string),
            date_modified: self.date_modified.naive_utc(),
            date_started: self.date_started.map(|date| date.naive_utc()),
            date_completed: self.date_completed.map(|date| date.naive_utc()),
        }.into_active_model()
    }

    #[allow(clippy::cast_sign_loss, clippy::cast_possible_wrap)]
    pub fn from_model(model: novels::Model) -> Self {
        Self {
            id: model.id,
            country: model.country,
            title: model.title,
            chapter: model.chapter,
            rating: model.rating.unwrap_or_default() as u32,
            status: model.status.as_ref().map(|status| Status::from_str(status).unwrap()),
            tags: json_value_to_vec_str(&model.tags).unwrap_or_default(),
            notes: model.notes,
            provider: model.provider.as_ref().map(|provider| Provider::from_str(provider).unwrap()),
            date_modified: model.date_modified.and_utc(),
            date_started: model.date_started.map(|date| date.and_utc()),
            date_completed: model.date_completed.map(|date| date.and_utc()),
        }
    }
}

fn json_value_to_vec_str(val: &JsonValue) -> Result<Vec<String>> {
    match val {
        JsonValue::Array(arr) => {
            let mut vec = Vec::new();
            for item in arr {
                if let JsonValue::String(s) = item {
                    vec.push(s.clone());
                }
                else {
                    return Err(Error::msg("Not all elements in JSON value are strings"))
                }
            }
            Ok(vec)
        }
        _ => Err(Error::msg("The JSON value is not an array"))
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
    }

    #[test]
    fn test_convert_status() {
        assert_eq!(Status::from_str("Reading").unwrap(), Status::Reading);
        assert_eq!(Status::from_str("Completed").unwrap(), Status::Completed);
        assert_eq!(Status::from_str("Waiting").unwrap(), Status::Waiting);
        assert_eq!(Status::from_str("Dropped").unwrap(), Status::Dropped);
        assert_eq!(Status::from_str("Hiatus").unwrap(), Status::Hiatus);
    }
}
