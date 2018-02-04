const axios = require("axios");
const { STRING } = require("sequelize");
const sequelize = require("../db");
const cache = require("../cache");

const PRICE_EXPIRATION = 15 * 60; // 15 minutes

const fetchCoin = async ({ ts, symbol = "BTC" }) => {
  const currentPriceKey = `${symbol}_PRICE_CURRENT`;
  const isCurrentPriceReq = !ts;

  // check redis first (historical requests only)
  if (isCurrentPriceReq) {
    const cachedPrice = await cache.get(currentPriceKey);

    if (cachedPrice) {
      console.log(`Fetched ${symbol} price from cache`, cachedPrice);

      return Promise.resolve(Number(cachedPrice));
    }
  }

  return axios.get('https://min-api.cryptocompare.com/data/pricehistorical', {
    params: {
      ts,
      fsym: symbol,
      tsyms: "USD",
    },
  }).then(res => {
    const price = res.data[symbol.toUpperCase()]["USD"];

    if (isCurrentPriceReq) {
      cache.set(currentPriceKey, price, 'EX', PRICE_EXPIRATION);
    }

    return price;
  });
};

const Coin = sequelize.define('coin', {
  symbol: {
    type: STRING,
    primaryKey: true,
  },
});

Coin.prototype.getPrice =  async function(ts) {
  const { symbol } = this;

  return await fetchCoin({ ts, symbol });
};

Coin.sync();

module.exports = Coin;
