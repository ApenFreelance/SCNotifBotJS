require("dotenv").config({path: '../.env'});

const fs = require("fs");

const { Collection, Client, GatewayIntentBits,SlashCommandBuilder } = require('discord.js');





const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});
module.exports = bot;
bot.commands = new Collection();
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
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
    
})





bot.login(process.env.BOT_TOKEN);