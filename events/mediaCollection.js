const ReviewHistory = require("../models/ReviewHistory");
const WoWCharacters = require("../models/WoWCharacters");
const bot = require("../src/botMain");
const classes = require("../classes.json");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const noBreakSpace = "\u00A0"
const wowServer = "294958471953252353"

async function createWaitingForReviewMessage(interaction, charInfo, verifiedAccount) {
  const server = await bot.guilds.fetch(wowServer)//.name//.fetch(interaction.user.id)
  const member = await server.members.fetch(interaction.user.id)

  const submissionChannel = await bot.channels.fetch("1089997649245126818")
  const maxLengt = 60
  
  let description = `
  Name: **${charInfo.dataValues.characterName}** 
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


module.exports = {
  name: 'mediaCollection',
  once: false,
  async execute(interaction) {    

    let button = interaction.customId
      // do your stuff
      try {

      
        if(button.includes("review")) {
          button = parseInt(button.replace("clip-", "").replace("-review", ""))
          ReviewHistory.findOne({where: {
            id:button
          }}).then(db => {
            //get clip submitted by coach
            


          //update db with clip submitted by coach
            db.update({
              reviewLink:"WIP"
            })
          })
          //await main(forSpread)
          return
      } 
    } catch (err) {
        console.log("failed during coach response part\n", err, "\n\n")
      }


      button = parseInt(button.replace("clip-", ""))
      try {
        console.log(button)
        const reviewInfo = await ReviewHistory.findOne({where: {
          id:button
        }})
        if(reviewInfo.dataValues.status == "Rejected") {
          await interaction.reply("This submission has been rejected")
          return
        }
        else if(reviewInfo.dataValues.status != "SentToUser") {
          await interaction.reply("Please wait until a coach can respond")
          return
        }
        await reviewInfo.update({
          clipLink:"WIP",
          status:"Available"
        })
        
        const char = await WoWCharacters.findOne({where: {
          id:reviewInfo.dataValues.charIdOnSubmission
        }})
        await createWaitingForReviewMessage(interaction, char, reviewInfo)
        await interaction.reply({content:"Submission completed, you will be notified when a coach reacts"})
    } catch (err) {
      console.log("failed during user response part\n", err, "\n\n")
    }
      //await main(forSpread)
  },
};
