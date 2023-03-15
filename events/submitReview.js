const util = require('util')
const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ReviewHistory = require('../models/ReviewHistory');
const noBreakSpace = "\u00A0"
const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');
const WoWCharacters = require('../models/WoWCharacters');
const bot = require('../src/botMain');

const accessToken = process.env.accessToken
const regexTemplateFullLink = "/(https):\/\/(worldofwarcraft\.blizzard\.com\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/[\w_-]+)/"

const linkTemplate = "https://worldofwarcraft.blizzard.com/{lang}/character/{region}/{slug}/{char}/"

const testLink = "https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/blizo/pve/raids"

async function createWaitingForReviewMessage(interaction, charInfo, verifiedAccount) {
  const submissionChannel = await bot.channels.fetch("1084873371797434438")
  

  const waitingForReviewEmbed = new EmbedBuilder()
  .setTitle(`Submission ${verifiedAccount.dataValues.id}`)  
  .setAuthor({ name: `${interaction.user.tag} ( ${interaction.user.id} )`, iconURL: interaction.member.displayAvatarURL(true)})
    .setDescription(`
    Name: **${charInfo.dataValues.characterName}** 
    Race: **${charInfo.dataValues.characterRace}**
    Class: **${charInfo.dataValues.characterClass}**
    Region: **${charInfo.dataValues.characterRegion}**

    __Honorable Kills${noBreakSpace.repeat(12)}**${charInfo.dataValues.honorableKills}**__
      
    __2v2:${noBreakSpace.repeat(36)}**${charInfo.dataValues.twoVtwoRating}**__
      
    __3v3:${noBreakSpace.repeat(35)}**${charInfo.dataValues.threeVthreeRating}**__
      
    __10v10:${noBreakSpace.repeat(32)}**${charInfo.dataValues.tenVtenRating}**__
      
    __Shuffle Fury:${noBreakSpace.repeat(22)}**${charInfo.dataValues.soloShuffleFuryRating}**__
      
    __Shuffle Arms:${noBreakSpace.repeat(20)}**${charInfo.dataValues.soloShuffleArmsRating}**__
      
    __Shuffle Protection:${noBreakSpace.repeat(10)}**${charInfo.dataValues.soloShuffleProtectionRating}**__`)
    .setImage(charInfo.characterImage)
    .setFooter({text:"This submission is unclaimed"})

  const waitingForReviewRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('claimsubmission')
        .setLabel('Claim')
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId('rejectsubmission')
        .setLabel('Reject')
        .setStyle("Danger")
    );
      await submissionChannel.send({embeds:[waitingForReviewEmbed], components:[waitingForReviewRow]  })
  }

async function getCharacterInfo(region, slug, characterName, interaction) {
    
    const response = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    console.log(`characterSummary: ${response.status}. [ ${response.statusText} ]`)
    const responseSummary = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-summary?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    console.log(`pvpSummary: ${responseSummary.status}. [ ${responseSummary.statusText} ]`)
    const media = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/character-media?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    
    let twoVtwoRating= threeVthreeRating= tenVtenRating= soloShuffleArmsRating= soloShuffleFuryRating=soloShuffleProtectionRating = null
  
    console.log(twoVtwoRating, threeVthreeRating, tenVtenRating, soloShuffleArmsRating, soloShuffleFuryRating, soloShuffleProtectionRating )
  
  
  for(const bracket of responseSummary.data.brackets) {
    if(bracket.href.includes("2v2")) {
  
      const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/2v2?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
      twoVtwoRating = bracketInfo.data.rating
    }
    else if(bracket.href.includes("3v3")) {
    
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/3v3?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)

    threeVthreeRating = bracketInfo.data.rating
  }
    
    else if(bracket.href.includes("rbg")) {
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/rbg?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    tenVtenRating = bracketInfo.data.rating
  }
    else if(bracket.href.includes(`shuffle-${response.data.character_class.name}-arms`)) {
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/shuffle-${characterClass}-arms?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    soloShuffleArmsRating =bracketInfo.data.rating
  }
    else if(bracket.href.includes(`shuffle-${response.data.character_class.name}-fury`)) {
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/shuffle-${characterClass}-fury?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    soloShuffleFuryRating = bracketInfo.data.rating
  }
    else if(bracket.href.includes(`shuffle-${response.data.character_class.name}-protection`)) {
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/shuffle-${characterClass}-protection?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    soloShuffleProtectionRating = bracketInfo.data.rating
  }
    else {
      console.log("FOUND NO MATCH FOR BRACKET: ", bracket.href)
    }
    
  }
  
  const wowChar = await WoWCharacters.create({
    characterName:characterName,
    characterRegion:region,
    slug:slug,
    characterRace:response.data.race.name,
    characterClass:response.data.character_class.name,
    characterImage:media.data.assets[2].value,
    honorableKills:responseSummary.data.honorable_kills,
    twoVtwoRating:twoVtwoRating,
    threeVthreeRating:threeVthreeRating,
    tenVtenRating:tenVtenRating,
    soloShuffleArmsRating:soloShuffleArmsRating,
    soloShuffleFuryRating:soloShuffleFuryRating,
    soloShuffleProtectionRating:soloShuffleProtectionRating
  })
  
  return wowChar
  }

function isVerifiedByRole(interaction) {
  return interaction.member.roles.cache.some(role => role.name === '🧨 Skill Capped Member')
  //return interaction.member.roles[0] == '🧨 Skill Capped Member'
  
}

module.exports = {
  name: 'submitReview',
  once: false,
  async execute(interaction) {  
    
    let link = interaction.fields.fields.get("armory").value.replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
    //let link = interaction.fields.fields.armory.value.replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
    const wowChar = await getCharacterInfo(link[1], link[2], link[3],  interaction).catch(err=> { console.log("failed to get character info: ", err)})
    console.log("region: ", link[1])
    console.log("slug: ", link[2])
    console.log("name: ", link[3])
    //console.log(wowChar)
    //await getCharacterInfo(link[1], link[2], link[3], "warrior", interaction)

   
    //console.log(verifiedAccount, created)
    let [verifiedAccount, created] = await ReviewHistory.findOrCreate({ 
      where:{ userID: interaction.user.id }, 
      defaults:{  status:"Available"  }, 
      order: [['CreatedAt', 'DESC']]})
    
    
    if(!isVerifiedByRole(interaction)) {
      await interaction.reply({content:"Please make sure you have been verified.", ephemeral:true})
      return
    }
    if(created) { // if a new entry is created there is no reason to check the rest
      createWaitingForReviewMessage(interaction, wowChar)
      return
    }

    if(Date.now() - (2629743*1000) >= verifiedAccount.createdAt) {  // 30 day reduction
      console.log(verifiedAccount.createdAt)
      await interaction.reply({content:`You can send a new submission in <t:${(verifiedAccount.createdAt/1000) +2629743}:R> ( <t:${(verifiedAccount.createdAt/1000) +2629743}> )`, ephemeral:true})
      return
    }
    
    // if none of the ones apply, create new entry
    verifiedAccount = await ReviewHistory.create({
      userID:interaction.user.id,
      status:"Available"
    })
    await createWaitingForReviewMessage(interaction, wowChar, verifiedAccount)
    await interaction.reply({content:"Thank you for your submission. If your submission is picked you will be notified.", ephemeral:true})

      // do your stuff
  },
};


const statuses = ["Reviewed", "Available", "Rejected", "Broken", "Claimed"]






