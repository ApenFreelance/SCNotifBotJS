const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
async function completeSubmissionEmbed (submissionModal) {
    const cm = new ModalBuilder()
    .setCustomId(`completesubmission-${usb}`)
    .setTitle('Close submission');
        const closeInput = new TextInputBuilder()
        .setCustomId('reviewlink')
        .setLabel("REVIEW LINK:")
        .setStyle(TextInputStyle.Short);
        const closeRow = new ActionRowBuilder().addComponents(closeInput);

    cm.addComponents(closeRow);
 
}

module.exports = { completeSubmissionEmbed }