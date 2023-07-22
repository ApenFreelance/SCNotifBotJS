const { SlashCommandBuilder } = require("discord.js");
const bot = require("../src/botMain");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("close the review"),

  async execute(interaction) {
    if (!interaction.channel.name.startsWith("review-")) {
      await interaction.reply({
        content: "This command is only allowed in tickets",
        ephemeral: true,
      });
      return;
    }

    bot.emit("completeReview", interaction);
  },
};
