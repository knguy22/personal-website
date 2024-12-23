use anyhow::Result;
use url::Url;
use headless_chrome::{Browser, LaunchOptions};
use scraper::{Html, Selector};

use std::{path::PathBuf, thread, time::Duration};

pub fn init() -> Result<Browser> {
    let port = Some(1234);
    let chrome_binary = Some(PathBuf::from("./chrome-linux64/chrome"));
    let launch_options = LaunchOptions::default_builder()
        .path(chrome_binary)
        .port(port)
        .build()?;
    Browser::new(launch_options)
}

pub async fn scrape_genres_and_tags(browser: &Browser, title: &str) -> Result<Vec<String>> {
    let url = Url::parse(title)?;
    let user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    let accept_language = Some("en-US,en");
    let platform = Some("Win32");

    let tab = browser.new_tab()?;
    tab.set_user_agent(user_agent, accept_language, platform)?;
    tab.navigate_to(url.as_str())?;
    thread::sleep(Duration::from_secs(2));

    let html = tab.get_content()?;
    Ok(parse_genres_and_tags(&html))
}

fn parse_genres_and_tags(html: &str) -> Vec<String> {
    let document = Html::parse_document(html);

    let genres_selector = Selector::parse("#seriesgenre").unwrap();
    let tags_selector = Selector::parse("#showtags").unwrap();
    let link_selector = Selector::parse("a").unwrap();

    let genres_iter = document.select(&genres_selector).into_iter();
    let tags_iter = document.select(&tags_selector).into_iter();
    let mut res = Vec::new();

    for group in genres_iter.chain(tags_iter)  {
        for link in group.select(&link_selector) {
            res.push(link.inner_html());
        }
    }
    res
}

mod tests {
    use super::*;
    use std::{fs::File, io::Read, path::Path, vec};

    #[test]
    fn test_parse_genres_and_tags() {
        let mut html: String = String::new();
        let gimai_path = Path::new("./test_data/Gimai Seikatsu - Novel Updates.html");
        File::open(gimai_path).unwrap().read_to_string(&mut html).unwrap();

        let res = parse_genres_and_tags(&html);

        let expected = vec![
            // genres
            "Comedy",
            "Drama",
            "Psychological",
            "Romance",
            "School Life",
            "Slice of Life",

            // tags
            "Adapted to Anime",
            "Adapted to Manga",
            "Average-looking Protagonist",
            "Award-winning Work",
            "Beautiful Female Lead",
            "Books",
            "Bookworm",
            "Calm Protagonist",
            "Caring Protagonist",
            "Character Growth",
            "Clever Protagonist",
            "Cohabitation",
            "Complex Family Relationships",
            "Cooking",
            "Couple Growth",
            "Female Protagonist",
            "Hard-Working Protagonist",
            "Heartwarming",
            "Love Interest Falls in Love First",
            "Male Protagonist",
            "Modern Day",
            "Multiple POV",
            "Multiple Protagonists",
            "Part-Time Job",
            "Past Trauma",
            "Philosophical",
            "Popular Love Interests",
            "Possessive Characters",
            "Secret Relationship",
            "Siblings",
            "Siblings Not Related by Blood",
            "Slow Romance",
            "Smart Couple",
            "Strong Love Interests",
            "Younger Sisters",
        ];

        assert_eq!(res, expected);
    }

    #[tokio::test]
    async fn test_scrape_genres_and_tags() {
        let browser = init().unwrap();
        let res = scrape_genres_and_tags(&browser, "https://www.novelupdates.com/series/lord-of-the-mysteries/").await.unwrap();
        assert!(res.len() > 50);
    }
}