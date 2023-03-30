const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const bot = require("../../src/botMain")
const classes = require("../../classes.json");
const noBreakSpace = "\u00A0"



async function createWaitingForReviewMessage(interaction, charInfo, verifiedAccount, improvementInput, currentGuildId, channel = "1089997649245126818") {
    const server = await bot.guilds.fetch(currentGuildId)//.name//.fetch(interaction.user.id)
    
    const member = await server.members.fetch(interaction.user.id)

    const submissionChannel = await bot.channels.fetch(channel)

    const maxLengt = 60
    
    let description = `
    E-mail: **${verifiedAccount.dataValues.userEmail}**
    Armory: **[${charInfo.dataValues.characterName}](${charInfo.dataValues.armoryLink})**
    Class: **${charInfo.dataValues.characterClass}**
    Region: **${charInfo.dataValues.characterRegion}**`
  
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
  

module.exports = { createWaitingForReviewMessage }