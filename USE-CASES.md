# Verify Impression Tracking

One of the use cases for the test adserver is to be able to automate the verification of correctly implemented ad impression tracking. In the VAST response from the test adserver each ad has tracking URLs that points back to the test adserver. All tracked events are stored and can be checked via the API that the test adserver provides.

Configure the SSAI service to use the test adserver's VAST tag (endpoint), e.g. `https://<testadserver>/api/v1/vast?dur={{requestedDuration}}&uid={{userId}}...`

1. With the application to verify, open an asset that has an SSAI enabled stream configured to use the test adserver config above.
2. At the first ad-break a request to the above VAST tag will be issued and a `session` will be created. Provide a user ID in the request in (1) to easier be able to filter out the sessions.
3. When the player has completed playing the ad-break you can check that all ad impression tracking events were fired for this USERID.
4. Get a list of all sessions for this user: `https://<testadserver>/api/v1/users/USERID`
5. Take the SESSIONID from latest session in this list and check what events were fired from this endpoint: `https://<testadserver>/api/v1/sessions/SESSIONID/events`

Automate the above process in the build pipeline for automated regression testings.