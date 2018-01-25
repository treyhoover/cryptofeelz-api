const GphApiClient = require("giphy-js-sdk-core");
const API_KEY = "CHOO0Uw2ELi7jXsVIUednM1DpBGHByHh";
const giphy = GphApiClient(API_KEY);

const fetchGifForEmotion = async (emotion) => {
  // console.log("fetching gif for", emotion);

  const response = await giphy.search('gifs', { q: emotion });

  return response;
};

module.exports = {
  default: giphy,
  fetchGifForEmotion,
};
