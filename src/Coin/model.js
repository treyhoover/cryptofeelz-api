const axios = require("axios");
const { STRING } = require("sequelize");
const sequelize = require("../db");
const cache = require("../cache");

const Coin = sequelize.define('coin', {
  symbol: {
    type: STRING,
    primaryKey: true,
  },
});

Coin.getPrice = async function ({ symbol, date }) {
  const ts = Date.parse(date.toDateString()) / 1000;
  const priceKey = `${symbol}_${ts}`;

  // check redis first (historical requests only)
  const cachedPrice = await cache.get(priceKey);

  if (cachedPrice) {
    console.log(`Fetched ${priceKey} from cache`, cachedPrice);

    return Number(cachedPrice);
  }

  return axios.get('https://min-api.cryptocompare.com/data/pricehistorical', {
    params: {
      ts,
      fsym: symbol,
      tsyms: "USD",
      e: "Coinbase",
    },
  }).then(res => {
    const price = res.data[symbol.toUpperCase()]["USD"];

    if (!cachedPrice) {
      cache.set(priceKey, price);
    }

    return price;
  });
};

Coin.prototype.getPrice = async function (ts) {
  const { symbol } = this;

  return await Coin.getPrice({ ts, symbol });
};

Coin.sync();

module.exports = Coin;
