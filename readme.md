# WARNING: this repository is very much a WIP. Use at your own discretion.

# Running the Production Server

For reference, I am using a VPS with Almalinux 8.

## Requirements
* Cargo
* Postgres
* Npm
* Nginx

## Steps
1. Host the backend server on localhost. For now, I am doing this using `cargo run`. See [these instructions](./backend/readme.md) for more detals.
2. Build the frontend server using `npm run build`.
3. Host the frontend server using `pm2`. First, install using `npm install pm2`. Then, run the frontend using `pm2 start npm --name "your_server_name" -- start`
4. Forward the frontend using nginx. Add the following config to your `nginx.conf` file. The config was taken from the example from [this blog](https://blog.tericcabrel.com/deploy-a-node-js-application-with-pm2-and-nginx/). Then, restart the nginx server.

```sh
server {
    server_name  any_server_name;
    index index.html index.htm;
    access_log /var/log/nginx/nodeapp.log;
    error_log  /var/log/nginx/nodeapp-error.log error;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
        proxy_pass http://127.0.0.1:4500;
        proxy_redirect off;
    }
}
```
