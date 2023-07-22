const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require("discord.js");
const { cLog } = require("./functions/cLog");


async function completeSubmissionEmbed(interaction, submissionModal) {
  const modal = new ModalBuilder()
    .setCustomId(`completesubmission-${submissionModal}`)
    .setTitle("Close submission");
  const closeInput = new TextInputBuilder()
    .setCustomId("reviewlink")
    .setLabel("REVIEW LINK:")
    .setStyle(TextInputStyle.Short);
  const closeRow = new ActionRowBuilder().addComponents(closeInput);

  modal.addComponents(closeRow);
  await interaction.showModal(modal);
}

async function createSubmissionModal(interaction, game) {
  if(game == null) {
    cLog(["This server was NULL!"], {guild:interaction.guildId, subProcess:"CreateSubmissionModal"})
    return
  }
  // The modal
  const modal = new ModalBuilder()
    .setCustomId("submissionmodal")
    .setTitle("Submission Modal")
  
  // The common fields in modal
  const ytInput = new TextInputBuilder()
    .setCustomId('ytlink')
    .setLabel("UNLISTED YOUTUBE LINK:")
    .setStyle(TextInputStyle.Short);
  const emailInput = new TextInputBuilder()
    .setCustomId('email')
    .setLabel("SKILL-CAPPED EMAIL:")
    .setStyle(TextInputStyle.Short);
  const improvementInput = new TextInputBuilder()
    .setCustomId('improvementinput')
    .setLabel("What are you looking to focus on and improve?")
    .setStyle(TextInputStyle.Paragraph);

  // WoW fields
  const armoryInput = new TextInputBuilder()
    .setCustomId('armory')    
    .setLabel("ARMORY LINK:") 
    .setPlaceholder('https://worldofwarcraft.blizzard.com/en-gb/character/eu/ravencrest/mýstíc')
    .setStyle(TextInputStyle.Short);

  // Val fields
  const trackerInput = new TextInputBuilder()
    .setCustomId('tracker')    
    .setLabel("TRACKER.GG LINK:") 
    .setPlaceholder('https://tracker.gg/valorant/profile/riot/ApenJulius1%23EUW/overview')
    .setStyle(TextInputStyle.Short);

  // The rows
  const ytRow = new ActionRowBuilder().addComponents(ytInput);
  const emailRow = new ActionRowBuilder().addComponents(emailInput);
  const improvementRow = new ActionRowBuilder().addComponents(improvementInput);
  
  // WoW rows
  const armoryRow = new ActionRowBuilder().addComponents(armoryInput);
  
  // Val rows
  const trackerRow = new ActionRowBuilder().addComponents(trackerInput);
  
  if(game == "WoW") {
    modal.addComponents(ytRow, armoryRow, emailRow, improvementRow)
  }
  else if(game == "Valorant") {
    modal.addComponents(ytRow, trackerRow, emailRow, improvementRow)
  } else {
    cLog(["This server was NOT NULL but unknown!", interaction.guild.name], {guild:interaction.guildId, subProcess:"CreateSubmissionModal"})
    return null
  }
  await interaction.showModal(modal)
  return true
}


module.exports = { completeSubmissionEmbed, createSubmissionModal };
