require("dotenv").config({ path: "../.env" });
const blizzard = require("blizzard.js");
const fs = require("fs");

const { Collection, Client, GatewayIntentBits } = require("discord.js");
const db = require("./db");
const WoWCharacters = require("../models/WoWCharacters");
const ReviewHistory = require("../models/ReviewHistory");
const ValReviewHistory = require("../models/ValReviewHistory");
const { cLog } = require("../components/functions/cLog");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
module.exports = bot;
bot.commands = new Collection();
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  //logChannelServer.send()
});
process.on("uncaughtException", (error) => {
  console.error("uncaught excemption : ", error);
});

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));
const eventValFiles = fs
  .readdirSync("./eventsVal")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module

  bot.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
  const event = require(`../events/${file}`);
  if (event.once) {
    bot.once(event.name, (...args) => event.execute(...args));
  } else {
    bot.on(event.name, (...args) => event.execute(...args));
  }
}
for (const file of eventValFiles) {
  const event = require(`../eventsVal/${file}`);
  if (event.once) {
    bot.once(event.name, (...args) => event.execute(...args));
  } else {
    bot.on(event.name, (...args) => event.execute(...args));
  }
}

//bot.rest.on("restDebug", console.log)

bot.rest.on("rateLimited", (data) => {
  console.log(`[ RATE LIMIT ]`);
});

bot.on("ready", async () => {
  cLog([`${bot.user.username} has logged in`], { subProcess: "Start-up" });
  WoWCharacters.init(db);
  WoWCharacters.sync(db);

  ReviewHistory.init(db);
  ReviewHistory.sync(db);

  ValReviewHistory.init(db);
  ValReviewHistory.sync(db);
});

bot.login(process.env.BOT_TOKEN);
