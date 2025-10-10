# Eyevinn Test Adserver

The Eyevinn Test Adserver is a specialized testing service for ad insertion workflows in video streaming platforms. This service generates predictable VAST responses with mock ad creatives and simulates real ad server behavior for comprehensive testing purposes.

## Key Features & Benefits

- **Always Returns Ads**: Standardized VAST format ensures consistent, reliable testing
- **Comprehensive Tracking**: Stores all received query parameters and tracks all playback events
- **Custom Ad Support**: Configure custom ad videos via MRSS feed
- **API-First Design**: Complete Swagger documentation for easy integration
- **Debugging Capabilities**: Debug query parameter transmission across the entire ad workflow

## Primary Use Cases

- **Server-Side Ad Insertion (SSAI)**: Test stitching workflows with guaranteed ad responses
- **Client-Side Ad Insertion (CSAI)**: Validate client-side ad implementations
- **Parameter Verification**: Ensure query parameters pass correctly from client devices through SSAI components
- **Tracking Validation**: Verify client devices implement correct tracking with comprehensive event logging
- **Integration Testing**: Test ad workflows across different platforms and devices

This component is released under open source and we are happy for contributions!

<br/>

## 🚀 Get Started Instantly with Open Source Cloud

Deploy and run the Test Adserver without any setup using **Open Source Cloud (OSC)** - the fastest way to get started:

<div align="center">

