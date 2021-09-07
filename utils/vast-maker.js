const createVast = require("vast-builder");
const timestampToSeconds = require("timestamp-to-seconds");
const { parse } = require("fast-xml-parser");


const AdList = [
  {
    universalId: "AAA/BBBB123/",
    id: "streamingtech_ad",
    url: "https://testcontent.eyevinn.technology/ads/probably-the-best-10s.mp4",
    duration: "00:00:10",
  },
  {
    universalId: "AAA/CCCC123/",
    id: "25percent_ad",
    url: "https://static.videezy.com/system/resources/previews/000/019/185/original/25percent-blue.mp4",
    duration: "00:00:05",
  },
  {
    universalId: "AAA/DDDD123/",
    id: "25percentDrawn_ad",
    url: "https://static.videezy.com/system/resources/previews/000/017/907/original/25percent.mp4",
    duration: "00:00:20",
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

  const [selectedAds, adsDuration] = GetAdsAndDuration(AdList, params.desiredDuration, params.podSize, params.minPodDuration, params.maxPodDuration);

  const vast4 = createVast.v4();
  // Add <Ad>-tags for every ad in the sampleAds list
  for (let i = 0; i < selectedAds.length; i++) {
    vast4
      .attachAd({ id: `AD-ID_00${i + 1}`, sequence: `${i + 1}`})
      .attachInLine()
      .addImpression("about:blank", { id: `IMPRESSION-ID_00${i + 1}` })
      .addAdSystem(`Test Adserver`)
      .addAdTitle(`Ad That Test-Adserver Wants Player To See #${i + 1}`)
      .attachCreatives()
      .attachCreative({
        id: `CRETIVE-ID_00${i + 1}`,
        adId: `${selectedAds[i].id}_${i+1}`,
        sequence: `${i + 1}`,
      })
      .addUniversalAdId(`${selectedAds[i].universalId}${i + 1}`, {
        idRegistry: "test-ad-id.eyevinn",
        idValue: `${selectedAds[i].universalId}${i + 1}`
      })
      .attachLinear()
      .attachTrackingEvents()
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}_${i+1}&progress=0`,
        { event: "start" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}_${i+1}&progress=25`,
        { event: "firstQuartile" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}_${i+1}&progress=50`,
        { event: "midpoint" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}_${i+1}&progress=75`,
        { event: "thirdQuartile" }
      )
      .addTracking(
        `http://${params.adserverHostname}/api/v1/sessions/${params.sessionId}/tracking?adId=${selectedAds[i].id}_${i+1}&progress=100`,
        { event: "complete" }
      )
      .and()
      .addDuration(selectedAds[i].duration)
      .attachMediaFiles()
      .attachMediaFile(selectedAds[i].url, {
        delivery: "progressive",
        type: "video/mp4",
        bitrate: "17700",
        width: "1920",
        height: "1080",
        codec: "H.264" 
      })
      .back();
  }
  vastObject = { xml: vast4.toXml(), duration: adsDuration };

  return vastObject;
}

// Assuming Access to a List of Ads.
function GetAdsAndDuration(adList, targetDuration, podSize, podMin, podMax) {
  targetDuration = parseInt(targetDuration);
  podSize = podSize?parseInt(podSize) : null; 
  podMin = podMin?parseInt(podMin) : null;
  podMax = podMax?parseInt(podMax) : null;
  let remainingDuration = targetDuration;
  let chosenPodAds = [];
  let chosenStandAloneAds = [];
  
  // Sort Main Ad List in Descending order.
  adList.sort((a, b) =>
    timestampToSeconds(a.duration) > timestampToSeconds(b.duration) ? -1 : 1
  );

  const durations = adList.map(ad => timestampToSeconds(ad.duration));
  let shortestAdDuration = Math.min(...durations);

  // If any kind of Pod parameter exists
  if (podSize || podMin || podMax) {
  	let podCase;
    const populationMethods = Object.freeze({
      GO_BY_MIN: 1,
      GO_BY_MAX: 2,
      GO_BY_SIZE_AND_MAX: 3
    });

    if(!podSize && !podMax && podMin) { 
      podCase = populationMethods.GO_BY_MIN;
    }
    else if (!podSize && podMax) {
      podCase = populationMethods.GO_BY_MAX;
    }
    else {
      podCase = populationMethods.GO_BY_SIZE_AND_MAX;
    }
    // If no upper limit to Pod duration, use target duration.
    podMax = podMax?podMax:targetDuration;
    // Populate pod list with adds that follow pod parameters. Append items to 'chosenPodAds'
    PopulatePod(podSize, podMin, podMax, adList, chosenPodAds, podCase);
  }

  const actualPodDuration = chosenPodAds.map(ad => timestampToSeconds(ad.duration)).reduce((a, b) => a + b, 0);
  remainingDuration = remainingDuration - actualPodDuration;

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
  const actualDuration = (targetDuration - remainingDuration) + actualPodDuration;
  return [{standAloneAds: chosenStandAloneAds, podAds: chosenPodAds}, actualDuration.toString()];
}

function indexOfSmallest(a) {
 var lowest = 0;
 a.reverse();
 for (var i = 1; i < a.length; i++) {
  if (a[i] < a[lowest]) lowest = i;
 }
 return lowest;
}

function PopulatePod(_size, _min, _max, _ads, _chosenAds, _method) {
  // Base Case
	if (_size === 0) {
		return;
	}
  const allDurations = _ads.map(ad => timestampToSeconds(ad.duration));
  
  let remainingDuration;
  switch (_method) {
    case populationMethods.GO_BY_SIZE_AND_MAX:
      let avgDur = Math.floor(_max/_size);
      let diffs = allDurations.map( dur => Math.abs(avgDur - dur));
      let chosenIdx = indexOfSmallest(diffs);
      let chosenAd = _ads[chosenIdx];
      _chosenAds.push(chosenAd);
  	  PopulatePod(_size - 1, _min, (_max - allDurations[chosenIdx]), _ads, _chosenAds, populationMethods.GO_BY_SIZE_AND_MAX);
      break;
    case populationMethods.GO_BY_MAX:
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
    case populationMethods.GO_BY_MIN:
      remainingDuration = _max;
      let total = 0;
      while (allDurations.length > 0 &&  total < _min ) {
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
