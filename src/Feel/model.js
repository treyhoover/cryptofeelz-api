const { STRING, INTEGER } = require("sequelize");
const _ = require('lodash');
const GphApiClient = require("giphy-js-sdk-core");
const sequelize = require("../db");
const { GIPHY_API_KEY } = require("../../config/env");
const cache = require("../cache");

const GIF_EXPIRATION = 60 * 60; // 60 minutes

const giphy = GphApiClient(GIPHY_API_KEY);

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
  gif: STRING,
  caption: STRING,
}, {
  tableName: 'feelz',
  getterMethods: {
    permalink() {
      const { id, caption } = this;
      const slug = _.kebabCase(caption.replace(/[^A-z0-9_-]/gi, ' '));

      return `http://cryptofeelz.com/feelz/${id}/${slug}`;
    }
  }
});

Feelz.sync();

Feelz.fetchGif = fetchGif;

module.exports = Feelz;
