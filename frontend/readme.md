# Setting up the frontend

## Prerequisites:
* Node
 
## Steps
1. Install the dependencies: `npm i`
2. Create .env.local to store your environmental variables. The backend requires you to declare:

* BACKEND_URL
    * See which `DOMAIN` was used for the backend
* NEXTAUTH_URL
    * yourFrontendUrl
* NEXTAUTH_SECRET
    * Generate your own
* APP_GITHUB_ID
* APP_GITHUB_SECRET
    * Create a Github OAuth App to obtain these
* ADMIN_EMAIL

3. Run the server: `npm run dev`. Alternatively, a production build can be made using `npm run build`. Note that some functionalities 
will not work if the backend server isn't already running.
