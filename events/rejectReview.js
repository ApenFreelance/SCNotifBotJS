const ReviewHistory = require("../models/ReviewHistory");

module.exports = {
    name: 'rejectReview',
    once: false,
    async execute(interaction) {    
        const embedAuthor = interaction.message.embeds[0].author.name.match(/\d{18}/)
        const user = await interaction.guild.members.fetch(embedAuthor[0])
        const submissionNumber = interaction.message.embeds[0].title.replace("Submission ", "")
        await user.send("Unfortunatly your submission has been rejected.").catch(err => {
            if(err.rawError.message == "Cannot send messages to this user") {
                interaction.channel.send(`${interaction.message.embeds[0].author.name} most likely has their DM's off and could not be reached.`)
            }
            else {
                interaction.channel.send(`Unknown error when rejecting ${interaction.message.embeds[0].author.name}`)
            }
        
        })
        const reviewInDB = await ReviewHistory.findOne({
            where:{
                id:submissionNumber
            }})

        await reviewInDB.update({
            status:"Rejected",
            completedBy:interaction.user.id,
            completedAt: Date.now()
        })
        await interaction.message.reply({content:`Rejected ${interaction.message.embeds[0].author.name}`})
        await interaction.message.delete()
        //console.log(await interaction.message.embeds[0].author.name.match(/\d{18}/))
        
        // do your stuff
    },
};
