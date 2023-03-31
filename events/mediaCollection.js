const ReviewHistory = require("../models/ReviewHistory");
const WoWCharacters = require("../models/WoWCharacters");
const bot = require("../src/botMain");
const classes = require("../classes.json");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const noBreakSpace = "\u00A0"
const wowServer = "294958471953252353"



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
