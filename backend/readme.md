# Set up the Backend

1. Install rust
2. Install postgres
3. Initialize your postgres user and password
4. Create .env and place it inside src. It requires
* DOMAIN=
* TABLE_NAME=
* DATABASE_URL=
5. Install sea-orm-cli: `cargo install sea-orm-cli`
6. Run migrations: `sea-orm-cli migrate`
7. Build and run the app: `cargo run`