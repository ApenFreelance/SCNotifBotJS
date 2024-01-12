const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

function createReviewButtons(submissionNumber, game) {
    const reviewRow = new ActionRowBuilder();
    const buttonAmount = 5;
    for (let i = 1; i <= buttonAmount; i++) {
        const button = new ButtonBuilder()
            .setCustomId(`${game}reviewrating${i}-${submissionNumber}`)
            .setLabel(i.toString())
            .setStyle("Success");
        reviewRow.addComponents(button);
    }
    return [reviewRow];
}

function submitReviewButton(mode) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`submitreview-${mode}`)
            .setLabel("Submit review")
            .setStyle("Success")
    );
}
const waitingForReviewRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId("claimsubmission")
        .setLabel("Claim")
        .setStyle("Success"),
    new ButtonBuilder()
        .setCustomId("rejectsubmission")
        .setLabel("Reject")
        .setStyle("Danger")
);

module.exports = {
    createReviewButtons,
    submitReviewButton,
    waitingForReviewRow,
};
