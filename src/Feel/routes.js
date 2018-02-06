const moment = require("moment");
const pluralize = require("pluralize");
const Feel = require("./model");
const Coin = require("../Coin/model");
const { percentToEmotion } = require('../utils/emotions');
const format = require('../utils/format');
const { createRounder } = require("../utils/date");
const { feel2Gif } = require("../utils/gif");

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
          width: gif.images.fixed_height.width,
          height: gif.images.fixed_height.height,
          numFrames: gif.images.original.frames,
          caption,
        }
      });

      // proactively create the gif automatically
      feel2Gif(feel).catch(console.error);

      res.json(feel);
    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  });

  // SHOW
  app.get('/feelz/:id\.:ext?', async (req, res) => {
    try {
      const { id, ext } = req.params;

      const feel = await Feel.findById(id);

      if (!feel) return res.status(404).end();

      if (ext === "gif") {
        const outputFilePath = await feel2Gif(feel);

        res.sendFile(outputFilePath);
      } else {
        res.json(feel);
      }
    } catch (e) {
      res.json({
        error: e.message,
      });
    }
  });
};
