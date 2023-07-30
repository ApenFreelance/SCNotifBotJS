const { EmbedBuilder } = require("discord.js");

async function createWaitingForReviewEmbed(interaction, reviewHistory, member, description) {
    const waitingForReviewEmbed = new EmbedBuilder()
        .setTitle(`Submission ${reviewHistory.id}`)
        .setAuthor({
        name: `${interaction.user.username} ( ${interaction.user.id} )`,
        iconURL: member.displayAvatarURL(true),
        })
        .setDescription(description);
    //.setThumbnail(charInfo.characterImage)
    //.setFooter({text:"This submission is unclaimed"})
    return waitingForReviewEmbed
}
async function createRatingEmbed(ratingNumber, ratingText, interaction) {
    const ratingEmbed = new EmbedBuilder()
        .setAuthor({name:`${interaction.user.username} (${interaction.user.id})`, iconURL:interaction.user.displayAvatarURL(true)})
        .setDescription(`${interaction.user.username} rated their review: ${ratingNumber}\n\n${ratingText}`)

    return ratingEmbed
}

module.exports = { createWaitingForReviewEmbed, createRatingEmbed };
