const { cLog } = require("../components/functions/cLog");
const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi");
const { createRatingModal } = require("../components/modals");
const { getCorrectTable } = require("../src/db");
const serverInfo = require("../serverInfo.json");
const { createRatingEmbed } = require("../components/embeds");

module.exports = {
    name: 'rateReview',
    once: false,
    async execute(interaction) {
      let [game, _ , ratingNumber, submissionNumber, mode] = interaction.customId.split("-")
      let serverId
        if(interaction.isModalSubmit()) {
          cLog([interaction.user.username, " : attempting to provide review rating"], {subProcess:"ReviewRatingModal"})
          if(game == "valorant") {
            serverId = serverInfo["Valorant"].serverId
            game = "Valorant"
          } else if (game = "wow"){
            serverId = serverInfo["WoW"].serverId
            await updateGoogleSheet(createSheetBody(mode, submissionNumber, {reviewComment:interaction.fields.fields.get("feedback").value}))
            game = "WoW"
          }
            const reviewHistory = await getCorrectTable(serverId, "reviewHistory", mode).then((table) => {
              return table.findOne({
                where:{
                    id: submissionNumber
                }
            })})
            await reviewHistory.update({
                reviewRatingComment:interaction.fields.fields.get("feedback").value
                })
            let ratingEmbed = await createRatingEmbed(reviewHistory.reviewRating, interaction.fields.fields.get("feedback").value, interaction)
            await interaction.client.guilds.fetch(serverId).then(server => server.channels.fetch(serverInfo[game][mode].ratingChannelId).then(channel => channel.send({embeds:[ratingEmbed]})))
            await interaction.reply(`Set comment to\n\n\`\`\`\n ${interaction.fields.fields.get("feedback").value}\n\`\`\``)
            //TODO: Make it send to a specific channel as well for coaches to see
            cLog(["Text review given for review nr: " + submissionNumber], {subProcess:"ReviewValRating"})



        }
        if(interaction.isButton()) {
          cLog([interaction.user.username, " : attempting to provide review rating"], {subProcess:"ReviewRatingButton"})
          if(game == "valorant") {
            serverId = serverInfo["Valorant"].serverId
          } else {
            serverId = serverInfo["WoW"].serverId
          }
            cLog([interaction.user.username + " Rated: " + submissionNumber], {subProcess:"ReviewRating"})
            const reviewHistory = await getCorrectTable(serverId, "reviewHistory", mode).then((table) => {
              return table.findOne({
                where:{
                    id: submissionNumber
                }
            })})
            await reviewHistory.update({
                reviewRating:parseInt(ratingNumber) 
            })
            if(game == "wow"){ // WoW ID
              await updateGoogleSheet(createSheetBody(mode, submissionNumber, {reviewRating:reviewHistory.reviewRating}))
            }
            await interaction.showModal(createRatingModal(submissionNumber, game, mode))
            await interaction.user.send(`Set the rating to ${ratingNumber}`)
        }
    }
};
