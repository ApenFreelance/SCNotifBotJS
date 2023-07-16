const { EmbedBuilder, ButtonBuilder, PermissionsBitField, ActionRowBuilder } = require("discord.js");
const { createValWaitingForReviewMessage } = require("../components/actionRowComponents/createWaitingForReview");

const ValReviewHistory = require("../models/ValReviewHistory");
const { cLog } = require("../components/functions/cLog");
const categoryId = "1085409586997108746"



module.exports = {
    name: 'claimValReview',
    once: false,
    async execute(interaction) {    
        const submissionNumber = interaction.message.embeds[0].title.replace("Submission ", "")
        const reviewHistory = await ValReviewHistory.findOne({
            where:{
                id:submissionNumber
            }}).catch(err => console.log(err))
        
        await reviewHistory.update({
                status:"Claimed",
                claimedByID:interaction.user.id,
                claimedByTag:interaction.user.tag,
                claimedAt:Date.now()
            })
        const lockRow = new ActionRowBuilder()
            .addComponents(
            new ButtonBuilder()
                .setLabel('Close')
                .setEmoji("🔒")
                .setStyle("Secondary")
                .setCustomId(`closesubmission-${submissionNumber}`))
            //console.log(reviewHistory.claimedAt, reviewHistory.dataValues.claimedAt, "THESE AER BOTH")
            
        
        let newChannel
        try {
          newChannel = await interaction.guild.channels.create({
            parent:categoryId,
            name:`review-${submissionNumber}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // everyone in server (not admin)
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: reviewHistory.userID, // Ticket owner
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: process.env.clientId, // Bot
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                  id: interaction.user.id, // One that claimed
                  allow: [PermissionsBitField.Flags.ViewChannel],
              },
            ],
            
        })
        } catch(err) {
          cLog([err.name +" "+ err.message], {subProcess:"ClaimValReview", guild:interaction.guild})
          await interaction.reply({content:`Failed to create channel: \`${err.name} ${err.message}\``, ephemeral:true})
          return
        }
        
        await interaction.reply({content:"Submission Claimed", ephemeral:true})
        cLog([`Submission ${submissionNumber} claimed`], {subProcess:"ClaimValReview", guild:interaction.guild})
        const presetMessage = `<@${interaction.user.id}>\u00A0<@${reviewHistory.dataValues.userID}> Welcome to your VoD review channel.\nYour <@&932795289943826483> will respond with your uploaded review ASAP.\n\nTo close this ticket, react with 🔒`


        await newChannel.send({content:presetMessage,embeds:[interaction.message.embeds[0]], components:[lockRow]})
        const linkingButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                  .setLabel('I have done this')
                  .setStyle("Success")
                  .setCustomId(`clip-${submissionNumber}-review`))
        await interaction.message.delete()
        //await interaction.user.send({content:"Please upload your clipLink named as your ticket number: https://link", components:[linkingButton]})
        //await interaction.message.edit({embeds:updateEmbed(interaction.user, interaction.message.embeds[0].data), components:updateButtons(newChannel)})
       
    },
};
