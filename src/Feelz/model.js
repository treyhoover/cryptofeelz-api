const { STRING, INTEGER } = require("sequelize");
const sequelize = require("../db");

const Feelz = sequelize.define('feelz', {
  symbol: STRING,
  days: INTEGER,
  percent: INTEGER,
  emotion: STRING,
});

Feelz.sync();

module.exports = Feelz;
