const createVast = require('vast-builder');

// URL of the image creative reused for both pause-ad shapes.
const PAUSE_AD_IMAGE_URL = "https://testcontent.eyevinn.technology/ads/STSWE_AD_001.jpg";
const PAUSE_AD_IMAGE_MIME = "image/jpeg";

// Marker attached to the linear pause ad so consumers understand it is a
// deliberate, tolerated non-conformant emulation and not reference-correct
// VAST 4.x. Some real ad servers deliver pause ads this way (an image in a
// <MediaFile> inside a <Linear>), which this mode is meant to reproduce.
const LINEAR_PAUSE_AD_EMULATION_NOTE =
  "Deliberate pause-ad emulation: this <Linear> carries an image <MediaFile> " +
  "instead of a video. This is a tolerated non-conformant shape used to emulate " +
  "ad servers that serve pause ads as linear ads. It is NOT reference-correct VAST 4.x.";

function newVast(version) {
  switch (version) {
    case "2":
      return createVast.v2();
    case "3":
      return createVast.v3();
    default:
      return createVast.v4();
  }
}

function trackingUrls(params, adId) {
  const base = `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking`;
  return {
    impression: `${base}?${adId}=pause-ad&progress=vast`,
    start: `${base}?${adId}=pause-ad&progress=0`,
    complete: `${base}?${adId}=pause-ad&progress=100`,
    pause: `${base}?${adId}=pause-ad&event=pause`,
  };
}

// Non-linear pause ad (the historical default): image delivered as a
// <NonLinear> static resource. This is the spec-correct shape for pause ads.
function buildNonLinearPauseAd(params) {
  const vast = newVast(params.version);
  const adId = vast.attrs.version === "4.0" ? "adId" : "adID";
  const width = params.width || 300;
  const height = params.height || 167;
  const t = trackingUrls(params, adId);

  vast
    .attachAd({ id: "pause-ad-1" })
    .attachInLine()
    .addAdSystem("Test Adserver")
    .addAdTitle("Pause Ad")
    .addImpression(t.impression, { id: "pause-ad-impression-1" })
    .attachCreatives()
    .attachCreative({ id: "pause-ad-creative-1", [adId]: "pause-ad" })
    .attachNonLinearAds()
    .attachTrackingEvents()
    .addTracking(t.start, { event: "start" })
    .addTracking(t.complete, { event: "complete" })
    .addTracking(t.pause, { event: "pause" })
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
    .addStaticResource(PAUSE_AD_IMAGE_URL, { creativeType: PAUSE_AD_IMAGE_MIME })
    .addNonLinearClickThrough("https://github.com/Eyevinn/test-adserver");

  return { xml: vast.toXml() };
}

// Linear pause ad emulation: a normal VAST response whose <Linear> creative
// points a <MediaFile> at an image instead of a video. This reproduces ad
// servers that serve pause ads as linear ads. It is intentionally non-conformant
// and labelled as such via <CreativeExtensions>.
function buildLinearPauseAd(params) {
  const vast = newVast(params.version);
  const adId = vast.attrs.version === "4.0" ? "adId" : "adID";
  const width = params.width || 300;
  const height = params.height || 167;
  const duration = params.duration || "00:00:20";
  const t = trackingUrls(params, adId);

  vast
    .attachAd({ id: "pause-ad-1" })
    .attachInLine()
    .addAdSystem("Test Adserver")
    .addAdTitle("Pause Ad")
    .addImpression(t.impression, { id: "pause-ad-impression-1" })
    .attachCreatives()
    .attachCreative({ id: "pause-ad-creative-1", [adId]: "pause-ad" })
    .attachLinear()
    .addDuration(duration)
    .attachTrackingEvents()
    .addTracking(t.start, { event: "start" })
    .addTracking(t.complete, { event: "complete" })
    .addTracking(t.pause, { event: "pause" })
    .and()
    .attachMediaFiles()
    .addMediaFile(PAUSE_AD_IMAGE_URL, {
      delivery: "progressive",
      type: PAUSE_AD_IMAGE_MIME,
      width: width,
      height: height,
    })
    .and()
    .attachVideoClicks()
    .addClickThrough("https://github.com/Eyevinn/test-adserver", { id: "pause-ad-click-1" })
    .and()
    .and()
    .attachCreativeExtensions()
    .addCreativeExtension(LINEAR_PAUSE_AD_EMULATION_NOTE, { type: "eyevinn-pause-ad-emulation" });

  return { xml: vast.toXml() };
}

function PauseAdVastBuilder(params) {
  if (params.format === "linear") {
    return buildLinearPauseAd(params);
  }
  return buildNonLinearPauseAd(params);
}

module.exports = { PauseAdVastBuilder };
