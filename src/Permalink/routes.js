const Permalink = require("./model");

module.exports = (app) => {
  app.get('/permalink/:id/:slug?', async (req, res) => {
    const { id, slug } = req.params;

    const permalink = await Permalink.findById(id);

    res.json(permalink);
  });

  app.post('/permalink', async (req, res) => {
    const { url = "", caption = "" } = req.body;

    const permalink = await Permalink.create({
      url,
      caption,
    });

    res.json(permalink);
  });
};
