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
    universalId: "AAA001",
    id: "alvedon-10s",
    url: [
      "https://testcontent.eyevinn.technology/ads/alvedon-10s.mp4"
    ],
    duration: "00:00:10",
    bitrate: "1300",
    width: "718",
    height: "404",
    codec: "H.264",
  },
  {
    universalId: "AAA002",
    id: "apotea-15s",
    url: [
      "https://testcontent.eyevinn.technology/ads/apotea-15s.mp4"
    ],
    duration: "00:00:15",
    bitrate: "2000",
    width: "1280",
    height: "720",
    codec: "H.264",
  },
  {
    universalId: "AAA003",
    id: "bromwel-15s",
    url: ["https://testcontent.eyevinn.technology/ads/bromwel-15s.mp4"],
    duration: "00:00:15",
    bitrate: "1000",
    width: "718",
    height: "404",
    codec: "H.264",
  },
  {
    universalId: "AAA004",
    id: "stswe-ad-30sec",
    url: [
      "https://testcontent.eyevinn.technology/ads/stswe-ad-30sec.mp4"
    ],
    duration: "00:00:30",
    bitrate: "10000",
    width: "1920",
    height: "1080",
    codec: "H.264",
  },
  {
    universalId: "AAA005",
    id: "willys-20s",
    url: [
      "https://testcontent.eyevinn.technology/ads/willys-20s.mp4"
    ],
    duration: "00:00:20",
    bitrate: "600",
    width: "799",
    height: "394",
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
 * version: "2", "3", "4" (default)
 * 
 */
function VastBuilder(params) {
  let vastObject = {};
  let adList = [];
  let vast = null;
  // Use Default AdList OR get new List from TENANT_CACHE.
  let tenantId;
  if (params.adserverHostname) {
    tenantId = params.adserverHostname;
  }
  if (params.adCollection) {
    tenantId = params.adCollection;
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
  //selectedAds = selectedAds.standAloneAds;
  AttachPodAds(vast, selectedAds.podAds, params);
  AttachStandAloneAds(vast, selectedAds.standAloneAds, params, selectedAds.podAds.length);

  vastObject = { xml: vast.toXml(), duration: adsDuration };

  return vastObject;
}

// Add <Ad>-tags for every ad in the sampleAds list
function AttachStandAloneAds(vast, ads, params, podSize) {
  podSize = podSize ? podSize + 1 : 1;
  const adId = vast.attrs.version === "4.0" ? "adId" : "adID";
  for (let i = 0; i < ads.length; i++) {
    let mediaNode = vast
      .attachAd({ id: `AD-ID_00${i + podSize}` })
      .attachInLine()
      .addImpression(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${ads[i].id}&progress=vast`, { id: `IMPRESSION-ID_00${i + podSize}` })
      .addError(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${ads[i].id}&progress=e`)
      .addAdSystem(`Test Adserver`)
      .addAdTitle(`Ad That Test-Adserver Wants Player To See #${i + podSize}`)
      .attachCreatives()
      .attachCreative({
        id: `CREATIVE-ID_00${i + podSize}`,
        [adId]: `${ads[i].id}`,
        sequence: `${i + podSize}`,
      });
    if (vast.attrs.version === "4.0") {
      mediaNode = mediaNode
      .addUniversalAdId(
        encodeURIComponent(`${ads[i].universalId}${i + podSize}`), {
          idRegistry: "test-ad-id.eyevinn",
          idValue: encodeURIComponent(`${ads[i].universalId}${i + podSize}`),
        }
      );
    }
    mediaNode = mediaNode
      .attachLinear()
      .attachTrackingEvents()
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${ads[i].id}&progress=0`, { event: "start" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${ads[i].id}&progress=25`, { event: "firstQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${ads[i].id}&progress=50`, { event: "midpoint" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${ads[i].id}&progress=75`, { event: "thirdQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${ads[i].id}&progress=100`, { event: "complete" })
      .and()
      .attachVideoClicks()
      .addClickThrough("https://github.com/Eyevinn/test-adserver", { id: "Eyevinn Test AdServer" })
      .and()
      .addDuration(ads[i].duration)
      .attachMediaFiles();

    AddMediaFiles(mediaNode, ads[i].url, ads[i].bitrate, ads[i].width, ads[i].height, ads[i].codec)
  }
}

// Attaching Pod adds to the VAST object.
function AttachPodAds(vast, podAds, params) {
  // ad-id is adID in VAST 2.0 and 3.0, adId in VAST 4.0
  const adId = vast.attrs.version === "4.0" ? "adId" : "adID";
  for (let i = 0; i < podAds.length; i++) {
    let attachAdParams = { id: `POD_AD-ID_00${i + 1}` };
    // VAST 2.0 does not support sequence attribute.
    if (vast.attrs.version !== "2.0") {
      attachAdParams.sequence = `${i + 1}`;
    }
    let mediaNode = vast
      .attachAd(attachAdParams)
      .attachInLine()
      .addImpression(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${podAds[i].id}_${i + 1}&progress=vast`, { id: `IMPRESSION-ID_00${i + 1}` })
      .addAdSystem(`Test Adserver`)
      .addAdTitle(`Ad That Test-Adserver Wants Player To See #${i + 1}`)
      .attachCreatives()
      .attachCreative({
        id: `CRETIVE-ID_00${i + 1}`,
        [adId]: `${podAds[i].id}`,
        sequence: `${i + 1}`,
      });
    if (vast.attrs.version === "4.0") {
      mediaNode = mediaNode
      .addUniversalAdId(
        encodeURIComponent(`${podAds[i].universalId}${i + 1}`), {
          idRegistry: "test-ad-id.eyevinn",
          idValue: encodeURIComponent(`${podAds[i].universalId}${i + 1}`),
        }
      );
    }
    mediaNode = mediaNode
      .attachLinear({skipoffset: getSkipOffsetValue(params.skipoffset)}) // skipoffset does not seem to exist on VAST 2.0 and lower, you could also have skipoffset in percentage
      .attachTrackingEvents()
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${podAds[i].id}_${i + 1}&progress=0`, { event: "start" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${podAds[i].id}_${i + 1}&progress=25`, { event: "firstQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${podAds[i].id}_${i + 1}&progress=50`, { event: "midpoint" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${podAds[i].id}_${i + 1}&progress=75`, { event: "thirdQuartile" })
      .addTracking(`http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?${adId}=${podAds[i].id}_${i + 1}&progress=100`, { event: "complete" })
      .and()
      .attachVideoClicks()
      .addClickThrough("https://github.com/Eyevinn/test-adserver", { id: "Eyevinn Test AdServer" })
      .and()
      .addDuration(podAds[i].duration)
      .attachMediaFiles();

    AddMediaFiles(mediaNode, podAds[i].url, podAds[i].bitrate, podAds[i].width, podAds[i].height, podAds[i].codec, vast.attrs.version)
  }
}

function AddMediaFiles(vastMediaFilesNode, urls, bitrate, width, height, codec, version) {
  const mediaFile = {
    width: width,
    height: height,
  }
  // VAST 2.0 does not support codec attribute.
  if (version !== "2.0") {
    mediaFile.codec = codec;
  }
  for (let i = 0; i < urls.length; i++) {
    if (urls[i].endsWith(".mp4")) {
      vastMediaFilesNode
        .attachMediaFile(urls[i], 
          Object.assign(mediaFile, {
            delivery: 'progressive',
            type: 'video/mp4',
            bitrate: bitrate,
          }))
        .back();
    }
    if (urls[i].endsWith(".m3u8")) {
      vastMediaFilesNode
        .attachMediaFile(urls[i], 
          Object.assign(mediaFile, {
            delivery: 'streaming',
            type: 'application/x-mpegURL',
            minBitrate: bitrate,
            maxBitrate: bitrate,
          }))
        .back();
    }
    if (urls[i].endsWith(".mpd")) {
      vastMediaFilesNode
        .attachMediaFile(urls[i], 
          Object.assign(mediaFile, {
            delivery: 'streaming',
            type: 'application/dash+xml',
            minBitrate: bitrate,
            maxBitrate: bitrate,
          }))
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

function getSkipOffsetValue(skipoffset) {
  // "x%"
  const percentageFormatRegex = /^(100|[1-9]?[0-9])%$/;
  // "seconds"
  const integerSecondsRegex = /^\d+$/;

  if (percentageFormatRegex.test(skipoffset)){
    return skipoffset;
  } 
  // convert seconds to "hh:mm:ss" format
  if (integerSecondsRegex.test(skipoffset)) {
    const totalSeconds = parseInt(skipoffset, 10);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }
  return null;
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
