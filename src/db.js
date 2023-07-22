require("dotenv").config({ path: "./.env" });
const { Sequelize } = require("sequelize");
const serverInfoJSON = require("../serverInfo.json");
const DevReviewHistory = require("../models/DevReviewHistory");
const ValReviewHistory = require("../models/ValReviewHistory");
const WoWReviewHistory = require("../models/WoWReviewHistory");
const db = new Sequelize(
  process.env.dbName,
  process.env.dbName,
  process.env.dbPass,
  {
    host: process.env.dbHost,
    dialect: "mariadb",
    logging: false,
  }
)

async function getCorrectTable(guildId, tableGroup) {
  if (tableGroup === "reviewHistory") {
    try {
      if (guildId === serverInfoJSON["Valorant"].serverId) {
        return ValReviewHistory;
      } else if (guildId === serverInfoJSON["WoW"].serverId) {
        return WoWReviewHistory;
      } else if (guildId === serverInfoJSON["Dev"].serverId) {
        return DevReviewHistory;
      }
    } catch (err) {
      cLog(["ERROR ", err], { guild: guildId, subProcess: "getCorrectTable" });
    }
  }
}

module.exports = {db, getCorrectTable};
