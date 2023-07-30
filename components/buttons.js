const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

function createReviewButtons(submissionNumber, game) {
  const reviewRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${game}reviewrating1-${submissionNumber}`)
      .setLabel("1")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}reviewrating2-${submissionNumber}`)
      .setLabel("2")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}reviewrating3-${submissionNumber}`)
      .setLabel("3")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}reviewrating4-${submissionNumber}`)
      .setLabel("4")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}reviewrating5-${submissionNumber}`)
      .setLabel("5")
      .setStyle("Success")
  );
  return [reviewRow];
}
const submitReviewButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("submitreview")
    .setLabel("Submit review")
    .setStyle("Success")
);

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

module.exports = { createReviewButtons, submitReviewButton, waitingForReviewRow };
