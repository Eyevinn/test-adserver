const { VastBuilder } = require("./vast-maker");
const { EMPTY_VMAP_STR } = require("./constants");
const { SecondsToTimeFormat } = require("../utils/utilities");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const he = require("he");

class VMAP {
  constructor() {
    this.adBreakXmls = "";
    this.adBreakCount = 0;
  }

  attachAdBreak(break_id, break_type = "linear", time_offset, vast_xml, opt) {
    this.adBreakCount++;
    this.adBreakXmls += `<vmap:AdBreak breakId="${break_id}" breakType="${break_type}" timeOffset="${time_offset}">
      <vmap:AdSource allowMultipleAds="true" followRedirects="true" id="${this.adBreakCount}">
        <vmap:VASTAdData>
          ${vast_xml}
        </vmap:VASTAdData>
      </vmap:AdSource>
      <vmap:TrackingEvents>
        <vmap:Tracking event="breakStart">
          <![CDATA[ ${`http://${opt.adserverHostname}/api/v1/sessions/${opt.sessionId}/tracking?adId=${break_id}&progress=vmap`} ]]>
        </vmap:Tracking>
      </vmap:TrackingEvents>
    </vmap:AdBreak>`;
  }

  getXml() {
    let vmapXml = `<vmap:VMAP xmlns:vmap="http://www.iab.net/vmap-1.0" version="1.0">`;
    vmapXml += this.adBreakXmls;
    vmapXml += `</vmap:VMAP>`;
    const options = {
      attributeNamePrefix: "@_",
      attrNodeName: false, //default is false
      textNodeName: "#text",
      ignoreAttributes: false,
      cdataTagName: "Value", //default is false
      cdataPositionChar: "\\c",
      format: true,
      indentBy: "  ",
      supressEmptyNode: false,
      tagValueProcessor: (a) => he.encode(a),
      attrValueProcessor: (a) => he.encode(a, { isAttributeValue: true }),
    };
    // Parse it pretty...
    const parser = new XMLParser(options);
    const jsonVmap = parser.parse(vmapXml);
    const builder = new XMLBuilder(options);
    const prettyVmapXml = builder.build(jsonVmap);
    return prettyVmapXml;
  }
}

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
function VmapBuilder(params) {
  if (!params.breakpoints && !params.preroll && !params.postroll) {
    return {
      xml: EMPTY_VMAP_STR,
      durations: [],
    };
  }
  const vmap = new VMAP();
  const GVC = params.generalVastConfigs;
  const breakDurations = [];

  const defaultConfigs = {
    sessionId: GVC.sessionId,
    desiredDuration: "15",
    skipoffset: GVC.skipoffset,
    adserverHostname: GVC.adserverHostname,
    maxPodDuration: null,
    minPodDuration: null,
    podSize: null,
    adCollection: GVC.adCollection,
    version: GVC.version,
  };

  const breakpoints = params.breakpoints ? params.breakpoints.split(",").filter((item) => !isNaN(Number(item))) : [];
  if (params.preroll) {
    const preVast = VastBuilder(defaultConfigs);
    vmap.attachAdBreak("preroll.ad", "linear", "start", preVast.xml, {
      sessionId: GVC.sessionId,
      adserverHostname: GVC.adserverHostname,
    });
    breakDurations.push(preVast.duration);
  }

  breakpoints.forEach((bp, idx) => {
    this.adBreakCount++;
    const time = SecondsToTimeFormat(Number(bp));
    const midVast = VastBuilder(GVC);
    vmap.attachAdBreak(`midroll.ad-${idx + 1}`, "linear", time, midVast.xml, {
      sessionId: GVC.sessionId,
      adserverHostname: GVC.adserverHostname,
    });
    breakDurations.push(midVast.duration);
  });

  if (params.postroll) {
    const postVast = VastBuilder(defaultConfigs);
    vmap.attachAdBreak("postroll.ad", "linear", "end", postVast.xml, {
      sessionId: GVC.sessionId,
      adserverHostname: GVC.adserverHostname,
    });
    breakDurations.push(postVast.duration);
  }

  const vmapObject = {
    xml: vmap.getXml(),
    durations: breakDurations,
  };

  return vmapObject;
}

module.exports = { VmapBuilder };
