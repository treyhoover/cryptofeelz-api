const axios = require("axios");
const { STRING } = require("sequelize");
const sequelize = require("../db");
const cache = require("../cache");

const PRICE_CACHE = 5 * 60 * 60; // 5 minutes

const Coin = sequelize.define('coin', {
  symbol: {
    type: STRING,
    primaryKey: true,
  },
});

Coin.getPriceChange = async function ({ symbol, duration }) {
  const SYM = symbol.toUpperCase();

  const cacheKey = `${symbol}_${duration}`;

  const percentage = await cache.get(cacheKey);

  if (percentage) {
    console.log(`Fetched ${cacheKey} from cache`, percentage);

    return [Number(percentage), null];
  } else {
    try {
      const res = await axios.get(`https://apiv2.bitcoinaverage.com/indices/global/ticker/${SYM}USD`);

      const percentage = parseInt(res.data.changes.percent[duration], 10);

      cache.set(cacheKey, percentage, 'EX', PRICE_CACHE);

      return [percentage, null];
    } catch (error) {
      return [null, error];
    }
  }
};

Coin.sync();

module.exports = Coin;
