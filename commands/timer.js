const { SlashCommandBuilder } = require("discord.js");
const { getOrCreateTimeBetweenEntry } = require("../components/functions/timerOverwrite");
const { selectServer } = require("../components/functions/selectServer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timer")
    .setDescription("Review timer controls")
    .addSubcommand(subcommand => // Add role overwrite
        subcommand
            .setName("addrole")
            .setDescription("Add overwrite for role")
            .addRoleOption(option => option.setName("role").setDescription("Set role to add").setRequired(true))
            .addIntegerOption(option => option.setName("days").setDescription("Set time between reviews in days").setRequired(true))
            .addIntegerOption(option => option.setName("uses").setDescription("Set amount of uses. Leave empty for unlimited")))
            
    .addSubcommand(subcommand => // Add user overwrite
        subcommand
            .setName("adduser")
            .setDescription("Add overwrite for user")
            .addUserOption(option => option.setName("user").setDescription("Set user to add"))
            .addIntegerOption(option => option.setName("days").setDescription("Set time between reviews in days. Leave empty for unlimited"))
            .addIntegerOption(option => option.setName("uses").setDescription("Set amount of uses. Leave empty for unlimited"))),
    
  async execute(interaction) {
    let responseText
    const subcommand = interaction.options.getSubcommand()
    const days = interaction.options.getInteger("days")
    let uses = interaction.options.getInteger("uses")
    if(uses === null) {
        uses = "unlimited"
    }
    const seconds = days * 86400 // multiplied by seconds in a day
    // Store as seconds to use later

    const server = selectServer(interaction.guildId)
    if(subcommand === 'addrole') {
        const role = interaction.options.getRole("role")
        responseText = await getOrCreateTimeBetweenEntry(role.id, role.name, seconds, uses, server, true)
    }
    if(subcommand === 'adduser') {
        const user = interaction.options.getUser("user")
        responseText = await getOrCreateTimeBetweenEntry(user.id, user.username, seconds, uses, server, false)
    }
    await interaction.reply({content:responseText, ephemeral:true})
  },
};
