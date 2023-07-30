require("dotenv").config({ path: "./.env" });
const { Sequelize } = require("sequelize");
const serverInfoJSON = require("../serverInfo.json");
const DevValReviewHistory = require("../models/DevValReviewHistory");
const DevWoWReviewHistory = require("../models/DevWoWReviewHistory");

const ValReviewHistory = require("../models/ValReviewHistory");
const WoWReviewHistory = require("../models/WoWReviewHistory");
const WoWCharacters = require("../models/WoWCharacters");

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
        if(serverInfoJSON["Dev"].serverName == "Valorant") {
          return DevValReviewHistory
        } else if (serverInfoJSON["Dev"].serverName == "WoW") {
          return DevWoWReviewHistory;
        }
      }
    } catch (err) {
      cLog(["ERROR ", err], { guild: guildId, subProcess: "getCorrectTable" });
    }
  }
  else if (tableGroup == "WoWCharacter") {
    return WoWCharacters;
  }
}

module.exports = {db, getCorrectTable};
