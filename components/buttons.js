const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

function createReviewButtons(submissionNumber, game) {
  const reviewRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${game}rating1-${submissionNumber}`)
      .setLabel("1")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}rating2-${submissionNumber}`)
      .setLabel("2")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}rating3-${submissionNumber}`)
      .setLabel("3")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}rating4-${submissionNumber}`)
      .setLabel("4")
      .setStyle("Success"),
    new ButtonBuilder()
      .setCustomId(`${game}rating5-${submissionNumber}`)
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
