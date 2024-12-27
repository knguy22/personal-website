use super::browser;

use anyhow::{Error, Result};
use headless_chrome::Tab;
use html_escape::decode_html_entities;
use itertools::Itertools;
use scraper::{Html, Selector};
use tokio::time::sleep;

use std::{io::Write, time::Duration};

pub async fn scrape_tags(title: &str, sleep_duration: u64) -> Result<Vec<String>> {
    let browser = browser::init()?;
    let tab = browser.new_tab()?;
    browser::configure_tab(&tab)?;

    if let Err(e) = navigate_tab(title, &tab, sleep_duration).await {
        browser::screenshot("src/data_ingestion/final_error.png", &tab)?;
        Err(e)?;
    };

    let html = tab.get_content()?;
    tab.close_with_unload()?;
    match parse_tags(title, &html) {
        Ok(res) => Ok(res),
        Err(e) => {
            let mut file = std::fs::File::create("src/data_ingestion/error.html")?;
            file.write_all(html.as_bytes())?;
            Err(e)?
        }
    }
}

async fn navigate_tab(title: &str, tab: &Tab, sleep_duration: u64) -> Result<()> {
    // use the main page to search for the novel
    let main_page_url = "https://www.royalroad.com/home";
    let menu_toggle_selector = "body > div.page-header > div.page-header-top > div > a";
    let search_bar_selector = "body > div.page-header > div.page-header-menu > div > form > div > input";

    tab.navigate_to(main_page_url)?;
    sleep(Duration::from_secs(sleep_duration)).await;
    tab.wait_for_element(menu_toggle_selector)?.click()?;

    sleep(Duration::from_secs(sleep_duration)).await;
    tab.wait_for_element(search_bar_selector)?.click()?;
    tab.type_str(title)?.press_key("Enter")?;

    // select the first novel from the search results
    let first_search_result_selector = "body > div.page-container > div > div > div > div > div > div > div > div.col-md-8 > div > div.fiction-list > div:nth-child(1) > figure > a";
    tab.wait_for_element(first_search_result_selector)?.click()?;
    sleep(Duration::from_secs(sleep_duration)).await;
    Ok(())
}

fn parse_tags(title: &str, html: &str) -> Result<Vec<String>> {
    let title_selector = Selector::parse("body > div.page-container > div > div > div > div.page-content-inner > div > div.row.fic-header > div.col-md-5.col-lg-6.text-center.md-text-left.fic-title > div > h1").unwrap();
    let tags_selector = Selector::parse("body > div.page-container > div > div > div > div.page-content-inner > div > div.fiction.row > div > div.fiction-info > div.portlet.light.row > div.col-md-8 > div.margin-bottom-10 > span.tags").unwrap();
    let link_selector = Selector::parse("a").unwrap();
    let document = Html::parse_document(html);

    // check the title to make sure this is the right series
    match document.select(&title_selector).next() {
        None => Err(Error::msg("Title element not found in page"))?,
        Some(title_element) => {
            let curr_title = title_element.inner_html();
            let curr_title = decode_html_entities(&curr_title);
            if curr_title != title {
                Err(Error::msg(format!("Wrong title in page: [{curr_title}]")))?;
            }
        },
    }

    // scrape the tags
    let mut res = Vec::new();
    let tags_element = document.select(&tags_selector).exactly_one().unwrap();
    for link in tags_element.select(&link_selector) {
        res.push(link.inner_html());
    }

    Ok(res)
}

#[cfg(test)]
mod tests {
    use super::*;
    use dotenv::dotenv;

    #[tokio::test]
    #[ignore]
    async fn scrape_orellen() {
        dotenv().ok();
        let res = scrape_tags("The Last Orellen", 3).await.unwrap();
        assert_eq!(res.len(), 10);
    }

    #[tokio::test]
    #[ignore]
    async fn scrape_carousel() {
        dotenv().ok();
        let res = scrape_tags("The Game at Carousel: A Horror Movie LitRPG", 3).await.unwrap();
        assert_eq!(res.len(), 13);
    }

    #[tokio::test]
    #[ignore]
    async fn scrape_blood_and_fur() {
        dotenv().ok();
        let res = scrape_tags("Blood & Fur", 3).await.unwrap();
        assert_eq!(res.len(), 13);
    }

    #[tokio::test]
    #[ignore]
    async fn scrape_invalid() {
        dotenv().ok();
        let res = scrape_tags("lkasjdfklasjdflajklsdf", 3).await;
        assert!(res.is_err());
    }
}