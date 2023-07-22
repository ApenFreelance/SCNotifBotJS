const { SlashCommandBuilder } = require("discord.js");
const { submitReviewButton } = require("../components/buttons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vodreview")
    .setDescription("Test Command for now"),

  async execute(interaction) {
    await interaction.reply({
      content: "Click button to submit",
      components: [submitReviewButton],
    });
  },
};
