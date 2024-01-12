const { SlashCommandBuilder } = require("discord.js");
const { submitReviewButton } = require("../components/buttons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vodreview")
    .setDescription("Creates button to submit a vod review")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Choose between wowpvp or wowpve")
        .addChoices(
          { name: "WoWPVP", value: "wowpvp" },
          { name: "WoWPVE", value: "wowpve" })
        
        .setRequired(true)),

  async execute(interaction) {
    await interaction.reply({
      content: "Click button to submit",
      components: [submitReviewButton(interaction.options.getString("mode"))],
    });
  },
};
