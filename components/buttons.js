const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

function createReviewButtons(submissionNumber, game, mode = null) {
    const reviewRow = new ActionRowBuilder();
    const buttonAmount = 5;
    for (let i = 1; i <= buttonAmount; i++) {
        const button = new ButtonBuilder()
            .setCustomId(`${game}-reviewrating-${i}-${submissionNumber}${mode == null ? "" : "-" + mode}`)
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
function waitingForReviewRow(mode) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId(`claimsubmission-${mode}`)
        .setLabel("Claim")
        .setStyle("Success"),
    new ButtonBuilder()
        .setCustomId(`rejectsubmission-${mode}`)
        .setLabel("Reject")
        .setStyle("Danger")
    );
}


module.exports = {
    createReviewButtons,
    submitReviewButton,
    waitingForReviewRow,
};
