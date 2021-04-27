const createVast = require("vast-builder");

/**
 * description: "To build the tracking end-point"
 * @param {*} opt =
 * {
 *      adserverHostname = { type: "string" },
 *      sessionId = { type: "string" },
 * }
 */

const sampleAds = [
  {
    id: "sample-ad_001",
    url:
      "https://redirector.gvt1.com/videoplayback/id/a33fc5b2685eb16e/itag/22/source/gfp_video_ads/requiressl/yes/acao/yes/mime/video%2Fmp4/ctier/L/ip/0.0.0.0/ipbits/0/expire/1619459389/sparams/ip,ipbits,expire,id,itag,source,requiressl,acao,mime,ctier/signature/204F535B065918DC7C21D9C1789D710D9C20658A.52540F9C4C1EB2E7E541D2B7D6A1E2D7E4D1A928/key/ck2/file/file.mp4",
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

function vastBuilder(opt) {
  const vast4 = createVast.v4();
  // Add <Ad>-tags for every ad in the sampleAds list
  for (let i = 0; i < 3; i++) {
    vast4
      .attachAd({ id: `AD-ID_00${i + 1}`, sequence: `${i + 1}` })
      .attachInLine()
      .addImpression("about:blank", { id: `IMPRESSION-ID_00${i + 1}` })
      .addAdSystem(`Test Adserver`)
      .addAdTitle(`Ad That Test-Adserver Wants Player To See #${i + 1}`)
      .attachCreatives()
      .attachCreative({
        id: `CRETIVE-ID_00${i + 1}`,
        adId: `${sampleAds[i].id}`,
        sequence: `${i + 1}`,
      })
      .attachLinear()
      .attachTrackingEvents()
      .addTracking(
        `http://${opt.adserverHostname}/api/v1/sessions/${opt.sessionId}/tracking?adId=${sampleAds[i].id}&progress=0`,
        { event: "start" }
      )
      .addTracking(
        `http://${opt.adserverHostname}/api/v1/sessions/${opt.sessionId}/tracking?adId=${sampleAds[i].id}&progress=25`,
        { event: "firstQuartile" }
      )
      .addTracking(
        `http://${opt.adserverHostname}/api/v1/sessions/${opt.sessionId}/tracking?adId=${sampleAds[i].id}&progress=50`,
        { event: "midpoint" }
      )
      .addTracking(
        `http://${opt.adserverHostname}/api/v1/sessions/${opt.sessionId}/tracking?adId=${sampleAds[i].id}&progress=75`,
        { event: "thirdQuartile" }
      )
      .addTracking(
        `http://${opt.adserverHostname}/api/v1/sessions/${opt.sessionId}/tracking?adId=${sampleAds[i].id}&progress=100`,
        { event: "complete" }
      )
      .and()
      .addDuration(sampleAds[i].duration)
      .attachMediaFiles()
      .attachMediaFile(sampleAds[i].url, {
        delivery: "progressive",
        type: "video/mp4",
      })
      .back();
  }

  return vast4.toXml();
}

module.exports = { vastBuilder };
