require("dotenv").config({path: './.env'});
const { Sequelize } = require('sequelize')


module.exports = new Sequelize( process.env.dbName, process.env.dbName, process.env.dbPass, {
  host: process.env.dbHost,
  dialect: 'mariadb'
});


