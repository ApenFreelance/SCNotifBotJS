const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

function createReviewButtons(submissionNumber) {
    const reviewRow = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
            .setCustomId(`rating1-${submissionNumber}`)
            .setLabel('1')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating2-${submissionNumber}`)
            .setLabel('2')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating3-${submissionNumber}`)
            .setLabel('3')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating4-${submissionNumber}`)
            .setLabel('4')
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`rating5-${submissionNumber}`)
            .setLabel('5')
            .setStyle("Success")
        
        );
    return([reviewRow])
}
module.exports = {createReviewButtons}