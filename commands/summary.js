const { SlashCommandBuilder } = require("discord.js");

const { Op } = require("sequelize");
const { getCorrectTable } = require("../src/db");
const { createOverviewEmbed } = require("../components/embeds");

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
    let database = await getCorrectTable(interaction.guildId, "reviewHistory")
    let timeFormat = "en-US"

    if (database == undefined) {
      await interaction.reply("This server is not recorded");
      return;
    }
    const {selectedReviews, time} = await createDatabaseRequest(database, weeks, coach, ticket, timeFormat);
    await interaction.reply({embeds:[createOverviewEmbed(countCoachReviews(selectedReviews.map((result) => result.get({ plain: true }))), time)], ephemeral:true})
    
  },
};


async function createDatabaseRequest(database, weeks, coach, ticket, timeFormat) {
  let whereArgs = {};
  let time = null
  let timeSelection = null
  if (weeks !== null) {
    ({timeSelection, time} = setTimeSelection(weeks, timeFormat))
    whereArgs["createdAt"] = timeSelection
  }
  if (coach !== null) {
    whereArgs[Op.or] = setCoachSelection(coach.id);
  }
  const selectedReviews = await database.findAll({
    where: {
      [Op.and]: [whereArgs]
    }
  });
  return {selectedReviews, time}
}

function setTimeSelection(weeks, timeFormat) {
  const currentDate = new Date();
  const fromWeeks = new Date(currentDate);
  fromWeeks.setDate(fromWeeks.getDate() - weeks * 7);
  return {timeSelection: {[Op.between]: [fromWeeks, currentDate]}, time:{start:fromWeeks.toLocaleDateString(timeFormat,{day:"numeric", month:"numeric"}), end:currentDate.toLocaleDateString(timeFormat,{day:"numeric", month:"numeric"}) }};
}


function setCoachSelection(coachId) {
  return [
    {claimedByID: coachId},
    {completedByID: coachId}
  ]
}

function countCoachReviews(selectedReviews) {
  const total = selectedReviews.length
  const perCoach = {}
  for(const review of selectedReviews) {
    if(review.claimedByID !== null) {
      if(!perCoach[review.claimedByID]) {
        perCoach[review.claimedByID] = 1
      } else {
        perCoach[review.claimedByID]++
      }
    }
    if(review.completedByID !== null && (review.completedByID !== review.claimedByID)) {
      if(!perCoach[review.completedByID]) {
        perCoach[review.completedByID] = 1
      } else {
        perCoach[review.completedByID]++
      }
    }
  }
  return {perCoach, total }
}