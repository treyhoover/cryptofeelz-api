const _ = require("lodash");
const Coin = require("./model");

module.exports = (app) => {
  // INDEX
  app.get('/coin', async (req, res) => {
    const allCoins = await Coin.findAll({ attributes: ['symbol'] });
    const json = _.map(allCoins, "symbol");

    res.json(json);
  });
};
