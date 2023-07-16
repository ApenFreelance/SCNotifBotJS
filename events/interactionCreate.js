
const { SlashCommandBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ModalBuilder,Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder } = require('discord.js');

const axios = require('axios');
const bot = require('../src/botMain');
//const { main } = require('../components/functions/googleApi');
const ReviewHistory = require('../models/ReviewHistory');
const ValReviewHistory = require('../models/ValReviewHistory');
const { cLog } = require('../components/functions/cLog');
require("dotenv").config({path: '../.env'});


const cm = new ModalBuilder()
  .setCustomId('completesubmission')
  .setTitle('Close submission');
    const closeInput = new TextInputBuilder()
    .setCustomId('reviewlink')
    .setLabel("REVIEW LINK:")
    .setStyle(TextInputStyle.Short);
    const closeRow = new ActionRowBuilder().addComponents(closeInput);

cm.addComponents(closeRow);

const submissionModal = new ModalBuilder()
  .setCustomId('submissionmodal')
  .setTitle('Submission Modal');
    const ytInput = new TextInputBuilder()
    .setCustomId('ytlink')
    .setLabel("UNLISTED YOUTUBE LINK:")
    .setStyle(TextInputStyle.Short);
    const armoryInput = new TextInputBuilder()
      .setCustomId('armory')    
      .setLabel("ARMORY LINK:") 
      .setPlaceholder('https://worldofwarcraft.blizzard.com/en-gb/character/eu/ravencrest/mýstíc')
      .setStyle(TextInputStyle.Short);
    const emailInput = new TextInputBuilder()
      .setCustomId('email')
      .setLabel("SKILL-CAPPED EMAIL:")
      .setStyle(TextInputStyle.Short);
    const improvementInput = new TextInputBuilder()
      .setCustomId('improvementinput')
      .setLabel("What are you looking to focus on and improve?")
      .setStyle(TextInputStyle.Paragraph);
    
  const ytRow = new ActionRowBuilder().addComponents(ytInput);
  const submissionRow = new ActionRowBuilder().addComponents(armoryInput);
  const emailRow = new ActionRowBuilder().addComponents(emailInput);
  const improvementRow = new ActionRowBuilder().addComponents(improvementInput);

  submissionModal.addComponents(ytRow, submissionRow, emailRow, improvementRow);

const valSubmissionModal =new ModalBuilder()
.setCustomId('submissionmodal')
.setTitle('Submission Modal');
const trackerInput = new TextInputBuilder()
      .setCustomId('tracker')    
      .setLabel("TRACKER.GG LINK:") 
      .setPlaceholder('https://tracker.gg/valorant/profile/riot/ApenJulius1%23EUW/overview')
      .setStyle(TextInputStyle.Short);
      const trackerRow = new ActionRowBuilder().addComponents(trackerInput);
valSubmissionModal.addComponents(ytRow, trackerRow, emailRow, improvementRow)



