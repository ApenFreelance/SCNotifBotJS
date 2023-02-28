const axios = require('axios');
const { SlashCommandBuilder, TextInputStyle, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');


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
  //await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '💎・Infinity+'))
  await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '🧨 Skill Capped Member'))

}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify you account!'),
	async execute(interaction) {
    const modal = new ModalBuilder()
    .setCustomId('verificationmodal')
    .setTitle('Verification Modal');

    const favoriteColorInput = new TextInputBuilder()
        .setCustomId('email')
        // The label is the prompt the user sees for this input
        .setLabel("What is your email?")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);
    // TODO: Add components to modal...
    const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);

    }
}
