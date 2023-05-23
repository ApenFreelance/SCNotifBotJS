const { EmbedBuilder, ButtonBuilder, PermissionsBitField, ActionRowBuilder } = require("discord.js");
const { createWaitingForReviewMessage } = require("../components/functions/createWaitingForReview");
const { main } = require("../components/functions/googleApi");
const ReviewHistory = require("../models/ReviewHistory");
const categoryId = "1089996542087278682"
function updateEmbed(user, embed) {
    console.log(embed)
    const updatedEmbed = new EmbedBuilder()
    .setTitle(embed.title)
    .setAuthor({name:embed.author.name, iconURL:embed.author.icon_url})
    .setDescription(embed.description)
    .setImage(embed.image.url)
    .setFooter({text:`This submission is claimed by: ${user.tag}`, iconURL:user.displayAvatarURL(true)})
//console.log(updatedEmbed)
return([updatedEmbed])
}
function updateButtons(channel) {
    const linkingButton = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
            .setLabel('Go to channel')
            .setURL(channel.url)
            .setStyle("Link"),
        new ButtonBuilder()
            .setCustomId('completesubmission')
            .setLabel('Complete')
            .setStyle("Success")
        );
    return([linkingButton])
}




module.exports = {
    name: 'claimReview',
    once: false,
    async execute(interaction) {    
        const submissionNumber = interaction.message.embeds[0].title.replace("Submission ", "")
        const reviewHistory = await ReviewHistory.findOne({
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
            let submissionPos = reviewHistory.dataValues.id
        const forSpread = [
                {
                  "range": `O${submissionPos}`, //Status 
                  "values": [
                    [
                      reviewHistory.dataValues.status
                    ]
                  ]
                },


                {
                  "range": `P${submissionPos}`, // Claimed At
                  "values": [
                    [
                      reviewHistory.dataValues.claimedAt
                    ]
                  ]
                },
                {
                    "range": `Q${submissionPos}`, //Claimed by ID
                    "values": [
                      [
                        reviewHistory.dataValues.claimedByID
                      ]
                    ]
                  },
                  {
                    "range": `R${submissionPos}`, //Claimed by Tag
                    "values": [
                      [
                        reviewHistory.dataValues.claimedByTag
                      ]
                    ]
                  }
              ]
              await main(forSpread)
        let newChannel
        try {
          console.log(interaction.guild.id, reviewHistory.userID, interaction.user.id)
          newChannel = await interaction.guild.channels.create({
            parent:categoryId,
            name:`review-${submissionNumber}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // everyone in server (not admin)
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: reviewHistory.dataValues.userID, // Ticket owner
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: "1020404504430133269", // Bot
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
                },
                {
                  id: interaction.user.id, // One that claimed
                  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
              },
            ],
            
        })
        await interaction.reply({content:"Submission Claimed", ephemeral:true})
        } catch(err) {
          console.log(err)
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
                      id: "1020404504430133269", // Bot
                      allow: [PermissionsBitField.Flags.ViewChannel],
                  },
                  {
                    id: interaction.user.id, // One that claimed
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
              ],
              
          })
          try {
            await newChannel.permissionOverwrites.edit(reviewHistory.dataValues.userID, { ViewChannel: true });
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
        
        
        
        const presetMessage = `<@${interaction.user.id}>\u00A0<@${reviewHistory.dataValues.userID}> Welcome to your VoD review channel.\nYour <@&970784560914788352> will respond with your uploaded review ASAP.\n\nTo close this ticket, react with 🔒`


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
       
        // do your stuff
    },
};
