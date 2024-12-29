use super::browser;

use anyhow::{Error, Result};
use scraper::{Html, Selector};
use html_escape::decode_html_entities;
use tokio::time::sleep;
use unicode_normalization::{UnicodeNormalization, char::is_combining_mark};

use std::time::Duration;

pub async fn scrape_genres_and_tags(title: &str, sleep_duration: u64, from_url: Option<String>) -> Result<Vec<String>> {
    let browser = browser::init()?;
    let novel_info_url: String = from_url.unwrap_or(construct_url(title)?);
    let tab = browser.new_tab()?;
    browser::configure_tab(&tab)?;

    tab.navigate_to(&novel_info_url)?;
    sleep(Duration::from_secs(sleep_duration)).await;

    let html = tab.get_content()?;
    tab.close_with_unload()?;
    parse_genres_and_tags(&html, &novel_info_url)
}

fn parse_genres_and_tags(html: &str, url: &str) -> Result<Vec<String>> {
    // first check if cloudflare is blocking
    if html.to_ascii_lowercase().contains("cloudflare") {
        return Err(Error::msg("Error: Blocked by cloudflare"));
    }

    // check if html contains a 404
    let document = Html::parse_document(html);
    let error_selector = Selector::parse(".page-404").unwrap();
    if document.select(&error_selector).next().is_some() {
        return Err(Error::msg(format!("Error: url not found: {url}")));
    }

    // otherwise scrape the elements
    let genres_selector = Selector::parse("#seriesgenre").unwrap();
    let tags_selector = Selector::parse("#showtags").unwrap();
    let link_selector = Selector::parse("a").unwrap();

    let genres_iter = document.select(&genres_selector);
    let tags_iter = document.select(&tags_selector);
    let mut res = Vec::new();

    for group in genres_iter.chain(tags_iter)  {
        for link in group.select(&link_selector) {
            res.push(decode_html_entities(&link.inner_html()).to_string());
        }
    }
    Ok(res)
}

fn construct_url(title: &str) -> Result<String> {
    const FORBIDDEN_CHARS: &str = "‘’“”–…";
    const REPLACE_WITH_DASH: &str = ". /";

    // perform character substitutions and filtering
    let filtered: String = title
        // handle unicode alphabetical characters
        .nfd().filter(|c| !is_combining_mark(*c))

        // everything else
        .map(|c| if REPLACE_WITH_DASH.contains(c) {'-'} else {c})
        .filter(|c| !c.is_ascii_punctuation() || *c == '-')
        .filter(|c| !FORBIDDEN_CHARS.contains(*c))
        .map(|c| c.to_ascii_lowercase())
        .collect();

    // in case of having multiple dashes in a row, condense them into one
    let mut filtered_2  = match filtered.chars().next() {
        Some(c) => c.to_string(),
        None => return Err(Error::msg(format!("No characters in the title were valid: [{title}]"))),
    };

    for c in filtered.chars().skip(1) {
        let last_char = filtered_2.chars().last().expect("filtered_2 should be non-empty");
        if c == '-' && last_char == '-' {
            continue;
        }
        filtered_2.push(c);
    }

    Ok(format!("https://www.novelupdates.com/series/{filtered_2}/"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use dotenv::dotenv;

    #[test]
    fn empty_title_url() {
        let title = "";
        let url = construct_url(title);
        assert!(url.is_err());
    }

    #[test]
    fn space_url() {
        let title = "Lord of the Mysteries";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/lord-of-the-mysteries/");
    }

    #[test]
    fn period_url() {
        let title = "D.I.O";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/d-i-o/");
    }

    #[test]
    fn slash_url() {
        let title = "11/23";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/11-23/");
    }

    #[test]
    fn dash_url() {
        let title = "The Heaven-Slaying Sword";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/the-heaven-slaying-sword/");
    }

    #[test]
    fn spaced_dash_url() {
        let title = "Delivery Boy and Masked Girl – A Delivery Boy Discovers the Secret of a Beautiful Gal at His Delivery Destination";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/delivery-boy-and-masked-girl-a-delivery-boy-discovers-the-secret-of-a-beautiful-gal-at-his-delivery-destination/");
    }

    #[test]
    fn apostrophe_url() {
        let title = "Omniscient Reader's Viewpoint";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/omniscient-readers-viewpoint/");
    }

    #[test]
    fn special_single_quote_url() {
        let title = "I Reunited with My Graceful and Lovely Childhood Friend After Transferring Schools, but Her Idea of a ‘Childhood Friend’ Is Clearly Strange and Overbearing";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/i-reunited-with-my-graceful-and-lovely-childhood-friend-after-transferring-schools-but-her-idea-of-a-childhood-friend-is-clearly-strange-and-overbearing/");
    }

    #[test]
    fn tilda_url() {
        let title = "The Villainous Daughter’s Butler ~I Raised Her to be Very Cute~";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/the-villainous-daughters-butler-i-raised-her-to-be-very-cute/");
    }

    #[test]
    fn comma_url() {
        let title = "As I Know Anything About You, I’ll Be The One To Your Girlfriend, Aren’t I?";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/as-i-know-anything-about-you-ill-be-the-one-to-your-girlfriend-arent-i/");
    }

    #[test]
    fn paren_url() {
        let title = "Yumemiru Danshi wa Genjitsushugisha (LN)";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/yumemiru-danshi-wa-genjitsushugisha-ln/");
    }

    #[test]
    fn bracket_url() {
        let title = "[Koi Bana] Kore wa Tomodachi no Hanashina Nandakedo";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/koi-bana-kore-wa-tomodachi-no-hanashina-nandakedo/");
    }

    #[test]
    fn punctuation_url() {
        let title = "When I Made The Cheeky Childhood Friend Who Provoked Me With “You Can’t Even Kiss, Right?” Know Her Place, She Became More Cutesy Than I Expected";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/when-i-made-the-cheeky-childhood-friend-who-provoked-me-with-you-cant-even-kiss-right-know-her-place-she-became-more-cutesy-than-i-expected/");
    }

    #[test]
    fn special_dot_url() {
        let title = "Reincarnated • The Hero Marries the Sage ~After Becoming Engaged to a Former Rival, We Became the Strongest Couple~";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/reincarnated-•-the-hero-marries-the-sage-after-becoming-engaged-to-a-former-rival-we-became-the-strongest-couple/");
    }

    #[test]
    fn special_o_url() {
        let title = "Kimi no Sei de Kyō Mo Shinenai";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/kimi-no-sei-de-kyo-mo-shinenai/");
    }

    #[test]
    fn special_periods_url() {
        let title = "Crossing Paths, Traumatized, and Yet…";
        let url = construct_url(title).unwrap();
        assert_eq!(url, "https://www.novelupdates.com/series/crossing-paths-traumatized-and-yet/");
    }

    #[tokio::test]
    #[ignore]
    async fn scrape_lotm() {
        dotenv().ok();
        let res = scrape_genres_and_tags("Lord of the Mysteries", 5, None).await.unwrap();
        assert!(res.len() > 50);
    }

    #[tokio::test]
    #[ignore]
    async fn scrape_invalid() {
        dotenv().ok();
        let res = scrape_genres_and_tags("laksjdflkajsdglh", 2, None).await;
        assert!(res.is_err());
    }
}