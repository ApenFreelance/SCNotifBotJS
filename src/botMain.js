require("dotenv").config({path: '../.env'});
const blizzard = require('blizzard.js')
const fs = require("fs");

const { Collection, Client, GatewayIntentBits,SlashCommandBuilder } = require('discord.js');
const SCverifiedAccountDB = require("../models/SCverifiedAccountDB");
const db = require("./db");
const WoWCharacters = require("../models/WoWCharacters");
const characterHistory = require("../models/CharacterHistory");
const SCverifV2 = require("../models/SCVerifV2");
const ReviewHistory = require("../models/ReviewHistory");

const logChannelServer = bot.channels.fetch("1024961321768329249").catch(err => console.log(err))




const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});
module.exports = bot;
bot.commands = new Collection();
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
    //logChannelServer.send()
});


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

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











bot.on("ready", async () => {
    console.log(`>>>>${bot.user.username} has logged in`)
    //SCverifiedAccountDB.init(db)
    //SCverifiedAccountDB.sync(db)

    //SCverifV2.init(db)
    //SCverifV2.sync(db)
    WoWCharacters.init(db)
    WoWCharacters.sync(db)

    ReviewHistory.init(db)
    ReviewHistory.sync(db)
    
    

    
})





bot.login(process.env.BOT_TOKEN);