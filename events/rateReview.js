const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
const { main } = require("../components/functions/googleApi");
const ReviewHistory = require("../models/ReviewHistory");


function createRatingModal(submissionNumber, ratingNumber) {
    const feedbackmodal = new ModalBuilder()
    .setCustomId(`reviewratingmodal${submissionNumber}`)
    .setTitle(`Feedback Modal`);

    const commentInput = new TextInputBuilder()
        .setCustomId("feedback")
        .setLabel("Tell us what you think?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)

    const ratingRow = new ActionRowBuilder().addComponents(commentInput)
    feedbackmodal.addComponents(ratingRow);
    return feedbackmodal
}






module.exports = {
    name: 'rateReview',
    once: false,
    async execute(interaction, type) {
        

        if(type == "modal") {
            //console.log(interaction)

            const submissionNumber = interaction.customId.replace("reviewratingmodal","")
            //console.log(interaction.fields.fields.get("feedback").value)
            const history = await ReviewHistory.findOne({
                where:{
                    id: submissionNumber
                }
            })
            await history.update({
                reviewRatingComment:interaction.fields.fields.get("feedback").value
                })
            await interaction.reply(`Set comment to\n\n\`\`\`\n ${interaction.fields.fields.get("feedback").value}\n\`\`\``)

        }
        if(type == "button") {
            let ratingNumber = interaction.customId.replace("rating","")
            let submissionNumber = ratingNumber.slice(2)
            ratingNumber = ratingNumber.replace(/(-\d+)/, "")

            createRatingModal(submissionNumber)
            console.log(submissionNumber)
            const history = await ReviewHistory.findOne({
                where:{
                    id: submissionNumber
                }
            })
            await history.update({
                reviewRating:parseInt(ratingNumber)
                
            })
            let submissionPos = history.dataValues.id
            const forSpread = [
                {
                  "range": `H${submissionPos}`, //Rating number
                  "values": [
                    [
                      history.dataValues.reviewRating
                    ]
                  ]
                },
                {
                  "range": `I${submissionPos}`, // Rating Comment
                  "values": [
                    [
                      history.dataValues.reviewRatingComment
                    ]
                  ]
                }
              ]
            await main(forSpread)
            await interaction.showModal(createRatingModal(submissionNumber, ratingNumber))
            await interaction.user.send(`Set the rating to ${ratingNumber}`)
        }

       
        //console.log(await interaction.message.embeds[0].author.name.match(/\d{18}/))
        
        // do your stuff
    },
};