const regexTemplateFullLink = /(https):\/\/((worldofwarcraft\.blizzard\.com||worldofwarcraft\.com)\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/.+)/
const regexValFullLink = /(https):\/\/(tracker\.gg\/valorant\/profile\/riot)\/.+/
module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
      try {
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.execute(interaction);
               return
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: `${error}`, ephemeral: true });
                return
            }
        }
    }

    if(interaction.guildId == process.env.valServerId) {// VAL SERVER ID 
      if(interaction.customId == "submitreview") {
        if (!interaction.member.roles.cache.some(role => role.name === '💎・Infinity+'|| role.name === '🌸・Server Booster')) {
          await interaction.reply({content:"You need to be 💎・Infinity+ or 🌸・Server Booster", ephemeral:true})
          return
        }
        await interaction.showModal(valSubmissionModal);
      }
      if(interaction.customId == "submissionmodal") {
        await interaction.reply({content:"Processing...", ephemeral:true})
        
        const email = interaction.fields.getTextInputValue("email")
        const track = interaction.fields.getTextInputValue("tracker")
        if(regexValFullLink.test(track)) {
          bot.emit("submitValReview", interaction)
        }
        else {
          await interaction.editReply({content:"This link is not valid.\n\nThink this is a mistake? Let us know", ephemeral:true})
        }
      }
      if(interaction.customId == "claimsubmission") {
        bot.emit("claimValReview", interaction)
      }
      if(interaction.customId == "rejectsubmission") {
        bot.emit("rejectValReview", interaction)
      }
      if(interaction.customId.startsWith("closesubmission-")) {
        bot.emit("closeSubmission", interaction)
      }
      if(interaction.customId.startsWith("delete-")) {
        bot.emit("completeValReview", interaction)
      }
      if(interaction.customId.startsWith("completesubmission")) {
        let reviewlink = interaction.fields.getTextInputValue("reviewlink")
        cLog(["Review nr: ",interaction.customId.replace("completesubmission-", "")], {guild:interaction.guild, subProcess:"setReviewLink"})
        const h = await ValReviewHistory.findOne({
          where: {
            id:interaction.customId.replace("completesubmission-", "")
          }
        })
        await h.update({
          reviewLink:reviewlink
        })
        await interaction.reply({content:"Updated the review link to "+ reviewlink, ephemeral:true})
      }
      return
    }
    if(/^valrating\d-\d+/.test(interaction.customId) ) {
      bot.emit("rateValReview", interaction, "button")
      return
    }
    if(interaction.customId.startsWith("valreviewratingmodal")) {
      bot.emit("rateValReview", interaction, "modal")
      return
    }
    // WOW server stuff
        if(interaction.customId == "submissionmodal") {
        await interaction.reply({content:"Processing...", ephemeral:true})
        const email = interaction.fields.getTextInputValue("email")
        const arm = interaction.fields.getTextInputValue("armory")
        
        console.log(interaction.fields.fields.get("armory").value, email, regexTemplateFullLink.test(arm))
        if(regexTemplateFullLink.test(arm)) {
          bot.emit("submitReview", interaction)
          
        }
        else {
          await interaction.editReply({content:"This link is not valid.\n\nThink this is a mistake? Let us know", ephemeral:true})
        }
      }


      try {
        if(interaction.customId == "submitreview") {
          await interaction.showModal(submissionModal);
        }
        if(interaction.customId == "claimsubmission") {
          bot.emit("claimReview", interaction)
        }
        if(interaction.customId == "rejectsubmission") {
          bot.emit("rejectReview", interaction)
        }
         if(interaction.customId.startsWith("completesubmission")) {
          
          let reviewlink = interaction.fields.getTextInputValue("reviewlink")
          console.log(reviewlink, interaction.customId.replace("completesubmission-", ""))

          const h = await ReviewHistory.findOne({
            where: {
              id:interaction.customId.replace("completesubmission-", "")
            }
          })
          await h.update({
            reviewLink:reviewlink
          })
          const forSpread = [
            {
            "range": `T${interaction.customId.replace("completesubmission-", "")}`, //Review link
            "values": [
                [
                reviewlink
                ]
            ]
            }
        ]

          await main(forSpread)
          await interaction.reply({content:"Updated the review link", ephemeral:true})
        }
        if(/^rating\d-\d+/.test(interaction.customId)) {
          bot.emit("rateReview", interaction, "button")
        }
        if(interaction.customId.startsWith("delete-")) {
          bot.emit("completeReview", interaction)
        }
        if(interaction.customId.startsWith("closesubmission-")) {
          bot.emit("closeSubmission", interaction)
        }
        if(interaction.customId.startsWith("open-")) {
          bot.emit("openReview", interaction)
        }
        if(interaction.customId.startsWith("reviewratingmodal")) {
          bot.emit("rateReview", interaction, "modal")
        }
        if(interaction.customId.startsWith("clip-")) {
          bot.emit("mediaCollection", interaction)
        }
      

      } catch (err) {
        if(err.toString().startsWith("TypeError: Cannot read properties of undefined (reading 'startsWith')")) {
          console.log("Not review related")
        } else {
          await interaction.editReply({content:"Something went wrong, please contact staff", ephemeral:true})
          console.log(err) }
      }
    

        
    } catch (err) {
      console.log("Failed somewhere during interaction : ", err, interaction.user.tag)
      await interaction.editReply({content:"Something went wrong, please contact staff", ephemeral:true})
    }} }
    
    
