const { ActionRowBuilder, ButtonBuilder, TextInputStyle, ModalBuilder, TextInputBuilder } = require("discord.js");
const { main } = require("../components/functions/googleApi");
const ReviewHistory = require("../models/ReviewHistory");

const { createReviewButtons } = require("../components/functions/createReviewButtons");
const { checkIfHasReviewLink } = require("../components/functions/checkIfHasReviewLink");
const { completeSubmissionEmbed } = require("../components/modals/reviewLinkModal");




module.exports = {
    name: 'completeReview',
    once: false,
    async execute(interaction) { 
      let channel = null
        //const embedAuthor = interaction.message.embeds[0].author.name.match(/\d{18}/)
        //const user = await interaction.guild.members.fetch(embedAuthor[0])
        let submissionNumber
        try {
          submissionNumber = interaction.channel.name.replace("closed-", "").replace("review-", "")
        } catch(err) {
          console.log(err)
          
        }
        try {
         channel = interaction.guild.channels.cache.find(channel => channel.name == `review-${submissionNumber}`);

        } catch(err) {
          console.log(err, "failed on review portion")
          try {
            channel = interaction.guild.channels.cache.find(channel => channel.name == `closed-${submissionNumber}`);
  
          } catch(err) {
            console.log(err, "failed. crit")
          }
        }
        
        
        
        //console.log(ticketChannel, `review-${submissionNumber}`)
        const reviewInDB = await ReviewHistory.findOne({
            where:{
                id:submissionNumber
            },
            order: [['CreatedAt', 'DESC']]})

        if(reviewInDB.dataValues.reviewLink == null) {
          await completeSubmissionEmbed(reviewInDB.dataValues.id)
          return
        }


        await reviewInDB.update({
            status:"Completed",
            completedBy:interaction.user.id,
            completedAt: Date.now(),
            reviewLink:reviewlink
        })
        let submissionPos = reviewInDB.dataValues.id
        const forSpread = [
          {
            "range": `O${submissionPos}`, // Status
            "values": [
              [
                reviewInDB.dataValues.status
              ]
            ]
          },
          {
            "range": `S${submissionPos}`,
            "values": [
              [
                reviewInDB.dataValues.completedAt //completed at
              ]
            ]
          },
          {
            "range": `T${submissionPos}`,
            "values": [
              [
                reviewInDB.dataValues.reviewLink // Review Link
              ]
            ]
          }
        ]
        await main(forSpread)
        //await interaction.user.send(`Name your clip \`${reviewInDB.dataValues.id}\`, then send it to : https://link`)
        
        //await interaction.message.reply({content:`Completed ${interaction.message.embeds[0].author.name}`})
        
        await interaction.reply({content:"Good job", ephemeral:true})
        await interaction.channel.delete()
        //console.log(await interaction.message.embeds[0].author.name.match(/\d{18}/))
        
        // do your stuff
    },
};
