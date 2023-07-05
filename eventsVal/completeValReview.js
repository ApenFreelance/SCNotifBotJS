const { ActionRowBuilder, ButtonBuilder, TextInputStyle, ModalBuilder, TextInputBuilder } = require("discord.js");

const ValReviewHistory = require("../models/ValReviewHistory");
const fs = require("fs")
const { createReviewButtons } = require("../components/functions/createReviewButtons");
const { checkIfHasReviewLink } = require("../components/functions/checkIfHasReviewLink");
const { completeSubmissionEmbed } = require("../components/modals/reviewLinkModal");
const { cLog } = require("../components/functions/cLog");
const { createTranscript, createHTMLfile, sendTranscript, addTranscriptToDB } = require("../components/functions/transcript");




module.exports = {
    name: 'completeValReview',
    once: false,
    async execute(interaction) { 
      let channel = null
        //const embedAuthor = interaction.message.embeds[0].author.name.match(/\d{18}/)
        //const user = await interaction.guild.members.fetch(embedAuthor[0])
        let submissionNumber
        try {
          submissionNumber = interaction.channel.name.replace("closed-", "").replace("review-", "")
        } catch(err) {
          console.log(err)
        }
        channel = interaction.guild.channels.cache.find(channel => channel.name == `review-${submissionNumber}`);

        if(typeof channel === "undefined") {
            channel = interaction.guild.channels.cache.find(channel => channel.name == `closed-${submissionNumber}`);
        }
        
        //console.log(ticketChannel, `review-${submissionNumber}`)
        const reviewInDB = await ValReviewHistory.findOne({
            where:{
                id:submissionNumber
            },
            order: [['CreatedAt', 'DESC']]})

        if(reviewInDB.reviewLink == null) {
          await completeSubmissionEmbed(interaction, reviewInDB.id)
          return
        }


        await reviewInDB.update({
            status:"Completed",
            completedBy:interaction.user.id,
            completedAt: Date.now()
        })
        
       
        //await interaction.user.send(`Name your clip \`${reviewInDB.dataValues.id}\`, then send it to : https://link`)
        
        //await interaction.message.reply({content:`Completed ${interaction.message.embeds[0].author.name}`})
        try {
          await createTranscript(channel, reviewInDB)
          .then(transcript => {
            addTranscriptToDB(reviewInDB, transcript)
            createHTMLfile(reviewInDB.dataValues, transcript)
            .then(filePath => {
              sendTranscript(filePath, "943971066177552455").then(filePath=> {
                fs.unlink(filePath, (err => {
                  if (err) console.log(err);
                  else{
                    cLog(["Succesfully deleted: "+ filePath], {guild:interaction.guild, subProcess:"Transcript"})
                  }
                }))
            })
            }
            )
          })
        }catch(err) {
            await interaction.reply({content:"Failed to create transcript: `"+ err+"`", ephemeral:true})
            cLog(["Failed at creating transcript for review: "+submissionNumber, err], {guild:interaction.guild, subProcess:"Transcript", oneLine:false})
            return
          }
        await interaction.reply({content:"Good job", ephemeral:true})
        await interaction.channel.delete()
        cLog(["Deleted channel for review: "+submissionNumber], {guild:interaction.guild, subProcess:"CompleteReview"})
        //console.log(await interaction.message.embeds[0].author.name.match(/\d{18}/))
        
        // do your stuff
    },
};
