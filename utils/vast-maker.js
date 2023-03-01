const createVast = require('vast-builder');
const timestampToSeconds = require('timestamp-to-seconds');
const { TENANT_CACHE } = require('./utilities');

const PopulationMethods = Object.freeze({
  GO_BY_MIN: 1,
  GO_BY_MAX: 2,
  GO_BY_SIZE_AND_MAX: 3,
});

const DEFAULT_AD_LIST = [
  {
    universalId: "AAA/BBBB123/",
    id: "streamingtech_ad",
    url: "https://testcontent.eyevinn.technology/ads/probably-the-best-10s.mp4",
    duration: "00:00:10",
    bitrate: "17700",
    width: "1920",
    height: "1080",
    codec: "H.264",
  },
  {
    universalId: "AAA/CCCC123/",
    id: "25percent-ad_001",
    url: "https://static.videezy.com/system/resources/previews/000/019/185/original/25percent-blue.mp4",
    duration: "00:00:05",
    bitrate: "600",
    width: "630",
    height: "354",
    codec: "H.264",
  },
  {
    universalId: "AAA/DDDD123/",
    id: "sample-ad_002",
    url: "https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro.mp4",
    duration: "00:00:16",
    bitrate: "1000",
    width: "1280",
    height: "720",
    codec: "H.264",
  },
  {
    universalId: "AAA/EEEE123/",
    id: "sample-ad_003",
    url: "https://s0.2mdn.net/4253510/google_ddm_animation_480P.mp4",
    duration: "00:01:00",
    bitrate: "900",
    width: "854",
    height: "480",
    codec: "H.264",
  },
  {
    universalId: "AAA/FFFF123/",
    id: "stswe",
    url: "https://testcontent.eyevinn.technology/ads/stswe-ad-30sec.mp4",
    duration: "00:00:30",
    bitrate: "10041",
    width: "1920",
    height: "1080",
    codec: "H.264",
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
 * podSize: "3",
 * podMin: "10",
 * podMax: "40"
 * }
 */
function VastBuilder(params) {
  let vastObject = {};
  let adList = [];
  // Use Default AdList OR get new List from TENANT_CACHE.
  let tenantId;
  if (params.adserverHostname) {
    tenantId = params.adserverHostname;
  }
  if (!TENANT_CACHE[tenantId]) {
    adList = DEFAULT_AD_LIST;
  } else {
    adList = TENANT_CACHE[tenantId].cachedAdList;
  }

  let [selectedAds, adsDuration] = GetAdsAndDuration(
    adList,
    params.desiredDuration,
    params.podSize,
    params.minPodDuration,
    params.maxPodDuration
  );

  //selectedAds = selectedAds.standAloneAds;
  const vast4 = createVast.v4();

  AttachPodAds(vast4, selectedAds.podAds, params);
  AttachStandAloneAds(vast4, selectedAds.standAloneAds, params, selectedAds.podAds.length);

  vastObject = { xml: vast4.toXml(), duration: adsDuration };

  return vastObject;
}

// Add <Ad>-tags for every ad in the sampleAds list
function AttachStandAloneAds(vast4, ads, params, podSize) {
  podSize = podSize ? podSize + 1 : 1;
  for (let i = 0; i < ads.length; i++) {
    vast4
      .attachAd({ id: `AD-ID_00${i + podSize}` })
      .attachInLine()
      .addImpression(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${ads[i].id}&progress=vast`, { id: `IMPRESSION-ID_00${i + podSize}` })
      .addError(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${ads[i].id}&progress=e`)
      .addAdSystem(`Test Adserver`)
      .addAdTitle(`Ad That Test-Adserver Wants Player To See #${i + podSize}`)
      .attachCreatives()
      .attachCreative({
        id: `CREATIVE-ID_00${i + podSize}`,
        adId: `${ads[i].id}`,
        sequence: `${i + podSize}`,
      })
      .addUniversalAdId(encodeURIComponent(`${ads[i].universalId}${i + podSize}`), {
        idRegistry: "test-ad-id.eyevinn",
        idValue: encodeURIComponent(`${ads[i].universalId}${i + podSize}`),
      })
      .addUniversalAdId(
        encodeURIComponent(`${ads[i].universalId}${i + podSize}`),
        {
          idRegistry: 'test-ad-id.eyevinn',
          idValue: encodeURIComponent(`${ads[i].universalId}${i + podSize}`),
        }
      )
      .attachLinear()
      .attachTrackingEvents()
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${ads[i].id}&progress=0`, { event: "start" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${ads[i].id}&progress=25`, { event: "firstQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${ads[i].id}&progress=50`, { event: "midpoint" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${ads[i].id}&progress=75`, { event: "thirdQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${ads[i].id}&progress=100`, { event: "complete" })
      .and()
      .attachVideoClicks()
      .addClickThrough("https://github.com/Eyevinn/test-adserver", { id: "Eyevinn Test AdServer" })
      .and()
      .addDuration(ads[i].duration)
      .attachMediaFiles();

    AddMediaFiles(vast4, [ads[i].url], ads[i].bitrate, ads[i].width, ads[i].height, ads[i].codec)
  }
}

// Attaching Pod adds to the VAST object.
function AttachPodAds(vast4, podAds, params) {
  for (let i = 0; i < podAds.length; i++) {
    mediaNode = vast4
      .attachAd({ id: `POD_AD-ID_00${i + 1}`, sequence: `${i + 1}` })
      .attachInLine()
      .addImpression(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${podAds[i].id}_${i + 1}&progress=vast`, { id: `IMPRESSION-ID_00${i + 1}` })
      .addAdSystem(`Test Adserver`)
      .addAdTitle(`Ad That Test-Adserver Wants Player To See #${i + 1}`)
      .attachCreatives()
      .attachCreative({
        id: `CRETIVE-ID_00${i + 1}`,
        adId: `${podAds[i].id}_${i + 1}`,
        sequence: `${i + 1}`,
      })
      .addUniversalAdId(encodeURIComponent(`${podAds[i].universalId}${i + 1}`), {
        idRegistry: "test-ad-id.eyevinn",
        idValue: encodeURIComponent(`${podAds[i].universalId}${i + 1}`),
      })
      .addUniversalAdId(
        encodeURIComponent(`${podAds[i].universalId}${i + 1}`),
        {
          idRegistry: 'test-ad-id.eyevinn',
          idValue: encodeURIComponent(`${podAds[i].universalId}${i + 1}`),
        }
      )
      .attachLinear()
      .attachTrackingEvents()
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${podAds[i].id}_${i + 1}&progress=0`, { event: "start" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${podAds[i].id}_${i + 1}&progress=25`, { event: "firstQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${podAds[i].id}_${i + 1}&progress=50`, { event: "midpoint" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${podAds[i].id}_${i + 1}&progress=75`, { event: "thirdQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${podAds[i].id}_${i + 1}&progress=100`, { event: "complete" })
      .and()
      .attachVideoClicks()
      .addClickThrough("https://github.com/Eyevinn/test-adserver", { id: "Eyevinn Test AdServer" })
      .and()
      .addDuration(podAds[i].duration)
      .attachMediaFiles();
    
    AddMediaFiles(mediaNode, [podAds[i].url], podAds[i].bitrate, podAds[i].width, podAds[i].height, podAds[i].codec)      
  }
}

function AddMediaFiles(vast4MediaFilesNode, urls, bitrate, width, height, codec) {
  for (let i = 0; i < urls.length; i++) {
    if (urls[i].endsWith(".mp4")) {
      vast4MediaFilesNode
        .attachMediaFile(urls[i], {
          delivery: 'progressive',
          type: 'video/mp4',
          bitrate: bitrate,
          width: width,
          height: height,
          codec: codec,
        })
        .back();
    }
    if (urls[i].endsWith(".m3u8")) {
      vast4MediaFilesNode
        .attachMediaFile(urls[i], {
          delivery: 'streaming',
          type: 'application/x-mpegURL',
          minBitrate: bitrate,
          maxBitrate: bitrate,
          width: width,
          height: height,
          codec: codec,
        })
        .back();
    }
    if (urls[i].endsWith(".mpd")) {
      vast4MediaFilesNode
        .attachMediaFile(urls[i], {
          delivery: 'streaming',
          type: 'application/dash+xml',
          minBitrate: bitrate,
          maxBitrate: bitrate,
          width: width,
          height: height,
          codec: codec,
        })
        .back();
    }
  }
}

// Assuming Access to a List of Ads.
function GetAdsAndDuration(adList, targetDuration, podSize, podMin, podMax) {
  targetDuration = parseInt(targetDuration);
  podSize = podSize ? parseInt(podSize) : null;
  podMin = podMin ? parseInt(podMin) : null;
  podMax = podMax ? parseInt(podMax) : null;
  let remainingDuration = targetDuration;
  let chosenPodAds = [];
  let chosenStandAloneAds = [];

  // Sort Main Ad List in Ascending order.
  adList.sort((a, b) => (timestampToSeconds(a.duration) > timestampToSeconds(b.duration) ? 1 : -1));

  const durations = adList.map((ad) => timestampToSeconds(ad.duration));
  let shortestAdDuration = Math.min(...durations);

  // If any kind of Pod parameter exists
  if (podSize || podMin || podMax) {
    let podCase;

    if (!podSize && !podMax && podMin) {
      podCase = PopulationMethods.GO_BY_MIN;
    } else if (!podSize && podMax) {
      podCase = PopulationMethods.GO_BY_MAX;
    } else {
      podCase = PopulationMethods.GO_BY_SIZE_AND_MAX;
    }
    // If no upper limit to Pod duration, use target duration.
    podMax = podMax ? podMax : targetDuration;
    podTargetDuration = podMax;
    // Populate pod list with adds that follow pod parameters. Append items to 'chosenPodAds'
    PopulatePod(
      podSize,
      podMin,
      podMax,
      adList,
      chosenPodAds,
      podCase,
      podTargetDuration
    );
  }
  // TODO: REMOVE once AD buffet works again...
  else {
    podCase = PopulationMethods.GO_BY_MAX;
    podMax = podMax ? podMax : targetDuration;
    PopulatePod(podSize, podMin, podMax, adList, chosenPodAds, podCase, targetDuration);
  }

  const actualPodDuration = chosenPodAds.map((ad) => timestampToSeconds(ad.duration)).reduce((a, b) => a + b, 0);
  let standAloneTargetDuration = remainingDuration - actualPodDuration;
  remainingDuration = standAloneTargetDuration;

  //Reverse Order
  adList.reverse();
  // Fill-up remaining time with Stand-Alone Ads
  while (adList.length > 0 && remainingDuration >= shortestAdDuration) {
    // Adding to chosenStandAloneAds list based on durations; Add the longest Ad possible.
    for (let i = 0; i < adList.length; i++) {
      const adDuration = timestampToSeconds(adList[i].duration);
      if (adDuration <= remainingDuration) {
        chosenStandAloneAds.push(adList[i]);
        remainingDuration = remainingDuration - adDuration;
      }
    }
  }

  // Calculate the actual total duration (stand-alones and pod).
  const actualDuration = standAloneTargetDuration - remainingDuration + actualPodDuration;
  return [{ standAloneAds: chosenStandAloneAds, podAds: chosenPodAds }, actualDuration.toString()];
}

function indexOfSmallest(a) {
  var lowest = 0;
  for (var i = 1; i < a.length; i++) {
    if (a[i] < a[lowest]) lowest = i;
  }
  return lowest;
}

function PopulatePod(_size, _min, _max, _ads, _chosenAds, _method, _targetDur) {
  // Base Case #1: Regardless of current Pod size, return if Pod duration is greater than _max!
  if (_chosenAds.length > 0) {
    const totalDur = _chosenAds.map((ad) => timestampToSeconds(ad.duration)).reduce((a, b) => a + b, 0);
    if (totalDur === _targetDur) {
      return;
    } else if (totalDur > _targetDur) {
      _chosenAds.pop();
      return;
    }
  }

  // Base Case #2: Pod Size fullfilled.
  if (_size === 0) {
    return;
  }
  const allDurations = _ads.map((ad) => timestampToSeconds(ad.duration));

  let remainingDuration;
  switch (_method) {
    case PopulationMethods.GO_BY_SIZE_AND_MAX:
      let avgDur = Math.floor(_max / _size);

      if (_size === 1) {
        for (let i = allDurations.length - 1; i > 0; i--) {
          if (allDurations[i] <= avgDur) {
            _chosenAds.push(_ads[i]);
            return;
          }
        }
      }

      let diffs = allDurations.map((dur) => Math.abs(avgDur - dur));

      let chosenIdx = indexOfSmallest(diffs);
      let chosenAd = _ads[chosenIdx];
      _chosenAds.push(chosenAd);
      PopulatePod(_size - 1, _min, _max - allDurations[chosenIdx], _ads, _chosenAds, PopulationMethods.GO_BY_SIZE_AND_MAX, _targetDur);
      break;
    case PopulationMethods.GO_BY_MAX:
      remainingDuration = _max;
      let shortestAdDuration = Math.min(...allDurations);
      while (allDurations.length > 0 && remainingDuration >= shortestAdDuration) {
        // Adding to chosenStandAloneAds list based on durations; Add the longest Ad possible.
        for (let i = 0; i < allDurations.length; i++) {
          const adDuration = allDurations[i];
          if (adDuration <= remainingDuration) {
            _chosenAds.push(_ads[i]);
            remainingDuration = remainingDuration - adDuration;
          }
        }
      }
      break;
    case PopulationMethods.GO_BY_MIN:
      remainingDuration = _max;
      let total = 0;
      while (allDurations.length > 0 && total < _min) {
        // Adding to chosenStandAloneAds list based on durations; Add the longest Ad possible.
        for (let i = 0; i < allDurations.length; i++) {
          const adDuration = allDurations[i];
          if (adDuration <= remainingDuration) {
            _chosenAds.push(_ads[i]);
            total += adDuration;
            remainingDuration = remainingDuration - adDuration;
          }
        }
      }
      break;
    default:
      return;
  }
}

module.exports = { VastBuilder };
