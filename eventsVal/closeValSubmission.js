const { ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { createReviewButtons } = require("../components/functions/createReviewButtons");
const ValReviewHistory = require("../models/ValReviewHistory");
const { cLog } = require("../components/functions/cLog");






module.exports = {
    name: 'closeValSubmission',
    once: false,
    async execute(interaction) {   
        const submissionNr = interaction.customId.replace("closesubmission-", "") 
        cLog([`Closed review: ${submissionNr}`], {guild:interaction.guild, subProcess:"CloseValReview"})
        
        const lastRow = new ActionRowBuilder()
        .addComponents(
            /* new ButtonBuilder()
                .setCustomId(`open-${submissionNr}`)
                .setLabel('Open')
                .setStyle("Success"), */
            new ButtonBuilder()
                .setCustomId(`delete-${submissionNr}`)
                .setLabel('Delete')
                .setStyle("Danger"))

        const reviewInDB = await ValReviewHistory.findOne({
            where:{
                id:submissionNr
            },
            order: [['CreatedAt', 'DESC']]
        })

        await interaction.channel.permissionOverwrites.delete(reviewInDB.dataValues.userID).catch(e => cLog([e.name + " " + e.message], {guild:interaction.guild})); 
        await interaction.reply({content:"Review closed!",components:[lastRow]})
        await interaction.channel.edit({name: `closed-${submissionNr}`})
    
        //console.log(reviewInDB)
        


        
        //console.log(interaction.channel)
        await reviewInDB.update({
            status:"Closed"
        })
        const user = await interaction.guild.members.fetch(reviewInDB.dataValues.userID)

        await user.send({content:"Your review has been completed.\n\n\nHow would you rate this review?", components:createReviewButtons(submissionNr, "val")}).catch(err => {
            if(err.rawError.message == "Cannot send messages to this user") {
                cLog(["Cannot send messages to this user", {guild:interaction.guild, subProcess:"Close Review"}])
                interaction.channel.send(`${interaction.message.embeds[0].author.name} ( review-${submissionNr} ) most likely has their DM's off and could not be reached. Therefor channel has not been deleted.`)
                return
            }
            else {
                cLog(["Failed when messaging user", {guild:interaction.guild, subProcess:"Close Review"}])
                interaction.channel.send(`Unknown error when rejecting ${interaction.message.embeds[0].author.name} ( review-${submissionNr} ), therefor channel has not been deleted.`)
                return
            }
            
            })

    },
};
