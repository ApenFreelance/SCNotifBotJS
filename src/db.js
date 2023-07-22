require("dotenv").config({ path: "./.env" });
const { Sequelize } = require("sequelize");

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
      if (guildId === process.env.ValServerId) {
        return ValReviewHistory;
      } else if (guildId === process.env.WoWServerId) {
        return ReviewHistory;
      } else if (guildId === process.env.DevServerId) {
        return ValReviewHistory;
      }
    } catch (err) {
      cLog(["ERROR ", err], { guild: guildId, subProcess: "getCorrectTable" });
    }
  }
}

module.exports = {db, getCorrectTable};
