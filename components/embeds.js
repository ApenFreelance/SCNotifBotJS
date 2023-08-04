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

function createOverviewEmbed(counted, time, selectedReviews) {
    
    function formatCoachCount() {
        let formattedString = ""
        Object.entries(counted.perCoach).forEach(coach => {
            const [coachId, count] = coach  
            formattedString += `\n<@${coachId}> : ${count}`
        })
        return formattedString
    }
    function formatReviewSummaries() {
        for(const review of selectedReviews.reverse()) {
            let reviewRating = review.reviewRating == null ? "" : `\n> Rated: ${review.reviewRating}` 
            let reviewAddString = `\n\n**Review-${review.id}**\n> ${review.status}\n> <@${review.userID}> ${reviewRating}`
            console.log(review)
            if((description += reviewAddString).length > 4096) {
                description += "\n\n LIMIT REACHED"
                break
            }
        }  
    }
    let description = `**Review Count: ${counted.total}**\n${formatCoachCount()}\n\n`
    formatReviewSummaries()
    const overviewEmbed = new EmbedBuilder()
    .setTitle(`Summary: ${time.start} - ${time.end}`)
    .setDescription(description)

    return overviewEmbed
}







module.exports = { createWaitingForReviewEmbed, createRatingEmbed, createOverviewEmbed };
