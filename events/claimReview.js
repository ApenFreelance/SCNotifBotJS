const { EmbedBuilder, ButtonBuilder, PermissionsBitField, ActionRowBuilder } = require("discord.js");
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
console.log(updatedEmbed)
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
                claimedBy:interaction.user.id,
                claimedAt:Date.now()
            })
        
        await interaction.reply({content:"Submission Claimed", ephemeral:true})
        const newChannel = await interaction.guild.channels.create({
            parent:categoryId,
            name:`review-${submissionNumber}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: reviewHistory.userID,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: "1020404504430133269",
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
            ],
            
        }).catch(err => interaction.reply(err))
        await interaction.message.edit({embeds:updateEmbed(interaction.user, interaction.message.embeds[0].data), components:updateButtons(newChannel)})
       
        // do your stuff
    },
};
