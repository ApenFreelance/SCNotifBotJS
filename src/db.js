require("dotenv").config({ path: "./.env" });
const { Sequelize } = require("sequelize");
const serverInfoJSON = require("../serverInfo.json");
const DevValReviewHistory = require("../models/DevValReviewHistory");
const DevWoWReviewHistory = require("../models/DevWoWReviewHistory");
const DevPVEWoWReviewHistory = require("../models/DevPVEWoWReviewHistory");

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
);

const tableMapping = {
    reviewHistory: {
        [serverInfoJSON["Valorant"].serverId]: ValReviewHistory,
        [serverInfoJSON["WoW"].serverId]: {
            wowpve: DevPVEWoWReviewHistory,
            wowpvp: DevWoWReviewHistory,
        },
        [serverInfoJSON["Dev"].serverId]: {
            Valorant: DevValReviewHistory,
            WoW: DevWoWReviewHistory,
        },
    },
    WoWCharacter: {
        [serverInfoJSON["WoW"].serverId]: WoWCharacters,
    }
};

async function getCorrectTable(guildId, tableGroup, mode = null) {
    try {
        const table = tableMapping[tableGroup][guildId];
        if (typeof table === "object") {
            return mode ? table[mode] : null;
        }
        return table;
    } catch (err) {
        cLog(["ERROR ", err], {
            guild: guildId,
            subProcess: "getCorrectTable",
        });
    }
}

module.exports = { db, getCorrectTable };
