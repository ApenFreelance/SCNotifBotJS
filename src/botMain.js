require("dotenv").config({ path: "../.env" });
const fs = require("fs");

const { Collection, Client, GatewayIntentBits } = require("discord.js");
const { db } = require("./db");
const { cLog } = require("../components/functions/cLog");
const WoWCharacters = require("../models/WoWCharacters");
const ValReviewHistory = require("../models/ValReviewHistory");
const DevValReviewHistory = require("../models/DevValReviewHistory");
const DevWoWReviewHistory = require("../models/DevWoWReviewHistory");
const WoWReviewHistory = require("../models/WoWReviewHistory");
const ReviewTimerOverwrite = require("../models/ReviewTimerOverwrite");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
bot.commands = new Collection();
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  //logChannelServer.send()
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception : ", error);
});

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./events")
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
// Lukas var her! @lukasolsen


//bot.rest.on("restDebug", console.log)

bot.rest.on("rateLimited", (data) => {
  console.log(`[ RATE LIMIT ]`);
});


const models = [
  WoWCharacters, 
  WoWReviewHistory, 
  ValReviewHistory, 
  DevWoWReviewHistory, 
  DevValReviewHistory, 
  ReviewTimerOverwrite
];


bot.on("ready", async () => {
  cLog([`${bot.user.username} has logged in`], { subProcess: "Start-up" });
  models.forEach((model) => {
    model.init(db)
    model.sync();
    
  });
});

bot.login(process.env.BOT_TOKEN);
