const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi");
const { createRatingModal } = require("../components/modals");
const { update } = require("../models/DevReviewHistory");
const { getCorrectTable } = require("../src/db");


module.exports = {
    name: 'rateReview',
    once: false,
    async execute(interaction) {
      let serverId = null;
      let ratingNumber = null;
      let submissionNumber = null;
        if(type == "modal") {
          if(interaction.customId.includes("valreviewratingmodal")) {
            serverId = "855206452771684382"
            submissionNumber = interaction.customId.replace("valreviewratingmodal","")
          } else {
            serverId = "294958471953252353"
            submissionNumber = interaction.customId.replace("reviewratingmodal","")
          }
            const reviewHistory = await getCorrectTable(serverId, "reviewHistory").findOne({
                where:{
                    id: submissionNumber
                }
            })
            await reviewHistory.update({
                reviewRatingComment:interaction.fields.fields.get("feedback").value
                })
            await updateGoogleSheet(createSheetBody(submissionNumber, {reviewComment:interaction.fields.fields.get("feedback").value}))
            await interaction.reply(`Set comment to\n\n\`\`\`\n ${interaction.fields.fields.get("feedback").value}\n\`\`\``)
            //TODO: Make it send to a specific channel as well for coaches to see
            cLog(["Text review given for review nr: " + submissionNumber], {subProcess:"ReviewValRating"})



        }
        if(type == "button") {
          if(interaction.customId.includes("valrating")) {
            serverId = "855206452771684382"
            ratingNumber = interaction.customId.replace("valrating","")
          } else {
            serverId = "294958471953252353"
            ratingNumber = interaction.customId.replace("rating","")
          }
            let submissionNumber = ratingNumber.slice(2)
            ratingNumber = ratingNumber.replace(/(-\d+)/, "")
            cLog([interaction.user.username + " Rated: " + submissionNumber], {subProcess:"ReviewValRating"})
            
            const reviewHistory = await getCorrectTable(serverId, "reviewHistory").findOne({
                where:{
                    id: submissionNumber
                }
            })
            await reviewHistory.update({
                reviewRating:parseInt(ratingNumber) 
            })
            if(serverId == "294958471953252353"){ // WoW ID
              await updateGoogleSheet(createSheetBody(submissionNumber, {reviewRating:reviewHistory.reviewRating}))
            }
            await interaction.showModal(createRatingModal(submissionNumber))
            await interaction.user.send(`Set the rating to ${ratingNumber}`)
        }
    }
};
