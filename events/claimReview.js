const { ButtonBuilder, PermissionsBitField, ActionRowBuilder } = require("discord.js");
const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi");
const { getCorrectTable } = require("../src/db");
const { cLog } = require("../components/functions/cLog");






module.exports = {
    name: 'claimReview',
    once: false,
    async execute(interaction, server) {    
        const submissionNumber = interaction.message.embeds[0].title.replace("Submission ", "")
        const reviewHistory = await getCorrectTable(interaction.guildId, "reviewHistory").then((table) => {
          return table.findOne({
            where:{
                id:submissionNumber
            }}).catch(err => console.log(err))
          })
        await reviewHistory.update({
          status:"Claimed",
          claimedByID:interaction.user.id,
          claimedByTag:interaction.user.username,
          claimedAt:Date.now()
        })
        const lockRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel('Close')
                .setEmoji("🔒")
                .setStyle("Secondary")
                .setCustomId(`closesubmission-${submissionNumber}`))
        let submissionPos = reviewHistory.dataValues.id
        if(server.serverName == "WoW"){ // update google sheet
          await updateGoogleSheet(createSheetBody(submissionPos, {status:reviewHistory.status, claimedDate:reviewHistory.claimedAt, claimedByID:reviewHistory.claimedByID, claimedByUsername:reviewHistory.claimedByTag}))
        }
       let newChannel
        let parentCategory = server.reviewCategoryId
        try {
          newChannel = await interaction.guild.channels.create({
            parent:parentCategory,
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
                    id: interaction.client.user.id, // Bot
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
                },
                {
                  id: interaction.user.id, // One that claimed
                  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
              },
            ],
            
        })
        await interaction.reply({content:"Submission Claimed", ephemeral:true})
        cLog([`Submission ${submissionNumber} claimed`], {subProcess:"ClaimValReview", guild:interaction.guild})
        } catch(err) {
          cLog([err.name +" "+ err.message], {subProcess:"ClaimValReview", guild:interaction.guild})
          try {
            newChannel = await interaction.guild.channels.create({
              parent:parentCategory,
              name:`review-${submissionNumber}`,
              permissionOverwrites: [
                  {
                      id: interaction.guild.id, // everyone in server (not admin)
                      deny: [PermissionsBitField.Flags.ViewChannel],
                  },
                  {
                      id: interaction.client.user.id, // Bot
                      allow: [PermissionsBitField.Flags.ViewChannel],
                  },
                  {
                    id: interaction.user.id, // One that claimed
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
              ],
              
          })
          try {
            await newChannel.permissionOverwrites.edit(reviewHistory.userID, { ViewChannel: true });
            await interaction.reply({content:"Submission Claimed and user was added after failing once!", ephemeral:true})
          } catch(err) {
            await interaction.reply({content:"Submission Claimed, but user was not added!", ephemeral:true})
          }
          } catch(err){
            console.log(err)
            await interaction.reply({content:"Failed to create channel twice", ephemeral:true})
            return
          }
          
        }
        
        let presetMessage = "UNKNOWN SERVER"
        if(server.serverName == "WoW") {
          presetMessage = `<@${interaction.user.id}>\u00A0<@${reviewHistory.userID}> Welcome to your VoD review channel.\nYour <@&970784560914788352> will respond with your uploaded review ASAP.\n\nTo close this ticket, react with 🔒`
        }
        if(server.serverName == "Valorant") {
          presetMessage = `<@${interaction.user.id}>\u00A0<@${reviewHistory.userID}> Welcome to your VoD review channel.\nYour <@&932795289943826483> will respond with your uploaded review ASAP.\n\nTo close this ticket, react with 🔒`
        }
        await newChannel.send({content:presetMessage,embeds:[interaction.message.embeds[0]], components:[lockRow]})
        await interaction.message.delete()
    },
};
