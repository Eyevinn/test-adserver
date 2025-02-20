
const RESPONSE_FORMATS = {
    VMAP: "vmap1",
    VAST: "vast4",
    PAUSE_AD: "pause_ad"
  }
  
  const EMPTY_VAST_MSG = `.--------------- WARNING ---------------.
  |     Empty VAST-XML Sent To Client     |
  '---------------------------------------'\n`;

  const EMPTY_VAST_STR = `<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<VAST version=\"4.0\"/>`;

  const EMPTY_VMAP_MSG = `.--------------- WARNING ---------------.
  |     Empty VMAP-XML Sent To Client     |
  '---------------------------------------'\n`;
  
  const EMPTY_VMAP_STR = `<vmap:VMAP xmlns:vmap="http://www.iab.net/vmap-1.0" version="1.0"/>`;

  module.exports = {
      RESPONSE_FORMATS,
      EMPTY_VAST_MSG,
      EMPTY_VAST_STR,
      EMPTY_VMAP_MSG,
      EMPTY_VMAP_STR
  }