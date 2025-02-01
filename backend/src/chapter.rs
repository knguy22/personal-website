use std::fmt;

use anyhow::Result;
use serde::{Deserialize, Serialize, Deserializer, de, de::Visitor};

#[derive(Clone, Debug, PartialEq)]
pub enum Chapter {
    Standard{
        volume: Option<u32>,
        chapter: Option<u32>,
        part: Option<u32>
    },
    Other{
        value: String
    },
}

impl Chapter {
    pub fn from(raw: &str) -> Result<Self> {
        Ok(Self::Other { value: raw.into() })
    }

    pub fn to_string(&self) -> String {
        match self {
            Chapter::Standard { volume, chapter, part } => {
                let mut parts: String = String::new();

                if let Some(v) = volume {
                    parts.push_str(&format!("v{v}"));

                    // adding a chapter is redundant if there isn't a volume
                    if chapter.is_some() {
                        parts.push('c');
                    }
                }

                if let Some(c) = chapter {
                    parts.push_str(&format!("{c}"));
                }

                if let Some(p) = part {
                    parts.push_str(&format!("p{p}"));
                }

                parts
            },
            Chapter::Other { value } => value.clone(),
        }
    }

    pub fn count_chapters(&self) -> u32 {
        match self {
            Chapter::Standard { chapter, .. } => chapter.unwrap_or(0),
            _ => 0,
        }
    }

    pub fn count_volumes(&self) -> u32 {
        match self {
            Chapter::Standard { volume, ..} => volume.unwrap_or(0),
            _ => 0,
        }
    }

    pub fn unstarted(&self) -> bool {
        match self {
            Chapter::Standard { volume, chapter, part } => {
                volume.is_none() && chapter.is_none() && part.is_none()
            },
            Chapter::Other { value } => value.is_empty(),
        }
    }
}

impl Serialize for Chapter {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
        where
            S: serde::Serializer
    {
        let self_str = self.to_string();
        serializer.serialize_str(&self_str)
    }

}

impl<'de> Deserialize<'de> for Chapter {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct ChapterVisitor;

        impl<'de> Visitor<'de> for ChapterVisitor {
            type Value = Chapter;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("a formatted chapter string (v1c1p1) or any other string for 'Other'")
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: de::Error,
            {
                Chapter::from(value).map_err(de::Error::custom)
            }
        }

        deserializer.deserialize_str(ChapterVisitor)
    }
}

#[cfg(test)]
mod tests {
    use super::Chapter;

    #[test]
    fn empty() {
        let raw = "";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Other { value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn other_non_empty() {
        let raw = "Arc 3, P1";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Other { value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn unlabeled_chap() {
        let raw = "10";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: None, chapter: Some(10), part: None });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn unlabeled_chap_part() {
        let raw = "10p3";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: None, chapter: Some(10), part: Some(3) });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn labeled_chap() {
        let raw = "c10";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: None, chapter: Some(10), part: None });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn vol() {
        let raw = "v343";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: Some(343), chapter: None, part: None });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn vol_chap() {
        let raw = "v3c98";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: Some(3), chapter: Some(98), part: None });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn vol_chap_part() {
        let raw = "v3c98p2";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: Some(3), chapter: Some(98), part: Some(2) });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn count_chapters() {
        assert_eq!(Chapter::from("0").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("32").unwrap().count_volumes(), 32);
        assert_eq!(Chapter::from("c1").unwrap().count_volumes(), 1);
        assert_eq!(Chapter::from("v10").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("v11C3").unwrap().count_volumes(), 3);
        assert_eq!(Chapter::from("V22C30P2").unwrap().count_volumes(), 30);
    }

    #[test]
    fn count_volumes() {
        assert_eq!(Chapter::from("v0").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("v1").unwrap().count_volumes(), 1);
        assert_eq!(Chapter::from("v10").unwrap().count_volumes(), 10);
        assert_eq!(Chapter::from("v11").unwrap().count_volumes(), 11);
        assert_eq!(Chapter::from("v11C3").unwrap().count_volumes(), 10);
        assert_eq!(Chapter::from("V22C3P2").unwrap().count_volumes(), 21);
    }
}