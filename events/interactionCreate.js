
require("dotenv").config({path: '../.env'});
const bot = require('../src/botMain');
//const { main } = require('../components/functions/googleApi'); CHECK IF THIS IS NEEDED
const { cLog } = require('../components/functions/cLog');
const { createSubmissionModal } = require('../components/modals');
const serverInfoJSON = require("../serverInfo.json")


const regexWoWLink = /(https):\/\/((worldofwarcraft\.blizzard\.com||worldofwarcraft\.com)\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/.+)/
const regexValLink = /(https):\/\/(tracker\.gg\/valorant\/profile\/riot)\/.+/
module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
      // Slash command handler
      try {
        if (interaction.isCommand()) {
          await slashCommandHandler(interaction)
          return
        }
        // End of slash command handler
        const server = selectServer(interaction.guildId) // 
        /*
        Contains:
          serverName
          serverId
          reviewCategoryId
        */

        if(interaction.customId == "submitreview") {
          await createSubmissionModal(interaction, server)
        }

        if(interaction.customId == "submissionmodal") {
          await interaction.reply({content:"Processing...", ephemeral:true})
          
          if(validLink(interaction, server.serverName)) {
            bot.emit("submitReview", interaction)
          }
          else {
            await interaction.editReply({content:"This link is not valid.\n\nThink this is a mistake? Let us know", ephemeral:true})
          }
        }
        if(interaction.customId == "claimsubmission") {
          bot.emit("claimValReview", interaction)
        }
        if(interaction.customId == "rejectsubmission") {
          bot.emit("rejectValReview", interaction)
        }
        if(interaction.customId.startsWith("closesubmission-")) {
          bot.emit("closeSubmission", interaction)
        }
        if(interaction.customId.startsWith("delete-")) {
          bot.emit("completeValReview", interaction)
        }
        if(interaction.customId.startsWith("completesubmission")) {
          let reviewlink = interaction.fields.getTextInputValue("reviewlink")
          cLog(["Review nr: ",interaction.customId.replace("completesubmission-", "")], {guild:interaction.guild, subProcess:"setReviewLink"})
          const h = await ValReviewHistory.findOne({
            where: {
              id:interaction.customId.replace("completesubmission-", "")
            }
          })
          await h.update({
            reviewLink:reviewlink
          })
          await interaction.reply({content:"Updated the review link to "+ reviewlink, ephemeral:true})
        }
        /// THIS NEEDS TO BE FIXED. THERE WAS A VAL CHECK BEFORE THIS
      
      if(/^valrating\d-\d+/.test(interaction.customId) ) {
        bot.emit("rateValReview", interaction, "button")
        return
      }
      if(interaction.customId.startsWith("valreviewratingmodal")) {
        bot.emit("rateValReview", interaction, "modal")
        return
      }
      // WOW server stuff

        try {
          
          if(interaction.customId == "claimsubmission") {
            bot.emit("claimReview", interaction)
          }
          if(interaction.customId == "rejectsubmission") {
            bot.emit("rejectReview", interaction)
          }
          if(interaction.customId.startsWith("completesubmission")) {
            
            let reviewlink = interaction.fields.getTextInputValue("reviewlink")
            console.log(reviewlink, interaction.customId.replace("completesubmission-", ""))

            const h = await ReviewHistory.findOne({
              where: {
                id:interaction.customId.replace("completesubmission-", "")
              }
            })
            await h.update({
              reviewLink:reviewlink
            })
            const forSpread = [
              {
              "range": `T${interaction.customId.replace("completesubmission-", "")}`, //Review link
              "values": [
                  [
                  reviewlink
                  ]
              ]
              }
          ]

            await main(forSpread)
            await interaction.reply({content:"Updated the review link", ephemeral:true})
          }
          if(/^rating\d-\d+/.test(interaction.customId)) {
            bot.emit("rateReview", interaction, "button")
          }
          if(interaction.customId.startsWith("delete-")) {
            bot.emit("completeReview", interaction)
          }
          if(interaction.customId.startsWith("closesubmission-")) {
            bot.emit("closeSubmission", interaction)
          }
          if(interaction.customId.startsWith("open-")) {
            bot.emit("openReview", interaction)
          }
          if(interaction.customId.startsWith("reviewratingmodal")) {
            bot.emit("rateReview", interaction, "modal")
          }
          if(interaction.customId.startsWith("clip-")) {
            bot.emit("mediaCollection", interaction)
          }
        

        } catch (err) {
          if(err.toString().startsWith("TypeError: Cannot read properties of undefined (reading 'startsWith')")) {
            console.log("Not review related")
          } else {
            await interaction.editReply({content:"Something went wrong, please contact staff", ephemeral:true})
            console.log(err) }
        }
      

          
    } catch (err) {
      console.log("Failed somewhere during interaction : ", err, interaction.user.tag)
      await interaction.editReply({content:"Something went wrong, please contact staff", ephemeral:true})
    }} }
    

function selectServer(serverId) {
  for (let key in serverInfoJSON) {
    if (serverInfoJSON[key].serverId === serverId) {
      return serverInfoJSON[key];
    }
  }
  return null;
}


async function slashCommandHandler(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (command) {
      try {
          await command.execute(interaction);
        return
      }
      catch (error) {
          console.error(error);
          await interaction.reply({ content: `${error}`, ephemeral: true });
          return
      }
  }
}


async function blockIfLacksRole(interaction, game) {
  if (!interaction.member.roles.cache.some(role => role.name === '💎・Infinity+'|| role.name === '🌸・Server Booster')) {
    await interaction.reply({content:"You need to be 💎・Infinity+ or 🌸・Server Booster", ephemeral:true})
    return
  }
}

function validLink(interaction, game) {
  if(game == "WoW") {
    return regexWoWLink.test(interaction.fields.getTextInputValue("armory"))
  }
  else if(game == "Valorant") {
    return regexValLink.test(interaction.fields.getTextInputValue("tracker"))
  } else {
    cLog(["Unknown server for regexCheck"], {guild:interaction.guildId, subProcess:"RegexCheck"})
    return false
  }
}