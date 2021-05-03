const createVast = require("vast-builder");
const timestampToSeconds = require("timestamp-to-seconds");

const AdList = [
  {
    id: "sample-ad_001",
    url:
      "https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro.mp4",
    duration: "00:00:10",
  },
  {
    id: "sample-ad_002",
    url:
      "https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro.mp4",
    duration: "00:00:16",
  },
  {
    id: "sample-ad_003",
    url: "https://s0.2mdn.net/4253510/google_ddm_animation_480P.mp4",
    duration: "00:01:00",
  },
];

/**
 *
 * @param {Object} params - Contains properties used to build the tracking end-point.
 * @returns {Object} Object containing "xml" and "duration" properties.
 *
 * @example
 * params = {
 * desiredDuration: "60",
 * sessionId: "abc-123",
 * adserverHostname: "localhost:8080"
 * }
 */
function VastBuilder(params) {
  let vastObject = {};

  const [selectedAds, adsDuration] = GetAdsAndDuration(params.desiredDuration);

  const vast4 = createVast.v4();
  // Add <Ad>-tags for every ad in the sampleAds list
  for (let i = 0; i < selectedAds.length; i++) {
    vast4
      .attachAd({ id: `AD-ID_00${i + 1}`, sequence: `${i + 1}` })
      .attachInLine()
      .addImpression("about:blank", { id: `IMPRESSION-ID_00${i + 1}` })
      .addAdSystem(`Test Adserver`)
      .addAdTitle(`Ad That Test-Adserver Wants Player To See #${i + 1}`)
      .attachCreatives()
      .attachCreative({
        id: `CRETIVE-ID_00${i + 1}`,
        adId: `${selectedAds[i].id}`,
        sequence: `${i + 1}`,
      })
      .attachLinear()
      .attachTrackingEvents()
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}&progress=0`,
        { event: "start" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}&progress=25`,
        { event: "firstQuartile" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}&progress=50`,
        { event: "midpoint" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}&progress=75`,
        { event: "thirdQuartile" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}&progress=100`,
        { event: "complete" }
      )
      .and()
      .addDuration(selectedAds[i].duration)
      .attachMediaFiles()
      .attachMediaFile(selectedAds[i].url, {
        delivery: "progressive",
        type: "video/mp4",
      })
      .back();
  }
  vastObject = { xml: vast4.toXml(), duration: adsDuration };

  return vastObject;
}

// Assuming Access to a List of Ads.
const GetAdsAndDuration = (targetDuration) => {
  targetDuration = parseInt(targetDuration);
  let remainingDuration = targetDuration;
  let chosenAds = [];
  let actualDuration;
  // Sort Main Ad List in Descending order.
  AdList.sort((a, b) =>
    timestampToSeconds(a.duration) > timestampToSeconds(b.duration) ? -1 : 1
  );
  // Adding to chosenAds list based on durations; Add the longest Ad possible.
  for (let i = 0; i < AdList.length; i++) {
    const adDuration = timestampToSeconds(AdList[i].duration);
    if (adDuration <= remainingDuration) {
      chosenAds.push(AdList[i]);
      remainingDuration = remainingDuration - adDuration;
    }
  }
  // Calculate the actual duration.
  actualDuration = targetDuration - remainingDuration;

  return [chosenAds, actualDuration.toString()];
};
module.exports = { VastBuilder };
