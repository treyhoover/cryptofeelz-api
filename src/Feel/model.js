const { STRING, INTEGER } = require("sequelize");
const pluralize = require("pluralize");
const format = require('../utils/format');
const shortid = require('shortid');
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
  id: {
    type: STRING,
    primaryKey: true,
    defaultValue: shortid.generate,
  },
  symbol: STRING,
  days: INTEGER,
  percent: INTEGER,
  emotion: STRING,
  gif: STRING,
  caption: STRING,
  width: INTEGER,
  height: INTEGER,
  numFrames: INTEGER,
}, {
  tableName: 'feelz',
  getterMethods: {
    permalink() {
      const { id, caption } = this;
      const slug = _.kebabCase(caption.replace(/[^A-z0-9_-]/gi, ' '));

      return `http://cryptofeelz.com/feelz/${id}/${slug}`;
    },

    aspect() {
      const { width, height } = this;

      return width / height;
    },

    captionMarkup() {
      const { percent, days, symbol } = this;

      const upOrDown = percent >= 0 ? "up" : "down";
      const amt = format.asPercent(Math.abs(percent));
      const time = days === 1 ? "day" : `${days} ${pluralize("days", days)}`;
      const color = upOrDown === "up" ? "green" : "red";

      return `When ${symbol} is ${upOrDown} <span foreground="${color}">${amt}</span> in the past ${time}`;
    }
  }
});

Feelz.sync();

Feelz.fetchGif = fetchGif;

module.exports = Feelz;
