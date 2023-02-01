
require("dotenv").config({path: '../.env'});

const { Collection, Client, GatewayIntentBits,SlashCommandBuilder } = require('discord.js');

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});

bot.on("ready", async () => {
    console.log(`>>>>${bot.user.username} has logged in`)
    
})





bot.login(process.env.BOT_TOKEN);