const Gif = require("./model");

module.exports = (app) => {
  // SHOW
  app.get('/gif', async (req, res) => {
    Gif.create()
      .pipe(res);
  });
};
