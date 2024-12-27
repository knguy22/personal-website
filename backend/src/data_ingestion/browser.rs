use anyhow::Result;
use headless_chrome::{Browser, LaunchOptions, Tab, protocol::cdp::Page};

use std::{env, path::PathBuf};

pub fn init() -> Result<Browser> {
    let chrome_binary = Some(PathBuf::from(env::var("CHROME_PATH")?));
    let launch_options = LaunchOptions::default_builder()
        .path(chrome_binary)
        .sandbox(false)
        .build()?;
    Browser::new(launch_options)
}

pub fn configure_tab(tab: &Tab) -> Result<()> {
    let user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    let accept_language = Some("en-US,en");
    let platform = Some("Win32");

    tab.set_user_agent(user_agent, accept_language, platform)?;
    Ok(())
}

#[allow(unused)]
pub fn screenshot(path: &str, tab: &Tab) -> Result<()> {
    let data = tab.capture_screenshot(
        Page::CaptureScreenshotFormatOption::Jpeg,
        None,
        None,
        true)?;
    std::fs::write(path, data)?;
    Ok(())
}