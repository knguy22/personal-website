# Setting up the fackend

## Prerequisites:
* Node
* PostgreSQL (make sure to have a postgres username and password ready)

## Steps
1. Install the dependencies: `npm i`
2. Create .env.local to store your environmental variables. The backend requires you to declare:

* BACKEND_URL
    * See which `DOMAIN` was used for the backend
* NEXT_PUBLIC_URL
    * yourFrontendUrl
* NEXT_PUBLIC_API_URL
    * yourFrontendUrl/api
* NEXTAUTH_URL
    * yourFrontendUrl
* NEXTAUTH_SECRET
    * Generate your own
* GITHUB_ID
* GITHUB_SECRET
    * Create a Github OAuth App to obtain these
* ADMIN_EMAIL

3. Run the server: `npm run dev`. Alternatively, a production build can be made using `npm run build`. Note that some functionalities 
will not work if the backend server isn't already running.