use std::fmt;
use std::sync::LazyLock;

use anyhow::Result;
use serde::{Deserialize, Serialize, Deserializer, de, de::Visitor};
use regex::Regex;

#[derive(Clone, Debug, PartialEq)]
pub enum Chapter {
    Standard{
        volume: Option<u32>,
        chapter: Option<u32>,
        part: Option<u32>,
        value: String,
    },
    Other{
        value: String
    },
}

impl Chapter {
    pub fn from(raw: &str) -> Result<Self> {
        // these regexes are static to avoid recompiling them over and over
        static STANDARD_RE: LazyLock<Regex> = LazyLock::new( ||
            Regex::new(r"^(v\d+)?(c\d+)?(p\d+)?$|^(\d+)(p\d+)?$").unwrap()
        );
        static RE_SPLIT: LazyLock<Regex> = LazyLock::new( ||
            Regex::new(r"(v\d+|c\d+|p\d+)|(\d+)").unwrap()
        );

        // using lowercase makes regex easier
        let lower = raw.to_ascii_lowercase();

        // either follow v1c1p1 or c1p1 or 1p1
        if !STANDARD_RE.is_match(&lower) {
            return Ok(Self::Other { value: raw.into() });
        }

        // now we can safely use this regex without worrying about extra components
        let mut volume = None;
        let mut chapter = None;
        let mut part = None;

        for cap in RE_SPLIT.captures_iter(&lower) {
            if let Some(m) = cap.get(1) {
                let s = m.as_str();
                if s.starts_with('v') {
                    volume = s[1..].parse().ok();
                } else if s.starts_with('c') {
                    chapter = s[1..].parse().ok();
                } else if s.starts_with('p') {
                    part = s[1..].parse().ok();
                }
            } else if let Some(m) = cap.get(2) {
                // If there's an isolated number, assume it's a chapter if no 'c' exists
                if chapter.is_none() {
                    chapter = m.as_str().parse().ok();
                }
            }
        }

        if volume.is_none() && chapter.is_none() && part.is_none() {
            return Ok(Self::Other { value: raw.into() });
        }

        Ok(Self::Standard { volume, chapter, part, value: raw.into() })
    }

    pub fn to_string(&self) -> String {
        match self {
            // value is used directly for standard due to c1p1 vs 1p1 being the same
            Chapter::Standard { value, ..} => value.clone(),
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
            Chapter::Standard { volume, chapter, part, ..} => {
                match volume {
                    Some(v) => {
                        // prevent underflow
                        if *v == 0 {
                            return 0;
                        }

                        // don't count a volume currently reading
                        v - if chapter.is_some() || part.is_some() {1} else {0}
                    }
                    None => 0,
                }
            },
            _ => 0,
        }
    }

    pub fn unstarted(&self) -> bool {
        match self {
            Chapter::Standard { volume, chapter, part, .. } => {
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
        let raw = "Arc 3, C1";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Other { value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn other_non_empty_2() {
        let raw = "Y1V1C1P1";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Other { value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn unlabeled_chap() {
        let raw = "10";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: None, chapter: Some(10), part: None, value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn unlabeled_chap_part() {
        let raw = "10p3";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: None, chapter: Some(10), part: Some(3), value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn labeled_chap() {
        let raw = "c10";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: None, chapter: Some(10), part: None, value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn vol() {
        let raw = "v343";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: Some(343), chapter: None, part: None, value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn vol_chap() {
        let raw = "v3c98";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: Some(3), chapter: Some(98), part: None, value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn vol_chap_part() {
        let raw = "v3c98p2";
        let chapter = Chapter::from(raw).unwrap();
        assert_eq!(chapter, Chapter::Standard { volume: Some(3), chapter: Some(98), part: Some(2), value: raw.into() });
        assert_eq!(chapter.to_string(), raw);
    }

    #[test]
    fn count_chapters() {
        assert_eq!(Chapter::from("0").unwrap().count_chapters(), 0);
        assert_eq!(Chapter::from("32").unwrap().count_chapters(), 32);
        assert_eq!(Chapter::from("c1").unwrap().count_chapters(), 1);
        assert_eq!(Chapter::from("v10").unwrap().count_chapters(), 0);
        assert_eq!(Chapter::from("v11C3").unwrap().count_chapters(), 3);
        assert_eq!(Chapter::from("V22C30P2").unwrap().count_chapters(), 30);
    }

    #[test]
    fn count_volumes() {
        assert_eq!(Chapter::from("0").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("11").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("v0").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("v0c1").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("v1").unwrap().count_volumes(), 1);
        assert_eq!(Chapter::from("v1c1").unwrap().count_volumes(), 0);
        assert_eq!(Chapter::from("v10").unwrap().count_volumes(), 10);
        assert_eq!(Chapter::from("v11C3").unwrap().count_volumes(), 10);
        assert_eq!(Chapter::from("V22C3P2").unwrap().count_volumes(), 21);
    }
}