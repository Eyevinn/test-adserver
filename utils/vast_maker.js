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
      "https://r1---sn-uxaxovg-5gok.gvt1.com/videoplayback/id/b96674ee53e47835/itag/18/source/gfp_video_ads/requiressl/yes/acao/yes/mime/video%2Fmp4/ctier/L/ip/0.0.0.0/ipbits/0/expire/1619611421/sparams/acao,ctier,expire,id,ip,ipbits,itag,mh,mime,mip,mm,mn,ms,mv,mvi,pl,requiressl,source/signature/203A67B649D26929E02DDBA91A0536DE0D24A0FC.44E2B9243FDF4FD50950BA56BBFFB59B0255BE3D/key/cms1/cms_redirect/yes/mh/9Z/mip/85.226.117.43/mm/28/mn/sn-uxaxovg-5gok/ms/nvh/mt/1619589857/mv/m/mvi/1/pl/19/file/file.mp4",
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
  for (let i = 0; i < sampleAds.length; i++) {
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
