const moment = require("moment");
const pluralize = require("pluralize");
const Feelz = require("./model");
const Coin = require("../Coin/model");
const { percentToEmotion } = require('../utils/emotions');
const { createRounder } = require("../utils/date");

const roundDate = createRounder(5); // round dates to 5 minutes

const getDateRange = (days = 0) => {
  const endDate = roundDate();
  const startDate = moment(endDate).subtract(days, "days").toDate();

  return { startDate, endDate };
};

module.exports = (app) => {
  // SHOW
  app.get('/feelz', async (req, res) => {
    try {
      const { symbol = "BTC", days: _days = "1" } = req.query;
      const days = Number(_days);

      const { startDate, endDate } = getDateRange(Number(days));

      const fetchHistorical = Coin.getPrice({ symbol, date: startDate });
      const fetchCurrent = Coin.getPrice({ symbol, date: endDate });

      const [prevPrice, currentPrice] = await Promise.all([fetchHistorical, fetchCurrent]);
      const percent = Math.round((currentPrice / prevPrice - 1) * 100);
      const emotion = percentToEmotion(percent);
      const gif = await Feelz.fetchGif(emotion);

      const upOrDown = percent >= 0 ? "up" : "down";
      const amt = Math.abs(percent);
      const time = days === 1 ? "day" : `${days} ${pluralize("days", days)}`;
      const caption = `When ${symbol} is ${upOrDown} ${amt}% in the past ${time}`;

      res.json({
        symbol,
        days,
        percent,
        emotion,
        gif,
        caption,
        createdAt: new Date(),
      });
    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  });
};
