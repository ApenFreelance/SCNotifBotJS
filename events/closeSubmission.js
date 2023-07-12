const { ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { createReviewButtons } = require("../components/functions/createReviewButtons");
const ReviewHistory = require("../models/ReviewHistory");
const { updateClosedReviewDB } = require("../components/functions/databaseFunctions/updateValue");
const { cLog } = require("../components/functions/cLog")





module.exports = {
    name: 'closeSubmission',
    once: false,
    async execute(interaction) {   
        const submissionNr = interaction.customId.replace("closesubmission-", "") 
        console.log(submissionNr, "s")
        
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

        const reviewInDB = await ReviewHistory.findOne({
            where:{
                id:submissionNr
            },
            order: [['CreatedAt', 'DESC']]
        })

        await interaction.channel.permissionOverwrites.delete(reviewInDB.dataValues.userID).catch(e => {
            cLog([`ERROR(${submissionNr}): `, e], {guild:interaction.guild.id, subProcess:"Remove User"})
        }); 
        await interaction.reply({content:"Review closed!",components:[lastRow]})
        await interaction.channel.edit({name: `closed-${submissionNr}`})
        cLog(["Channel updated"], {guild:interaction.guild.id, subProcess:"Close Submission"})
        await updateClosedReviewDB(reviewInDB, interaction.user.id, interaction.user.username, interaction.guild.id, submissionNr)
        const user = await interaction.guild.members.fetch(reviewInDB.dataValues.userID)

        await user.send({content:"Your review has been completed.\n\n\nHow would you rate this review?", components:createReviewButtons(submissionNr, "")}).catch(err => {
            if(err.rawError.message == "Cannot send messages to this user") {
                interaction.channel.send(`${interaction.message.embeds[0].author.name} ( review-${submissionNr} ) most likely has their DM's off and could not be reached. Therefor channel has not been deleted.`)
                cLog([`${interaction.message.embeds[0].author.name} ( review-${submissionNr} ) most likely has their DM's off and could not be reached`], {guild:interaction.guild.id, subProcess:"Send Rate Request"})

                return
            }
            else {
                interaction.channel.send(`Unknown error when rejecting ${interaction.message.embeds[0].author.name} ( review-${submissionNr} ), therefor channel has not been deleted.`)
                cLog([`Unknown error when rejecting ${interaction.message.embeds[0].author.name} ( review-${submissionNr} )`], {guild:interaction.guild.id, subProcess:"Send Rate Request"})
                
                return
            }
        })
        cLog([`Success`], {guild:interaction.guild.id, subProcess:"Send Rate Request"})
    },
};
