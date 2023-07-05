const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const bot = require("../../src/botMain")
const classes = require("../../classes.json");
const { cLog } = require("./cLog");
const noBreakSpace = "\u00A0"


async function createWaitingForReviewMessage(interaction, charInfo, verifiedAccount, improvementInput, currentGuildId, inputArmory, inputName, channel = "1089997649245126818") {
    
    const server = await bot.guilds.fetch(currentGuildId)//.name//.fetch(interaction.user.id)
    
    const member = await server.members.fetch(interaction.user.id)

    const submissionChannel = await bot.channels.fetch(channel)
    let description = null
    const maxLengt = 60
    if(charInfo == null) {
      description = `
      E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${verifiedAccount.dataValues.userEmail}**
      Armory:\u00A0\u00A0\u00A0\u00A0**[${inputName}](${inputArmory})**

      **Failed to get data from Blizzard**
      `
    } else {

    description = `
    E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${verifiedAccount.dataValues.userEmail}**
    Armory:\u00A0\u00A0\u00A0\u00A0**[${charInfo.dataValues.characterName}](${charInfo.dataValues.armoryLink})**
    Item level:\u00A0**${charInfo.dataValues.armorLevel}**
    Class:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0**${charInfo.dataValues.characterClass}**
    Region:\u00A0\u00A0\u00A0\u00A0**${charInfo.dataValues.characterRegion}**`
  
    if(charInfo.dataValues.twoVtwoRating != null) {
      let n = `\n\n__2v2:${noBreakSpace.repeat()}**${charInfo.dataValues.twoVtwoRating}**__`.length
      description+=`\n\n__2v2:${noBreakSpace.repeat(65-n)}**${charInfo.dataValues.twoVtwoRating}**__`
    }
    if(charInfo.dataValues.threeVthreeRating != null) {
      let n = `\n\n__3v3:${noBreakSpace.repeat()}**${charInfo.dataValues.threeVthreeRating}**__`.length
      description+=`\n\n__3v3:${noBreakSpace.repeat(65-n)}**${charInfo.dataValues.threeVthreeRating}**__`
    }
    if(charInfo.dataValues.soloShuffleSpec1Rating != null&& charInfo.dataValues.soloShuffleSpec1Rating!= undefined) {
      let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][0]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec1Rating}**__`.length
      description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][0]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec1Rating}**__`
    }
    if(charInfo.dataValues.soloShuffleSpec2Rating != null&& charInfo.dataValues.soloShuffleSpec2Rating!= undefined) {
      let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][1]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec2Rating}**__`.length
      description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][1]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec2Rating}**__`
    }
    if(charInfo.dataValues.soloShuffleSpec3Rating != null&& charInfo.dataValues.soloShuffleSpec3Rating!= undefined) {
      let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][2]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec3Rating}**__`.length
      description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][2]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec3Rating}**__`
    }
    if(charInfo.dataValues.soloShuffleSpec4Rating != null && charInfo.dataValues.soloShuffleSpec4Rating!= undefined) {
      let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][3]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec4Rating}**__`.length
      description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][3]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec4Rating}**__`
    }
  }

    description+=`\n\nClip to review: **${verifiedAccount.dataValues.clipLink}**`
    description+=`\nWhat they want to improve on: **${improvementInput}**`
    const waitingForReviewEmbed = new EmbedBuilder()
    .setTitle(`Submission ${verifiedAccount.dataValues.id}`)  
    .setAuthor({ name: `${interaction.user.tag} ( ${interaction.user.id} )`, iconURL: member.displayAvatarURL(true)})
      .setDescription(description)
      //.setThumbnail(charInfo.characterImage)
      //.setFooter({text:"This submission is unclaimed"})
  
    const waitingForReviewRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('claimsubmission')
          .setLabel('Claim')
          .setStyle("Success"),
        new ButtonBuilder()
          .setCustomId('rejectsubmission')
          .setLabel('Reject')
          .setStyle("Danger")
      );
        await submissionChannel.send({embeds:[waitingForReviewEmbed], components:[waitingForReviewRow]  })
}
  
async function createValWaitingForReviewMessage(interaction, charInfo, verifiedAccount, improvementInput, currentGuildId, inputTrack, inputName, channel = "1085409586997108746") {

  const server = await bot.guilds.fetch(currentGuildId)//.name//.fetch(interaction.user.id)
  
  const member = await server.members.fetch(interaction.user.id)

  const submissionChannel = await bot.channels.fetch(channel)
  let description = null
  const maxLengt = 60
  if(charInfo == null) {
    description = `
    Tracker.gg:\u00A0\u00A0\u00A0\u00A0**[${inputName}](${inputTrack})**

    **Failed to get data from API**
    `
  } else {

  description = `
  Tracker.gg:\u00A0\u00A0\u00A0\u00A0**[${charInfo.accountData.data.data.name}](${inputTrack})**
  Current Rank:\u00A0**${charInfo.MMRdata.data.data.current_data.currenttierpatched}**
  All-time Rank:\u00A0**${charInfo.MMRdata.data.data.highest_rank.patched_tier}**
  Elo:\u00A0\u00A0\u00A0\u00A0**${charInfo.MMRdata.data.data.current_data.elo}**`

  
}

  description+=`\n\nClip to review: **${verifiedAccount.dataValues.clipLink}**`
  description+=`\nWhat they want to improve on: **${improvementInput}**`
  const waitingForReviewEmbed = new EmbedBuilder()
    .setTitle(`Submission ${verifiedAccount.dataValues.id}`)  
    .setAuthor({ name: `${interaction.user.tag} ( ${interaction.user.id} )`, iconURL: member.displayAvatarURL(true)})
    .setDescription(description)
    //.setThumbnail(charInfo.characterImage)
    //.setFooter({text:"This submission is unclaimed"})

  const waitingForReviewRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('claimsubmission')
        .setLabel('Claim')
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId('rejectsubmission')
        .setLabel('Reject')
        .setStyle("Danger")
    );
      await submissionChannel.send({embeds:[waitingForReviewEmbed], components:[waitingForReviewRow]  })
}
module.exports = { createWaitingForReviewMessage, createValWaitingForReviewMessage }