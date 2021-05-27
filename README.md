# ce-backend

Check the docs folder for more info

# How to run this locally

## Update the git submodules

```
git submodule init
git submodule update
```

## Install the common-backend submodule dependencies

```
cd common-backend
npm i
```

## Run on local computer

### Create a DB

Follow the instructions in db/README.md.

### Create your configuration file for local

`cp config/local.example.js config/local.js`

Then update the new file with the DB password and DB name.

### Run the service

```
git clone ....
npm i
npm start
```

Then you can see the service hosted on http://localhost:1337

## Running with docker

```
docker build -t path/to/ce-backend .
docker images
docker run -p 49160:1337 -d path/to/ce-backend
docker ps
docker logs path/to/ce-backend
docker logs 8957eacf29ef
```

Then you can see the service hosted on http://localhost:49160

## Database Connection

For now, this links up to demo.meri.co

You can modify this here: ce-backend/api/util/database.js

## Getting the user from req

The user can be found as req.user on all requests

## Generating SSL

`openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365`

## How to set up https on AWS

- Generate a certificate in ACM
- Set the security group of the load balancer to expose port 443
- Edit the load balancer Listeners to have 443 and the certificate you made

## How to see all sql queries

`DEBUG=true node app.js`

## How to migrate the DB

npx sequelize db:migrate --url 'postgresql://user:password@host/database'
