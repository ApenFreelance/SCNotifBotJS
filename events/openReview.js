const { main } = require("../components/functions/googleApi");
const ReviewHistory = require("../models/ReviewHistory");



module.exports = {
    name: 'openReview',
    once: false,
    async execute(interaction) {

        const submissionNumber = interaction.channel.name.replace("closed-", "")
        console.log(submissionNumber, "ioen") 
        const reviewInDB = await ReviewHistory.findOne({
            where:{
                id:submissionNumber
            },
            order: [['CreatedAt', 'DESC']]
        })

        await reviewInDB.update({
            status: "Open"
        })
        
        await interaction.channel.permissionOverwrites.create(reviewInDB.dataValues.userID, {
            "ViewChannel":true
        })
        
        await interaction.reply({content:"Ticket re-opened", ephemeral:true})
        await interaction.message.delete()
        await interaction.channel.edit({name: `review-${submissionNumber}`})
        .then(channel => console.log(channel.permissionOverwrites.cache.get(interaction.user.id)))
        .catch(e => console.log(e));
        let submissionPos = reviewInDB.dataValues.id
        const forSpread = [
            {
              "range": `O${submissionPos}`, // Status
              "values": [
                [
                  reviewInDB.dataValues.status
                ]
              ] }]

        await main(forSpread)
        
        // do your stuff
    },
};