[![Deploy on OSC](https://img.shields.io/badge/Deploy%20on%20OSC-24243B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyKSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI3IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPGRlZnM%2BCjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyIiB4MT0iMTIiIHkxPSIwIiB4Mj0iMTIiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjQzE4M0ZGIi8%2BCjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzREQzlGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM%2BCjwvc3ZnPgo%3D)](https://app.osaas.io/browse/eyevinn-test-adserver)

</div>

### Why Choose Open Source Cloud?

✅ **Zero Setup Required** - Deploy instantly without local configuration  
✅ **Managed Infrastructure** - No need to worry about servers, scaling, or maintenance  
✅ **Built-in Monitoring** - Real-time service health and performance metrics  
✅ **Automatic Updates** - Always run the latest version with security patches  
✅ **Cost-Effective** - Pay only for what you use with transparent pricing  

**Perfect for:**
- QA teams needing reliable testing environments
- Developers validating ad integration implementations  
- Organizations requiring consistent ad testing workflows
- Teams wanting to focus on development, not infrastructure management

[**Get started with OSC →**](https://app.osaas.io/browse/eyevinn-test-adserver)

## Requirements

- Node.js v18+ (LTS recommended: Node.js 20 or 22)

## Database

Right now the test-adserver uses in-memory storage for all its data, no external database is required.

In a future update, we will add support for persistent storage using PostgreSQL.
Other databases can be used also, as long as they follow the same implementation steps that of the coming PostgreSQL example.

## Usage

- `git clone https://github.com/Eyevinn/test-adserver.git`
- `cd test-adserver`
- `npm install`, then
- `npm start` to run the server.
- `npm run dev` to run the server in dev mode with nodemon listening to updates.
- `npm run test` to run the unittests with Node-Tap.

## Endpoints

- GET `/api/docs` to access the complete `Swagger` documentation.
- GET `/api/v1/sessions` to get list of sessions, newest first.
- GET `/api/v1/sessions/:sessionId` to get a specific session.
- DELETE `/api/v1/sessions/:sessionId` to remove a specific session.
- GET `/api/v1/sessions/:sessionId/tracking` to send tracking data to server through query parameters.
- GET `/api/v1/sessions/:sessionId/events` to get a list of all tracked events for a session.
- GET `/api/v1/sessions/:sessionId/vast` to get the VAST XML that was issued for a specific session.
- GET `/api/v1/users/userId` to get all sessions for a specific user, newest first.
- GET `/api/v1/vast` to create a session and get a VAST-XML file, may also use query parameters.
- GET `/api/v1/vmap` to create a session and get a VMAP-XML file, may also use query parameters.
- GET `/api/v1/ads` to create a session and get either a VAST or VMAP response based on rt parameter. Accepts all query parameters from both /vast and /vmap endpoints.

## Environment variables

- `ADSERVER` Public hostname and port for service. Needed for tracking, defaults to `localhost:8080`.
- `HOST` To set the interface that the server listens to. Default is `localhost`.
- `PORT` To set the port that the server listens to. Default is `8080`.
- `MRSS_ORIGIN` To set the mRSS origin endpoint for when fetching custom ad-lists. It will use default ads otherwise.
- `CACHE_MAX_AGE` To set maximum age for ad-list cache, in milliseconds. Default is `300000` (5 minutes).

## Docker

To build the `adserver-api` image run:

    docker build . -t adserver-api:local --no-cache

A `docker-compose` config file is also provided that takes care of building the image.

Start the service:

    docker-compose up

Stop the service:

    docker-compose down

## Using Specific Ads

If the enviroment variable `MRSS_ORIGIN` has been set, then the test-adserver shall return VAST responses populated with Ads selected from
the collection of Ads found in the mRSS feed that can be reached through this origin endpoint. The url for the feed should follow this structure
`${MRSS_ORIGIN}${ADSERVER_HOST}.mrss`. Where `ADSERVER_HOST` is the same as the host data that can be found in the request headers sent to the test-adserver.

For example:
Let's say we set `MRSS_ORIGIN=https://mrss.adtest.eyevinn.technology/` and are hosting the test-adserver on `your.chosen.host`.

Knowing the adserver host and `MRSS_ORIGIN`, the test-adserver will then fetch the feed.mrss file from:
`https://mrss.adtest.eyevinn.technology/your.chosen.host.mrss`. So make sure that an mRSS feed is available on such an URL. If the url becomes unreachable, then the test-adserver will go back to the default ads.

Alternatively, you can specify what file contains the collection of ads through the `coll` parameter on the `/api/v1/vast` or `/api/v1/vmap` request. In this case, the file will be expected to be at `${MRSS_ORIGIN}${coll}.mrss`. This is useful for example if you want to switch easily between different collection of ads without having to host multiple ad servers.

### MRSS Feed Structure

The test-adserver is expecting an mRSS feed which should include text/xml with the following structure:

```
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>My Chosen Ads List</title>                         //Title of feed
  <id>aaa-123-bbb-123</id>                                  //Unique ID for feed
  <updated>2021-09-09T18:00:00Z</updated>                   //Date in ISO format for when feed was last updated
  <entry>                                                   
    <id>hotdog_ad_2021</id>                                 //ID for the ad
    <universalId>AAAA</universalId>                         //The ad's Universal ADID 
    <link>https://server.hotdog_ad_1.mp4</link>             //URL to the ad resource
    <duration>00:00:16</duration>                           //Duration of ad in format-> HH:MM:SS
    <bitrate>17700</bitrate>                                //The ad's video bitrate
    <width>1920</width>                                     //The ad's video width
    <height>1080</height>                                   //The ad's video height
    <codec>H.264</codec>                                    //The ad's video codec
  </entry> 
</feed>
```

Simply populate your xml file with `<entry></entry>` tags for each Ad asset with the necessary data (id, universalId, link, duration, etc...).

If you have ads in multiple formats (eg. DASH, HLS, MP4), you can add multiple `<link></link>` for each one.

## Deployment Options

### 🌟 Open Source Cloud (Recommended)

The fastest and most convenient way to deploy the Test Adserver is through **Open Source Cloud**:

- **Instant Deployment**: Get up and running in minutes, not hours
- **Zero DevOps Overhead**: Managed infrastructure, monitoring, and maintenance
- **Scalable**: Automatically scales based on your testing needs
- **Always Updated**: Latest features and security patches applied automatically
- **Cost-Efficient**: Pay-per-use pricing model

[**Deploy on Open Source Cloud →**](https://app.osaas.io/browse/eyevinn-test-adserver)

### Self-Hosting Options

For organizations requiring on-premises deployment, we offer commercial support:

**Managed Hosting**: We host the service in our environment for a monthly recurring fee, including business hours support on a best effort basis.

**Deployment Assistance**: We help you deploy and integrate the service in your environment on a time-of-material basis.

### Professional Services

**Feature Development**: When you need custom features developed, we can introduce them in the current codebase under the open source license on a time-of-material basis.

**Integration Support**: Need help building integration adapters or other development related to this project? Our development team can assist on a time-of-material basis.

Contact <sales@eyevinn.se> for pricing and more information on commercial options. 

## About Eyevinn Technology

Eyevinn Technology is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor.

At Eyevinn, every software developer consultant has a dedicated budget reserved for open source development and contribution to the open source community. This give us room for innovation, team building and personal competence development. And also gives us as a company a way to contribute back to the open source community.

Want to know more about Eyevinn and how it is to work here. Contact us at <work@eyevinn.se>!
