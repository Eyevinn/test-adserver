# test-adserver

An adserver implementation to verify ad tracking implementations

## Usage 
- `git clone https://github.com/Eyevinn/test-adserver.git`
- `cd test-adserver`
- `npm install`, then
- `npm start` to run the server.
- `npm run dev` to run the server in dev mode with nodemon listening to updates.
- `npm run test` to run the unittests with Node-Tap. (To Be Updated)

## Endpoints

- GET `/api/docs` to access the complete `Swagger` documentation.
- GET `/api/v1/sessions` to get list of sessions, newest first.
- GET `/api/v1/sessions/:sessionId` to get a specific session.
- DELETE `/api/v1/sessions/:sessionId` to remove a specific session.
- GET `/api/v1/users/userId` to get all sessions for a specific user, newest first.
- GET `/api/v1/sessions/:sessionId/tracking` to send tracking data to server through query parameters.
- GET `/api/v1/vast` to create a session and get a VAST-XML file, may also use query parameters.

## Environment variables

- `ADSERVER` Public hostname and port for service. Needed for tracking, defaults to `localhost:8080`
- `HOST` To set the interface that the server listens to. Default is `localhost`.
- `POST` To set the port that the server listens to. Default is `8080`.
- `API_KEY` (NOT YET IMPLEMENTED) To authorize certain API calls. Default is `secret-key`.

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