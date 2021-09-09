# Eyevinn Test Adserver

The Eyevinn Test Adserver is an adserver that can be used in different testing contexts. Examples of use cases:

- Ad server for testing server-side ad-insertion (SSAI) stitching as the VAST response always contains ads and creatives.
- Verify what query parameters are passed from the client device through the SSAI component as it stores all received query parameters for a request (session).
- Verify that client devices implement correct tracking as the VAST response contains tracking URLs back to the test ad server. All tracked events for a session is stored and can be obtained by the API.

You can build and run a container in your own hosted environment or Eyevinn can host it for you. It will then be available for you on `<yourdomain>.adtest.eyevinn.technology`. Contact sales@eyevinn.se for pricing and more information.

This component is released under open source and we are happy for contributions!

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


## About Eyevinn Technology

Eyevinn Technology is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor.

At Eyevinn, every software developer consultant has a dedicated budget reserved for open source development and contribution to the open source community. This give us room for innovation, team building and personal competence development. And also gives us as a company a way to contribute back to the open source community.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!
