const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
async function completeSubmissionEmbed (interaction, submissionModal) {
    const cm = new ModalBuilder()
    .setCustomId(`completesubmission-${submissionModal}`)
    .setTitle('Close submission');
        const closeInput = new TextInputBuilder()
        .setCustomId('reviewlink')
        .setLabel("REVIEW LINK:")
        .setStyle(TextInputStyle.Short);
        const closeRow = new ActionRowBuilder().addComponents(closeInput);

    cm.addComponents(closeRow);
    await interaction.showModal(cm);
    
 
}

module.exports = { completeSubmissionEmbed }