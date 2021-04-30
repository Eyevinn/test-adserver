# test-adserver

An adserver implementation to verify ad tracking implementations

## Usage 
- `git clone https://github.com/Eyevinn/test-adserver.git`
- `cd test-adserver`
- `npm install`, then
- `npm start` to run the server.
- `npm run dev` to run the server in dev mode with nodemon listening to updates.
- `npm run test` to run the unittests with Node-Tap.

## Docker

To build the `adserver-api` image run:

    docker build . -t adserver-api:local --no-cache

A `docker-compose` config file is also provided that takes care of building the image.

Start the service:

    docker-compose up

Stop the service:

    docker-compose down

### With local database

A separate docker compose file is provided that will also create a local postgres database:

    docker-compose -f docker-compose-postgresql.yml up

And to stop:

    docker-compose -f docker-compose-postgresql.yml down

#### Persistent storage

The directory `.pgdata` is mounted inside the postgres container for persistance. If you wish to change the location, update `docker-compose-postgresql.yml` accordingly:

    volumes: 
      - /path/to/somewhere/else:/var/lib/postgresql/data