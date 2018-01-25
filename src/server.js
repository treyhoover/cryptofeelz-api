const { promisify } = require('util');
const path = require('path');
const express = require('express');
const axios = require('axios');
const { percentToEmotion } = require('./utils/emotions');
const { createGif } = require('./convert');
const { fetchGifForEmotion } = require("./giphy");
const redis = require("redis");
const app = express();

const { REDIS_HOST = "127.0.0.1", REDIS_PORT = 6379 } = process.env;
const PRICE_EXPIRATION = 15 * 60; // 15 minutes

const client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const getAsync = promisify(client.get).bind(client);

const resolveTmp = (p) => path.resolve("/", "tmp", p);

const daysLabelMap = {
  "1": "24 hours",
  "7": "week",
  "30": "month",
  "365": "year",
};

const fetchCoin = async ({ ts, symbol = "BTC" }) => {
  const currentPriceKey = `${symbol}_PRICE_CURRENT`;
  const isCurrentPriceReq = !ts;

  // check redis first (historical requests only)
  if (isCurrentPriceReq) {
    const cachedPrice = await getAsync(currentPriceKey);

    if (cachedPrice) return Promise.resolve(cachedPrice);
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
      client.set(currentPriceKey, price, 'EX', PRICE_EXPIRATION);
    }

    return price;
  });
};

app.get('/gif', async (req, res) => {
  try {
    const { symbol = "BTC", days = "1" } = req.query;
    const date = new Date();
    date.setDate(date.getDate() - days);
    const ts = Date.parse(date.toDateString()) / 1000;

    const fetchHistorical = fetchCoin({ symbol, ts });
    const fetchCurrent = fetchCoin({ symbol });

    const [prevPrice, currentPrice] = await Promise.all([fetchHistorical, fetchCurrent]);
    const percentChange = (currentPrice / prevPrice - 1) * 100;
    const q = percentToEmotion(percentChange);

    const gifPath = await fetchGifForEmotion(q);

    const upOrDown = percentChange >= 0 ? "up" : "down";
    const color = upOrDown === "up" ? "green" : "red";
    const percentRounded = Math.abs(Math.floor(percentChange)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const pastTime = daysLabelMap[days];

    await createGif({
      text: `When ${symbol} is ${upOrDown} <span foreground="${color}" font_weight="bold">${percentRounded}%</span> in the past ${pastTime}...`,
      src: gifPath,
      outputFile: resolveTmp("output.gif"),
      tmpTextOverlay: resolveTmp("overlay.png"),
      fontSize: 72,
      strokeWidth: 2,
    });

    res.sendFile(resolveTmp("output.gif"))
  } catch (e) {
    console.error(e);
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
});
