const _ = require("lodash");
const Coin = require("./model");

module.exports = (app) => {
  // INDEX
  app.get('/coin', async (req, res) => {
    const allCoins = await Coin.findAll({ attributes: ['symbol'] });
    const json = _.map(allCoins, "symbol");

    res.json(json);
  });

  // SHOW
  app.get('/coin/:symbol', async (req, res) => {
    const { symbol = "BTC" } = req.params;

    const coin = await Coin.findOne({ where: { symbol } });
    const price = await coin.getPrice();

    res.json({
      symbol: coin.symbol,
      price,
    });
  });
};
