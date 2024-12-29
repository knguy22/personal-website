use anyhow::{Error, Result};
use tokio::{fs, process::Command};

use std::env;
use std::path::Path;

pub async fn run(board_width: u32, board_height: u32, source_image: &Path) -> Result<Vec<u8>> {
    let output_path = Path::new("tmp_tetris.png");
    let image_to_tetris_binary = env::var("IMAGE_TO_TETRIS_PATH")?;

    let command = Command::new(image_to_tetris_binary)
        .arg("-p")
        .arg("approx-image")
        .arg(source_image)
        .arg(output_path)
        .arg(format!("{board_width}"))
        .arg(format!("{board_height}"))
        .output()
        .await?;

    if !command.status.success() {
        return Err(Error::msg(String::from_utf8_lossy(&command.stderr).to_string()));
    };

    let output_img = fs::read(output_path).await?;
    Ok(output_img)
}

#[cfg(test)]
mod tests {
    use super::*;
    use dotenv::dotenv;

    #[tokio::test]
    #[ignore]
    async fn approx_image() {
        dotenv().ok();
        let source = Path::new("test_assets/blank.jpeg");
        let res = run(10, 10, source).await;
        res.unwrap();
    }

}