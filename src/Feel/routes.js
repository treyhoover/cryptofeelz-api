const _ = require("lodash");
const path = require('path');
const request = require('request');
const moment = require("moment");
const pluralize = require("pluralize");
const gm = require('gm');
const Feel = require("./model");
const Coin = require("../Coin/model");
const { percentToEmotion } = require('../utils/emotions');
const format = require('../utils/format');
const { createRounder } = require("../utils/date");

const roundDate = createRounder(5); // round dates to 5 minutes

const getDateRange = (days = 0) => {
  const endDate = roundDate();
  const startDate = moment(endDate).subtract(days, "days").toDate();

  return { startDate, endDate };
};

module.exports = (app) => {
  // CREATE (if not exists)
  app.get('/feelz', async (req, res) => {
    try {
      const { symbol = "BTC", days: _days = "1" } = req.query;
      const days = Number(_days);

      const { startDate, endDate } = getDateRange(days);

      const fetchHistorical = Coin.getPrice({ symbol, date: startDate });
      const fetchCurrent = Coin.getPrice({ symbol, date: endDate });

      const [prevPrice, currentPrice] = await Promise.all([fetchHistorical, fetchCurrent]);

      let percent = Math.round((currentPrice / prevPrice - 1) * 100);

      if (!Number.isInteger(percent)) {
        percent = 0;
      }

      const emotion = percentToEmotion(percent);
      const gif = await Feel.fetchGif(emotion);

      const upOrDown = percent >= 0 ? "up" : "down";
      const amt = format.asPercent(Math.abs(percent));
      const time = days === 1 ? "day" : `${days} ${pluralize("days", days)}`;
      const caption = `When ${symbol} is ${upOrDown} ${amt} in the past ${time}`;

      const [feel] = await Feel.findOrCreate({
        where: {
          symbol,
          days,
          percent,
          emotion,
          gif: gif.id,
          caption,
        }
      });

      res.json(feel);
    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  });

  // SHOW (permalinks)
  app.get('/feelz/:id/:slug?\.:ext?', async (req, res) => {
    const { id, slug, ext } = req.params;

    const feel = await Feel.findById(id);

    if (ext !== "gif") return res.json(feel);

    const url = `https://media1.giphy.com/media/${feel.gif}/200.gif`;

    res.set('Content-Type', 'image/gif');

    const fontSize = 24;
    const wordsPerLine = 20;

    const words = feel.caption.split(" ");
    let caption = "";
    let count = 0;
    let lineCount = 0;

    for (let word of words) {
      count += word.length;

      if (lineCount + word.length >= wordsPerLine) {
        caption += "\n";
        lineCount = 0;
      } else {
        lineCount += word.length;
      }

      caption += word + " ";
    }

    caption = caption.trim();

    gm(request(url))
      .font(path.resolve(process.cwd(), 'src', 'fonts', 'impact.ttf'), fontSize)
      .stroke("#000000", 1)
      .fill("#ffffff")
      .drawText(0, fontSize, caption, 'North')
      .stream()
      .pipe(res);
  });
};
