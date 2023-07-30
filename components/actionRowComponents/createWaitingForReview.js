const bot = require("../../src/botMain");
const classes = require("../../classes.json");
const { cLog } = require("../functions/cLog");
const { waitingForReviewRow } = require("../buttons");
const { createWaitingForReviewEmbed } = require("../embeds");
const noBreakSpace = "\u00A0";

async function createWaitingForReviewMessage(interaction,charInfo,
  reviewHistory,
  improvementInput,
  linkToUserPage,
  inputName,
  server
) {
  const member = await interaction.guild.members.fetch(interaction.user.id);
  const submissionChannel = await bot.channels.fetch(server.submissionChannelId);
  let description = null;
  if(server.serverName == "WoW") {
    if (charInfo == null) {
      description = `E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${reviewHistory.userEmail}**\nArmory:\u00A0\u00A0\u00A0\u00A0**[${inputName}](${linkToUserPage})**\n\n**Failed to get data from Blizzard**`;
    } else {
      description = `E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${reviewHistory.userEmail}**\nArmory:\u00A0\u00A0\u00A0\u00A0**[${charInfo.characterName}](${linkToUserPage})**\nItem level:\u00A0**${charInfo.armorLevel}**\nClass:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0**${charInfo.characterClass}**\nRegion:\u00A0\u00A0\u00A0\u00A0**${charInfo.characterRegion}**`;
      description = addWoWRoleStats(charInfo, description)
    }
  }
  else if(server.serverName == "Valorant") {
    if (charInfo == null) {
      description = `Tracker.gg:\u00A0\u00A0\u00A0\u00A0**[${inputName}](${linkToUserPage})**\n\n**Failed to get data from API**`;
    } else {
      description = `Tracker.gg:\u00A0\u00A0\u00A0\u00A0**[${charInfo.accountData.data.data.name}](${linkToUserPage})**\nCurrent Rank:\u00A0**${charInfo.MMRdata.data.data.current_data.currenttierpatched}**\nAll-time Rank:\u00A0**${charInfo.MMRdata.data.data.highest_rank.patched_tier}**\nElo:\u00A0\u00A0\u00A0\u00A0**${charInfo.MMRdata.data.data.current_data.elo}**`;
    }
  }

  description += `\n\nClip to review: **${reviewHistory.clipLink}**`;
  description += `\nWhat they want to improve on: **${improvementInput}**`;
  await submissionChannel.send({embeds: [await createWaitingForReviewEmbed(interaction, reviewHistory, member, description)], components:[waitingForReviewRow]})
  cLog(["Successfully sent submission"], {
    guild: interaction.guildId,
    subProcess: "CreateWaitingForReview",
  });
}

module.exports = {createWaitingForReviewMessage};


function addWoWRoleStats(charInfo, description) {
  const maxLengt = 60;
  if (charInfo.twoVtwoRating != null) {
    let n = `\n\n__2v2:${noBreakSpace.repeat()}**${
      charInfo.twoVtwoRating
    }**__`.length;
    description += `\n\n__2v2:${noBreakSpace.repeat(65 - n)}**${
      charInfo.twoVtwoRating
    }**__`;
  }
  if (charInfo.threeVthreeRating != null) {
    let n = `\n\n__3v3:${noBreakSpace.repeat()}**${
      charInfo.threeVthreeRating
    }**__`.length;
    description += `\n\n__3v3:${noBreakSpace.repeat(65 - n)}**${
      charInfo.threeVthreeRating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec1Rating != null &&
    charInfo.soloShuffleSpec1Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][0]
    }:${noBreakSpace.repeat()}**${
      charInfo.soloShuffleSpec1Rating
    }**__`.length;
    description += `\n\n__Shuffle ${
      classes[charInfo.characterClass][0]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec1Rating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec2Rating != null &&
    charInfo.soloShuffleSpec2Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][1]
    }:${noBreakSpace.repeat()}**${
      charInfo.soloShuffleSpec2Rating
    }**__`.length;
    description += `\n\n__Shuffle ${
      classes[charInfo.characterClass][1]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec2Rating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec3Rating != null &&
    charInfo.soloShuffleSpec3Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][2]
    }:${noBreakSpace.repeat()}**${
      charInfo.soloShuffleSpec3Rating
    }**__`.length;
    description += `\n\n__Shuffle ${
      classes[charInfo.characterClass][2]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec3Rating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec4Rating != null &&
    charInfo.soloShuffleSpec4Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][3]
    }:${noBreakSpace.repeat()}**${
      charInfo.soloShuffleSpec4Rating
    }**__`.length;
    description += `\n\n__Shuffle ${
      classes[charInfo.characterClass][3]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec4Rating
    }**__`;
  }
  return description
}