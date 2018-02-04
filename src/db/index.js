const Sequelize = require('sequelize');

const {
  RDS_HOSTNAME,
  RDS_PORT,
  RDS_DB_NAME,
  RDS_USERNAME,
  RDS_PASSWORD,
} = require("../../config/env");

console.log("Connecting to db", RDS_HOSTNAME, RDS_PORT);

const sequelize = new Sequelize({
  host: RDS_HOSTNAME,
  port: RDS_PORT,
  database: RDS_DB_NAME,
  username: RDS_USERNAME,
  password: RDS_PASSWORD,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

module.exports = sequelize;
