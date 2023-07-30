const { cLog } = require("../components/functions/cLog");
const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi");
const { createRatingModal } = require("../components/modals");
const { getCorrectTable } = require("../src/db");


module.exports = {
    name: 'rateReview',
    once: false,
    async execute(interaction) {
      let game = null
      let serverId = null;
      let ratingNumber = null;
      let submissionNumber = null;
        if(interaction.isModalSubmit()) {
          cLog([interaction.user.username, " : attempting to provide review rating"], {subProcess:"ReviewRatingModal"})
          if(interaction.customId.includes("valorantreviewratingmodal")) {
            serverId = "1024961321768329246"
            submissionNumber = interaction.customId.replace("valorantreviewratingmodal","")
          } else {
            serverId = "1024961321768329246"
            submissionNumber = interaction.customId.replace("wowreviewratingmodal","")
            await updateGoogleSheet(createSheetBody(submissionNumber, {reviewComment:interaction.fields.fields.get("feedback").value}))
          }
            const reviewHistory = await getCorrectTable(serverId, "reviewHistory").then((table) => {
              return table.findOne({
                where:{
                    id: submissionNumber
                }
            })})
            await reviewHistory.update({
                reviewRatingComment:interaction.fields.fields.get("feedback").value
                })

            await interaction.reply(`Set comment to\n\n\`\`\`\n ${interaction.fields.fields.get("feedback").value}\n\`\`\``)
            //TODO: Make it send to a specific channel as well for coaches to see
            cLog(["Text review given for review nr: " + submissionNumber], {subProcess:"ReviewValRating"})



        }
        if(interaction.isButton()) {
          cLog([interaction.user.username, " : attempting to provide review rating"], {subProcess:"ReviewRatingButton"})
          if(interaction.customId.includes("valorantreviewrating")) {
            serverId = "855206452771684382"
            ratingNumber = interaction.customId.replace("valorantreviewrating","")
            game = "valorant"
          } else {
            serverId = "294958471953252353"
            ratingNumber = interaction.customId.replace("wowreviewrating","")
            game = "wow"
          }
            let submissionNumber = ratingNumber.slice(2)
            ratingNumber = ratingNumber.replace(/(-\d+)/, "")
            cLog([interaction.user.username + " Rated: " + submissionNumber], {subProcess:"ReviewValRating"})
            const reviewHistory = await getCorrectTable(serverId, "reviewHistory").then((table) => {
              return table.findOne({
                where:{
                    id: submissionNumber
                }
            })})
            await reviewHistory.update({
                reviewRating:parseInt(ratingNumber) 
            })
            if(serverId == "294958471953252353"){ // WoW ID
              await updateGoogleSheet(createSheetBody(submissionNumber, {reviewRating:reviewHistory.reviewRating}))
            }
            await interaction.showModal(createRatingModal(submissionNumber, game))
            await interaction.user.send(`Set the rating to ${ratingNumber}`)
        }
    }
};
