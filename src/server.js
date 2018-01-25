const { promisify } = require('util');
const path = require('path');
const download = require('image-downloader');
const _ = require('lodash');
const express = require('express');
const axios = require('axios');
const { percentToEmotion } = require('./utils/emotions');
const { createGif } = require('./convert');
const { fetchGifForEmotion } = require("./giphy");
const client = require("redis").createClient('6379', 'redis');
const getAsync = promisify(client.get).bind(client);
const app = express();

const PRICE_EXPIRATION = 15 * 60; // 15 minutes

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

    const gifResponse = await fetchGifForEmotion(q);
    const gifs = gifResponse.data.map(gif => gif.images.downsized_medium.gif_url);
    const gif = _.sample(gifs);

    await download.image({
      url: gif,
      dest: path.join(resolveTmp("input.gif")),
    });

    const upOrDown = percentChange >= 0 ? "up" : "down";
    const color = upOrDown === "up" ? "green" : "red";
    const percentRounded = Math.abs(Math.floor(percentChange)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const pastTime = daysLabelMap[days];

    await createGif({
      text: `When ${symbol} is ${upOrDown} <span foreground="${color}" font_weight="bold">${percentRounded}%</span> in the past ${pastTime}...`,
      src: resolveTmp("input.gif"),
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
