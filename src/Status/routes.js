module.exports = (app) => {
  app.get('/status', async (req, res) => {
    res.json({ healthy: true });
  });
};
