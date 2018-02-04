const { STRING, INTEGER } = require("sequelize");
const sequelize = require("../db");

const _ = require('lodash');
const GphApiClient = require("giphy-js-sdk-core");
const { GIPHY_API_KEY } = require("../../config/env");
const giphy = GphApiClient(GIPHY_API_KEY);

const fetchGifs = async (q) => {

  return giphy.search('gifs', { q }).then(res => res.data);
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
