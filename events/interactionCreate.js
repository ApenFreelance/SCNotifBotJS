
const { SlashCommandBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ModalBuilder,Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder } = require('discord.js');

const axios = require('axios');

const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');


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
  console.log("Result: ", response.data.available)
  return response.data.available
}
async function alreadyLinkedToAccount(email, memberID) {
  const dbUserInfo = await SCverifiedAccountDB.findOne({ where: { userID: memberID } });
  if (dbUserInfo !== null) {
    return(true)}
  else {
    return(false)
  }
}
async function verifyEmailNotInUse(email, memberID) {
  const dbUserInfo = await SCverifiedAccountDB.findOne({ where: { userEmail: email } });

if (dbUserInfo === null) {
  console.log('Not found!');
  return(true)}
if(dbUserInfo.userID == memberID) {
  return(true, "Same user")  

} else {
 return(false, "Mail already in use")

}}
async function addToSCDB(userID, email) {
  await SCverifiedAccountDB.findOrCreate({where: {userID:userID, userEmail:email}})
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
    if(await verifyEmailExists(email) == false){
        try {
        switch(await verifyEmailNotInUse(email, interaction.user.id)){
          case "Mail already in use":
            await interaction.reply({content:"Mail already in use!", ephemeral:true})
            break;
          case "Same user":
            giveRoleToUser(interaction)
            await interaction.reply({content:"You have been verified to an existing account", ephemeral:true})
            break;
          default:
            addToSCDB(interaction.user.id, email)
            giveRoleToUser(interaction)
            await interaction.reply({content:"You have been verified", ephemeral:true})
            break;
        }
      
        } catch(err) {
          console.log(err)
          console.log("failed to add to SCDB or give role")
          await interaction.reply({content:"You have not been verified due to technical reasons. Contact staff", ephemeral:true})
          }  }

        
          

        
      else {
          await interaction.reply({content:"This mail does not exist", ephemeral:true})
      }
}
const regexTemplateFullLink = /(https):\/\/(worldofwarcraft\.blizzard\.com\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/[\w_-]+\/)/

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
      
      console.log(interaction)
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
    
    
