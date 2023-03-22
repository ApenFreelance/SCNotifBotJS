
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');


const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('submitreview')
					.setLabel('Submit review')
					.setStyle("Success"),
			);


module.exports = {
    data: new SlashCommandBuilder()
        .setName('vodreview')
        .setDescription('Test Command for now'),
                    
    async execute(interaction) {
        await interaction.reply({content:"Temp message", components:[row]})
        
        
    },
};
