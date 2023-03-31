const { SlashCommandBuilder } = require("discord.js");
const { main } = require("../components/functions/googleApi");



module.exports = {
    data: new SlashCommandBuilder()
        .setName('setreviewlink')
        .setDescription('Set the reviewLink')
        .addStringOption(option =>
            option
            .setName('reviewlink')
            .setDescription('Set the link to the review')
            .setRequired(true)),
                    
    async execute(interaction) {
        try {
            let reviewLink = interaction.options.getString('reviewlink');
            if(!interaction.channel.name.startsWith("review-") && !interaction.channel.name.startsWith("closed-")) {
                await interaction.reply({content:"This command is only allowed in tickets", ephemeral:true})
                return
            }
            
            
            let submissionPos = interaction.channel.name.replace("closed-", "").replace("review-", "")
           
            
            const forSpread = [
                {
                "range": `T${submissionPos}`, //Rating number
                "values": [
                    [
                    reviewLink
                    ]
                ]
                }
            ]

            await main(forSpread)
            await interaction.reply({content:`Review Link set to ${reviewLink}`})
        } catch (err) {
            console.log(err)
            await interaction.reply({content:"Something went wrong when setting review link. Contact Staff", ephemeral:true})
        }
        
        
    },
};
