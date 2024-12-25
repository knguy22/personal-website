use anyhow::{Error, Result};
use headless_chrome::{Browser, LaunchOptions};
use scraper::{Html, Selector};
use unicode_normalization::{UnicodeNormalization, char::is_combining_mark};

use std::{env, path::PathBuf, thread, time::Duration};

pub fn init() -> Result<Browser> {
    let port = Some(1234);
    let chrome_binary = Some(PathBuf::from(env::var("CHROME_PATH")?));
    let launch_options = LaunchOptions::default_builder()
        .path(chrome_binary)
        .port(port)
        .sandbox(false)
        .build()?;
    Browser::new(launch_options)
}

pub async fn scrape_genres_and_tags(title: &str, sleep_duration: u64, from_url: Option<String>) -> Result<Vec<String>> {
    let browser = init()?;

    let url: String = from_url.unwrap_or(construct_url(title));
    let user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    let accept_language = Some("en-US,en");
    let platform = Some("Win32");

    let tab = browser.new_tab()?;
    tab.set_user_agent(user_agent, accept_language, platform)?;
    tab.navigate_to(&url)?;
    thread::sleep(Duration::from_secs(sleep_duration));

    let html = tab.get_content()?;
    tab.close_with_unload()?;
    parse_genres_and_tags(&html, &url)
}

fn parse_genres_and_tags(html: &str, url: &str) -> Result<Vec<String>> {
    // first check if cloudflare is blocking
    if html.to_ascii_lowercase().contains("cloudflare") {
        return Err(Error::msg("Error: Blocked by cloudflare"));
    }

    // check if html contains a 404
    let document = Html::parse_document(html);
    let error_selector = Selector::parse(".page-404").unwrap();
    if let Some(_) = document.select(&error_selector).next() {
        return Err(Error::msg(format!("Error: url not found: {}", url)));
    }

    // otherwise scrape the elements
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
    Ok(res)
}

fn construct_url(title: &str) -> String {
    const FORBIDDEN_CHARS: &str = "‘’“”–…";
    const REPLACE_WITH_DASH: &str = ". /";

    // perform character substitutions and filtering
    let filtered: String = title
        // handle unicode alphabetical characters
        .nfd().filter(|c| !is_combining_mark(*c))
        .map(|c| if REPLACE_WITH_DASH.contains(c) {'-'} else {c})

        // everything else
        .filter(|c| !c.is_ascii_punctuation() || *c == '-')
        .filter(|c| !FORBIDDEN_CHARS.contains(*c))
        .map(|c| c.to_ascii_lowercase())
        .collect();

    // in case of having multiple dashes in a row, condense them into one
    let mut filtered_2  = filtered.chars().nth(0).unwrap().to_string();
    for c in filtered.chars().skip(1) {
        let last_char = filtered_2.chars().nth_back(0).unwrap();
        if c == '-' && last_char == '-' {
            continue;
        }
        filtered_2.push(c);
    }

    format!("https://www.novelupdates.com/series/{}/", filtered_2)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{fs::File, io::Read, path::Path, vec};
    use dotenv::dotenv;

    #[test]
    fn space_url() {
        let title = "Lord of the Mysteries";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/lord-of-the-mysteries/");
    }

    #[test]
    fn period_url() {
        let title = "D.I.O";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/d-i-o/");
    }

    #[test]
    fn slash_url() {
        let title = "11/23";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/11-23/");
    }

    #[test]
    fn dash_url() {
        let title = "The Heaven-Slaying Sword";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/the-heaven-slaying-sword/");
    }

    #[test]
    fn spaced_dash_url() {
        let title = "Delivery Boy and Masked Girl – A Delivery Boy Discovers the Secret of a Beautiful Gal at His Delivery Destination";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/delivery-boy-and-masked-girl-a-delivery-boy-discovers-the-secret-of-a-beautiful-gal-at-his-delivery-destination/");
    }

    #[test]
    fn apostrophe_url() {
        let title = "Omniscient Reader's Viewpoint";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/omniscient-readers-viewpoint/");
    }

    #[test]
    fn special_single_quote_url() {
        let title = "I Reunited with My Graceful and Lovely Childhood Friend After Transferring Schools, but Her Idea of a ‘Childhood Friend’ Is Clearly Strange and Overbearing";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/i-reunited-with-my-graceful-and-lovely-childhood-friend-after-transferring-schools-but-her-idea-of-a-childhood-friend-is-clearly-strange-and-overbearing/");
    }

    #[test]
    fn tilda_url() {
        let title = "The Villainous Daughter’s Butler ~I Raised Her to be Very Cute~";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/the-villainous-daughters-butler-i-raised-her-to-be-very-cute/");
    }

    #[test]
    fn comma_url() {
        let title = "As I Know Anything About You, I’ll Be The One To Your Girlfriend, Aren’t I?";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/as-i-know-anything-about-you-ill-be-the-one-to-your-girlfriend-arent-i/");
    }

    #[test]
    fn paren_url() {
        let title = "Yumemiru Danshi wa Genjitsushugisha (LN)";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/yumemiru-danshi-wa-genjitsushugisha-ln/");
    }

    #[test]
    fn bracket_url() {
        let title = "[Koi Bana] Kore wa Tomodachi no Hanashina Nandakedo";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/koi-bana-kore-wa-tomodachi-no-hanashina-nandakedo/");
    }

    #[test]
    fn punctuation_url() {
        let title = "When I Made The Cheeky Childhood Friend Who Provoked Me With “You Can’t Even Kiss, Right?” Know Her Place, She Became More Cutesy Than I Expected";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/when-i-made-the-cheeky-childhood-friend-who-provoked-me-with-you-cant-even-kiss-right-know-her-place-she-became-more-cutesy-than-i-expected/");
    }

    #[test]
    fn special_dot_url() {
        let title = "Reincarnated • The Hero Marries the Sage ~After Becoming Engaged to a Former Rival, We Became the Strongest Couple~";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/reincarnated-•-the-hero-marries-the-sage-after-becoming-engaged-to-a-former-rival-we-became-the-strongest-couple/");
    }

    #[test]
    fn special_o_url() {
        let title = "Kimi no Sei de Kyō Mo Shinenai";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/kimi-no-sei-de-kyo-mo-shinenai/");
    }

    #[test]
    fn special_periods_url() {
        let title = "Crossing Paths, Traumatized, and Yet…";
        let url = construct_url(title);
        assert_eq!(url, "https://www.novelupdates.com/series/crossing-paths-traumatized-and-yet/");
    }

    #[test]
    fn gimai_html() {
        let mut html: String = String::new();
        let gimai_path = Path::new("./test_data/Gimai Seikatsu - Novel Updates.html");
        File::open(gimai_path).unwrap().read_to_string(&mut html).unwrap();

        let res = parse_genres_and_tags(&html, "").unwrap();
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
    #[ignore]
    async fn browser() {
        dotenv().ok();
        let res = scrape_genres_and_tags("Lord of the Mysteries", 5, None).await.unwrap();
        assert!(res.len() > 50);

        let res = scrape_genres_and_tags("laksjdflkajsdglh", 2, None).await;
        assert!(res.is_err());
    }
}