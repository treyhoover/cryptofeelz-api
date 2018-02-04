const _ = require("lodash");

require('dotenv').config();

const defaultEnv = {
  PORT: 3000,
  REDIS_HOST: "127.0.0.1",
  REDIS_PORT: "6379",
  GIPHY_API_KEY: "CHOO0Uw2ELi7jXsVIUednM1DpBGHByHh",
  RDS_HOSTNAME: "localhost",
  RDS_PORT: "5432",
  RDS_DB_NAME: "cryptofeelz_dev",
  RDS_USERNAME: "user",
  RDS_PASSWORD: null,
};

module.exports = _.defaults(process.env, defaultEnv);
