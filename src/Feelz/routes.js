const _ = require("lodash");
const Coin = require("../Coin/model");
const { percentToEmotion } = require('../utils/emotions');

module.exports = (app) => {
  // SHOW
  app.get('/feelz', async (req, res) => {
    try {
      const { symbol = "BTC", days: _days = "1" } = req.query;
      const days = Number(_days);

      const date = new Date();
      date.setDate(date.getDate() - days);
      const ts = Date.parse(date.toDateString()) / 1000;

      const coin = await Coin.findById(symbol);

      const fetchHistorical = coin.getPrice(ts);
      const fetchCurrent = coin.getPrice();

      const [prevPrice, currentPrice] = await Promise.all([fetchHistorical, fetchCurrent]);
      const percent = Math.round((currentPrice / prevPrice - 1) * 100);
      const emotion = percentToEmotion(percent);

      res.json({
        symbol,
        days,
        percent,
        emotion,
      });
    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  });
};
