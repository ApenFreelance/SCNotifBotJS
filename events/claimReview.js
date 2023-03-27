const { EmbedBuilder, ButtonBuilder, PermissionsBitField, ActionRowBuilder } = require("discord.js");
const { main } = require("../components/functions/googleApi");
const ReviewHistory = require("../models/ReviewHistory");
const categoryId = "1085409586997108746"
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
            console.log(reviewHistory.claimedAt, reviewHistory.dataValues.claimedAt, "THESE AER BOTH")
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
        
        await interaction.reply({content:"Submission Claimed", ephemeral:true})
        const newChannel = await interaction.guild.channels.create({
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
                    id: "1020404504430133269", // Bot
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
            ],
            
        }).catch(err => interaction.editReply({content:err, ephemeral:true}))
        
        await interaction.message.delete()
        await newChannel.send({content:"Please upload your clipLink named as your ticket number: https://link"})
        //await interaction.message.edit({embeds:updateEmbed(interaction.user, interaction.message.embeds[0].data), components:updateButtons(newChannel)})
       
        // do your stuff
    },
};
