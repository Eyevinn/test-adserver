const createVast = require('vast-builder');

function PauseAdVastBuilder(params) {
  let vast = null;

  switch (params.version) {
    case "2":
      vast = createVast.v2();
      break;
    case "3":
      vast = createVast.v3();
      break;
    default:
      vast = createVast.v4();
      break;
  }

  const adId = vast.attrs.version === "4.0" ? "adId" : "adID";

  // Use provided width and height, or default to 300x167
  const width = params.width || 300;
  const height = params.height || 167;

  vast
    .attachAd({ id: "pause-ad-1" })
    .attachInLine()
    .addAdSystem("Test Adserver")
    .addAdTitle("Pause Ad")
    .addImpression(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=pause-ad&progress=vast`, { id: "pause-ad-impression-1" })
    .attachCreatives()
    .attachCreative({ id: "pause-ad-creative-1", [adId]: "pause-ad" })
    .attachNonLinearAds()
    .attachTrackingEvents()
    .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=pause-ad&progress=0`, { event: "start" })
    .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=pause-ad&progress=100`, { event: "complete" })
    .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=pause-ad&event=pause`, { event: "pause" })
    .and()
    .attachNonLinear({
      id: "pause-ad-1",
      width: width,
      height: height,
      scalable: true,
      maintainAspectRatio: true,
      minSuggestedDuration: "00:00:05",
      apiFramework: "static",
    })
    .addStaticResource("https://testcontent.eyevinn.technology/ads/STSWE_AD_001.jpg", {creativeType:"image/jpeg"})
    .addNonLinearClickThrough("https://github.com/Eyevinn/test-adserver");

  const vastXml = vast.toXml();
  return { xml: vastXml };
}

module.exports = { PauseAdVastBuilder };