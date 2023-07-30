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


module.exports = { createWaitingForReviewEmbed };
