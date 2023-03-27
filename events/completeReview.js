const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { main } = require("../components/functions/googleApi");
const ReviewHistory = require("../models/ReviewHistory");

function createReviewButtons(submissionNumber) {
    const reviewRow = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
            .setCustomId(`rating1-${submissionNumber}`)
            .setLabel('1')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating2-${submissionNumber}`)
            .setLabel('2')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating3-${submissionNumber}`)
            .setLabel('3')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating4-${submissionNumber}`)
            .setLabel('4')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating5-${submissionNumber}`)
            .setLabel('5')
            .setStyle("Success")
        
        );
    return([reviewRow])
}


module.exports = {
    name: 'completeReview',
    once: false,
    async execute(interaction, ticketChannel) {   
        
        //const embedAuthor = interaction.message.embeds[0].author.name.match(/\d{18}/)
        //const user = await interaction.guild.members.fetch(embedAuthor[0])
        const submissionNumber = ticketChannel.name.replace("review-", "")

        //const channel = interaction.guild.channels.cache.find(channel => channel.name == `review-${submissionNumber}`);
        //console.log(ticketChannel, `review-${submissionNumber}`)
        const reviewInDB = await ReviewHistory.findOne({
            where:{
                id:submissionNumber
            }})

        await reviewInDB.update({
            status:"Completed",
            completedBy:interaction.user.id,
            completedAt: Date.now()
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
          }
        ]
        await main(forSpread)
        //await interaction.user.send(`Name your clip \`${reviewInDB.dataValues.id}\`, then send it to : https://link`)
        const user = await interaction.guild.members.fetch(reviewInDB.userID)
        //await interaction.message.reply({content:`Completed ${interaction.message.embeds[0].author.name}`})
        await user.send({content:"Your review has been completed.\n\n\nHow would you rate this review?", components:createReviewButtons(submissionNumber)}).catch(err => {
        if(err.rawError.message == "Cannot send messages to this user") {
            interaction.channel.send(`${interaction.message.embeds[0].author.name} ( review-${submissionNumber} ) most likely has their DM's off and could not be reached. Therefor channel has not been deleted.`)
            return
        }
        else {
            interaction.channel.send(`Unknown error when rejecting ${interaction.message.embeds[0].author.name} ( review-${submissionNumber} ), therefor channel has not been deleted.`)
            return
        }
        
        })

        await ticketChannel.delete()
        //console.log(await interaction.message.embeds[0].author.name.match(/\d{18}/))
        
        // do your stuff
    },
};
