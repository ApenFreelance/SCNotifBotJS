
const { SlashCommandBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ModalBuilder,Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder } = require('discord.js');

const axios = require('axios');

const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');
const SCverifV2 = require('../models/SCVerifV2');
const bot = require('../src/botMain');


const submissionModal = new ModalBuilder()
.setCustomId('submissionmodal')
.setTitle('Submission Modal');

const armoryInput = new TextInputBuilder()
  .setCustomId('armory')    
  .setLabel("Please link your armory.") 
  .setStyle(TextInputStyle.Short);

const submissionRow = new ActionRowBuilder().addComponents(armoryInput);

submissionModal.addComponents(submissionRow);



async function verifyEmailExists(email) {
  console.log("Verifying Email")
  const response = await axios.post('https://www.skill-capped.com/lol/api/user/emailAvailable', { email: email })
 console.log(response)
  console.log("Result: ", response.data.available)
  return response.data.available
}


async function addToSCDB(userID, email, tag, interaction) {
  let track = true
  await SCverifV2.create({
    userID: userID,
    userEmail: email,
    userTag: tag}).catch(err=>{

      switch(err.errors[0].message) {
        case "userID must be unique":
          
          interaction.reply({content:"You have been verified to an existing account", ephemeral:true})
          giveRoleToUser(interaction)
         
          break;
        case "userEmail must be unique":
          interaction.reply({content:"Mail is already in use!", ephemeral:true})
          
          break;
        default:
          interaction.reply({content:"You have not been verified due to technical reasons. Contact staff", ephemeral:true})
         
      }
      track = false
    })
  return track
  
}

async function giveRoleToUser(interaction) {
    if (interaction.guildId == "294958471953252353") { //WoW
        await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '🧨 Skill Capped Member'))

    }
    else {
        await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '💎・Infinity+'))
}
}

async function performVerification(email, interaction) {
    switch(await verifyEmailExists(email)){
      case false:
        try {
          if(await addToSCDB(interaction.user.id, email, interaction.user.tag, interaction)) {
            interaction.reply({content:"You have been verified, welcome!", ephemeral:true})
          }
      
        } catch(err) {
          console.log(err)
          console.log("failed to add to SCDB or give role")
          await interaction.reply({content:"You have not been verified due to technical reasons. Contact staff", ephemeral:true})
          } 
      break;

    case "currently down":
      const exampleEmbed = new EmbedBuilder().setImage("https://dxjql3wvvra4n.cloudfront.net/temp/announcement1.png")
      await interaction.reply({embeds:[exampleEmbed], ephemeral:true})
      break;
        
    default:
        await interaction.reply({content:"This mail does not exist", ephemeral:true})
        break;
      
}}
const regexTemplateFullLink = /(https):\/\/(worldofwarcraft\.blizzard\.com\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/[\w_-]+\/)/

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
      

        if(interaction.customId == "verificationmodal") {
            const email = interaction.fields.getTextInputValue("email")
            await performVerification(email, interaction)
        }
        if(interaction.customId == "verificationbutton") {
            const verificationmodal = new ModalBuilder()
                .setCustomId('verificationmodal')
                .setTitle('Verification Modal');

                const emailInput = new TextInputBuilder()
                    .setCustomId('email')
                    .setLabel("What is your email?")
                    .setStyle(TextInputStyle.Short);
                const verificationRow = new ActionRowBuilder().addComponents(emailInput);
                verificationmodal.addComponents(verificationRow);
                await interaction.showModal(verificationmodal);
        }
      if(interaction.customId == "submissionmodal") {
        
        if(regexTemplateFullLink.test(interaction.fields.fields.get("armory").value)) {
          bot.emit("submitReview", interaction)
        }
        else {
          await interaction.reply({content:"This link is not valid.\n\nThink this is a mistake? Let us know", ephemeral:true})
        }
      }
        if(interaction.customId == "submitreview") {
         
          await interaction.showModal(submissionModal);
      }
        
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (command) {
                try {
                    await command.execute(interaction);
                   
                    
                }
                catch (error) {
                    console.error(error);
                    await interaction.reply({ content: `${error}`, ephemeral: true });
                }
            }
        }
        
                        }}
    
    
