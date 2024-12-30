use anyhow::{Error, Result};
use tokio::{fs, process::Command};
use tempfile::tempdir;

use std::env;

pub async fn run(board_width: u32, board_height: u32, source_image: &[u8], image_format: &str) -> Result<Vec<u8>> {
    let temp_dir = tempdir()?;
    let source_path = temp_dir.path().join("source").with_extension(image_format);
    let output_path = temp_dir.path().join("output.png");
    let image_to_tetris_binary = env::var("IMAGE_TO_TETRIS_PATH")?;

    fs::write(&source_path, source_image).await?;

    let command = Command::new(image_to_tetris_binary)
        .arg("-p")
        .arg("approx-image")
        .arg(&source_path)
        .arg(&output_path)
        .arg(format!("{board_width}"))
        .arg(format!("{board_height}"))
        .output()
        .await?;

    if !command.status.success() {
        return Err(Error::msg(String::from_utf8_lossy(&command.stderr).to_string()));
    };

    let output_img = fs::read(&output_path).await?;
    fs::remove_file(source_path).await?;
    fs::remove_file(output_path).await?;

    Ok(output_img)
}

#[cfg(test)]
mod tests {
    use super::*;
    use dotenv::dotenv;
    use std::path::Path;

    #[tokio::test]
    #[ignore]
    async fn approx_image() {
        dotenv().ok();
        let source = Path::new("test_assets/blank.jpeg");
        let res = run(10, 10, &tokio::fs::read(source).await.unwrap(), "jpeg").await;
        res.unwrap();
    }

}