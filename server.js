const path = require('path');
const download = require('image-downloader');
const _ = require('lodash');
const express = require('express');
const axios = require('axios');
const { percentToEmotion } = require('./utils/emotions');
const { createGif } = require('./convert');
const giphy = require("./giphy");
const app = express();

const daysLabelMap = {
  "1": "24 hours",
  "7": "week",
  "30": "month",
  "365": "year",
};

const fetchCoin = (options) => axios.get('https://min-api.cryptocompare.com/data/pricehistorical', options);

app.get('/gif', async (req, res) => {
  const { symbol = "BTC", days = "1" } = req.query;
  const date = new Date();
  date.setDate(date.getDate() - days);
  const time = Date.parse(date.toDateString()) / 1000;

  const fetchHistorical = fetchCoin({
    params: {
      fsym: symbol,
      tsyms: "USD",
      ts: time,
    }
  });

  const fetchCurrent = fetchCoin({
    params: {
      fsym: symbol,
      tsyms: "USD",
    }
  });

  const [prev, current] = await Promise.all([fetchHistorical, fetchCurrent]);
  const prevPrice = prev.data[symbol.toUpperCase()]["USD"];
  const currentPrice = current.data[symbol.toUpperCase()]["USD"];
  const percentChange = (currentPrice / prevPrice - 1) * 100;
  const q = percentToEmotion(percentChange);

  const gifResponse = await giphy.search('gifs', { q });
  const gifs = gifResponse.data.map(gif => gif.images.downsized_medium.gif_url);
  const gif = _.sample(gifs);

  const downloaded = await download.image({
    url: gif,
    dest: path.join(__dirname, "input.gif")
  });

  const upOrDown = percentChange >= 0 ? "up" : "down";
  const color = upOrDown === "up" ? "green" : "red";
  const percentRounded = Math.abs(Math.floor(percentChange)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const pastTime = daysLabelMap[days];

  await createGif({
    text: `When ${symbol} is ${upOrDown} <span foreground="${color}" font_weight="bold">${percentRounded}%</span> in the past ${pastTime}...`,
    src: "input.gif",
    outputFile: "output.gif",
    tmpTextOverlay: "overlay.png",
    fontSize: 72,
    strokeWidth: 2,
  }).catch(console.error);

  // res.json({ prevPrice, currentPrice, percentChange, gif });

  res.sendFile(path.join(__dirname, "output.gif"))
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
});
