
const { TextInputBuilder, ModalBuilder, ActionRowBuilder } = require("discord.js");


const modal = new ModalBuilder()
    .setCustomId('submissionmodal')
    .setTitle('Submission Modal');

const armoryInput = new TextInputBuilder()
    .setCustomId('armory')
        
    .setLabel("Please link your armory.")
       
    .setStyle(TextInputStyle.Short);
   
const firstActionRow = new ActionRowBuilder().addComponents(armoryInput);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);