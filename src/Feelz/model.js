const { STRING, INTEGER } = require("sequelize");
const sequelize = require("../db");

const _ = require('lodash');
const GphApiClient = require("giphy-js-sdk-core");
const { GIPHY_API_KEY } = require("../../config/env");
const giphy = GphApiClient(GIPHY_API_KEY);

const cache = require("../cache");

const GIF_EXPIRATION = 60 * 60; // 60 minutes

const fetchGifs = async (q) => {
  const key = `GIFS_${q}`.toUpperCase();

  const cached = await cache.get(key);

  if (cached) {
    console.log("using cached result", key);

    return JSON.parse(cached);
  } else {
    const gifs = await giphy.search('gifs', { q }).then(res => res.data);

    console.log("caching gif results", key);

    cache.set(key, JSON.stringify(gifs), 'EX', GIF_EXPIRATION);

    return gifs;
  }
};

const fetchGif = async (emotion) => {
  const gifs = await fetchGifs(emotion);

  return _.sample(gifs);
};

const Feelz = sequelize.define('feelz', {
  symbol: STRING,
  days: INTEGER,
  percent: INTEGER,
  emotion: STRING,
});

Feelz.sync();

Feelz.fetchGif = fetchGif;

module.exports = Feelz;
