
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder } = require("discord.js");

const ValReviewHistory = require("../models/ValReviewHistory");
const { cLog } = require("../components/functions/cLog");


function createValRatingModal(submissionNumber, ratingNumber) {
    const feedbackmodal = new ModalBuilder()
    .setCustomId(`valreviewratingmodal${submissionNumber}`)
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


const c = "1125965279491543081"




module.exports = {
    name: 'rateValReview',
    once: false,
    async execute(interaction, type) {
        

        if(type == "modal") {
            //console.log(interaction)
            
            const submissionNumber = interaction.customId.replace("valreviewratingmodal","")
            //console.log(interaction.fields.fields.get("feedback").value)¨
            
            const history = await ValReviewHistory.findOne({
                where:{
                    id: submissionNumber
                }
            })
            
            await history.update({
                reviewRatingComment:interaction.fields.fields.get("feedback").value
                })
                const waiti = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.tag} ( ${interaction.user.id} )`, iconURL: interaction.user.displayAvatarURL(true)})
                .setDescription(`${interaction.user.tag} rated their review: ${history.reviewRating}\n\n${interaction.fields.fields.get("feedback").value}`)
                //.setThumbnail(charInfo.characterImage)
                //.setFooter({text:"This submission is unclaimed"})
                interaction.client.guilds.fetch("855206452771684382").then(e => e.channels.fetch(c).then(s => s.send({embeds:[waiti]})))
            await interaction.reply(`Set comment to\n\n\`\`\`\n ${interaction.fields.fields.get("feedback").value}\n\`\`\``)
            cLog(["Text review given for: " + submissionNumber], {subProcess:"ReviewValRating"})

        }
        if(type == "button") {
            let ratingNumber = interaction.customId.replace("valrating","")
            let submissionNumber = ratingNumber.slice(2)
            ratingNumber = ratingNumber.replace(/(-\d+)/, "")

            createValRatingModal(submissionNumber, submissionNumber)
            cLog([interaction.user.username + " Rated: " + submissionNumber], {subProcess:"ReviewValRating"})
            const history = await ValReviewHistory.findOne({
                where:{
                    id: submissionNumber
                }
            })
            await history.update({
                reviewRating:parseInt(ratingNumber)
                
            })
            
            await interaction.showModal(createValRatingModal(submissionNumber, ratingNumber))
            await interaction.user.send(`Set the rating to ${ratingNumber}`)
        }

       
        //console.log(await interaction.message.embeds[0].author.name.match(/\d{18}/))
        
        // do your stuff
    },
};
