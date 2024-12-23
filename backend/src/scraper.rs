use anyhow::Result;
use url::Url;
use headless_chrome::{Browser, LaunchOptions};
use std::{path::PathBuf, thread, time::Duration};

async fn init() -> Result<Browser> {
    let port = Some(1234);
    let chrome_binary = Some(PathBuf::from("./chrome-linux64/chrome"));
    let launch_options = LaunchOptions::default_builder()
        .path(chrome_binary)
        .port(port)
        .build()?;
    Browser::new(launch_options)
}

async fn scrape_tags(browser: &Browser, title: &str) -> Result<Vec<String>> {
    let url = Url::parse(title)?;
    let user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    let accept_language = Some("en-US,en");
    let platform = Some("Win32");

    let tab = browser.new_tab()?;
    tab.set_user_agent(user_agent, accept_language, platform)?;
    tab.navigate_to(url.as_str())?;
    thread::sleep(Duration::from_secs(3));

    let text = tab.get_content()?;

    todo!()
}

mod tests {
    use super::*;

    #[tokio::test]
    async fn test_scrape_tags() {
        let browser = init().await.unwrap();
        let res = scrape_tags(&browser, "https://www.novelupdates.com/series/lord-of-the-mysteries/").await.unwrap();
        assert_ne!(res.len(), 0);
    }
}