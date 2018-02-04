const { STRING, TEXT } = require("sequelize");
const sequelize = require("../db");

const Permalink = sequelize.define('permalink', {
  url: STRING,
  caption: TEXT,
});

Permalink.sync();

module.exports = Permalink;
