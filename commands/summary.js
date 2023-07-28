const { SlashCommandBuilder } = require("discord.js");

const { Op } = require("sequelize");
const { getCorrectTable } = require("../src/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("summary")
    .setDescription("Summary of all completed reviews")
    .addIntegerOption((option) =>
      option
        .setName("weeks")
        .setDescription("how many weeks from now to include")
    )
    .addUserOption((option) =>
      option
        .setName("coach")
        .setDescription("This will give the info about this coaches tickets")
    )
    .addIntegerOption((option) =>
      option.setName("ticket").setDescription("Returns a singular ticket")
    ),

  async execute(interaction) {
    let weeks = interaction.options.getInteger("weeks");
    let coach = interaction.options.getUser("coach");
    let ticket = interaction.options.getInteger("ticket");
    let database = getCorrectTable(interaction.guildId, "reviewHistory")
    

    if (database == undefined) {
      await interaction.reply("This server is not recorded");
      return;
    }
    await createDatabaseRequest(database, weeks, coach.id);
    createOverviewEmbed(
      reviewSelection.map((result) => result.get({ plain: true }))
    );
  },
};

function createOverviewEmbed(reviewSelection) {}

async function createDatabaseRequest(database, weeks, coach) {
  let whereArgs = {};
  if (weeks !== null) {
    const currentDate = new Date();
    const fromWeeks = new Date(currentDate);
    fromWeeks.setDate(fromWeeks.getDate() - weeks * 7);
    whereArgs["createdAt"] = {
      [Op.between]: [fromWeeks, currentDate],
    };
  }
  if (coach !== null) {
    whereArgs["claimedByID"] = coach;
  }
  -console.log(whereArgs);
  const reviewSelection = await database.findAll({
    where: {
      [Op.and]: whereArgs,
    },
  });
  console.log(reviewSelection);
}
