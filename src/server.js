const { PORT } = require("../config/env");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// register modules
require("./Permalink")(app);
require("./Status")(app);
require("./Coin")(app);
require("./Feelz")(app);

(async () => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`)
  });
})();
