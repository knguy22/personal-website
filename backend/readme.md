# Setting up the backend

## Prerequisites:
* Rust (cargo)
* PostgreSQL (make sure to have a postgres username and password ready)

## Steps
1. Create .env to store your environmental variables. The backend requires you to declare:
* DOMAIN
    * Where you want to host this backend server. For example: 127.0.0.1:5000
* DATABASE_URL
    * See postgres' documentation for how to connect using a database url
* TABLE_NAME
    * The table responsible for hosting novels. Make sure this table has been created in the correct relation.

2. Install sea-orm-cli: `cargo install sea-orm-cli`
3. Run the migrations: `sea-orm-cli migrate`
4. Build and run the app: `cargo run`. This will also install the dependencies.
