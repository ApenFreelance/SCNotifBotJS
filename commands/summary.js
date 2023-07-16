const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ValReviewHistory = require('../models/ValReviewHistory');
const ReviewHistory = require('../models/ReviewHistory');
const { Op } = require('sequelize');



const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('submitreview')
					.setLabel('Submit review')
					.setStyle("Success"),
			);


module.exports = {
    data: new SlashCommandBuilder()
        .setName('summary')
        .setDescription('Summary of all completed reviews')
        .addIntegerOption(option =>
            option
            .setName('weeks')
            .setDescription('how many weeks from now to include'))
        .addUserOption(option =>
            option
            .setName('coach')
            .setDescription('This will give the info about this coaches tickets'))
        .addIntegerOption(option =>
            option
            .setName('ticket')
            .setDescription('Returns a singular ticket')),
                    
    async execute(interaction) {
        let weeks = interaction.options.getInteger('weeks');
        let coach = interaction.options.getUser('coach');
        let ticket = interaction.options.getInteger('ticket');
        let database
        if(interaction.guild.id == "1024961321768329246") { // Valorant (DEV NOW)
            database = ValReviewHistory
        } 
        if(interaction.guild.id == "294958471953252353") { // WoW
            database = ReviewHistory
        }
        
        if(database == undefined) {
            await interaction.reply("This server is not recorded")
            return
        }
        await createDatabaseRequest(database, weeks, coach.id)
        createOverviewEmbed(reviewSelection.map(result => result.get({plain:true})))

    },
};


function createOverviewEmbed(reviewSelection) {

}

async function createDatabaseRequest(database, weeks, coach) {
    let whereArgs = {}
    if(weeks !== null) {
        const currentDate = new Date();
        const fromWeeks = new Date(currentDate)
        fromWeeks.setDate(fromWeeks.getDate() - (weeks * 7))
        whereArgs["createdAt"] = {
            [Op.between] : [fromWeeks , currentDate ]
        }
    }
    if(coach !== null){
        whereArgs["claimedByID"] = coach
    }-
    
    console.log(whereArgs)
    const reviewSelection = await database.findAll({
        where: {
            [Op.and]: whereArgs
        }
    })
    console.log(reviewSelection)
    

}