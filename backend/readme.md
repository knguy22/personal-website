# Setting up the backend

## Prerequisites:
* Rust (cargo)
* PostgreSQL (make sure to have a postgres username and password ready)
* Chrome Binary
* image-to-tetris binary
    * See my other project [here](https://github.com/knguy22/image-to-tetris) for the requirements

## Steps
1. Create `.env` to store your environmental variables. The backend requires you to declare:
* DOMAIN
    * Where you want to host this backend server. For example: 127.0.0.1:5000
* DATABASE_URL
    * See postgres' documentation for how to connect using a database url
* CHROME_PATH
    * The relative path of the chrome binary
* IMAGE_TO_TETRIS_PATH
    * The relative path of the image-to-tetris binary

2. Install sea-orm-cli: `cargo install sea-orm-cli`
3. Run the migrations: `sea-orm-cli migrate`
4. Build and run the app: `cargo run`. This will also install the dependencies.
