const util = require('util')
const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ReviewHistory = require('../models/ReviewHistory');

const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');
const WoWCharacters = require('../models/WoWCharacters');
const bot = require('../src/botMain');

const accessToken = "EUXUk3xMnJjn7ryk5WJyhKgDwNPgl74H1U"
const regexTemplateFullLink = "/(https):\/\/(worldofwarcraft\.blizzard\.com\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/[\w_-]+\/)/"

const linkTemplate = "https://worldofwarcraft.blizzard.com/{lang}/character/{region}/{slug}/{char}/"

const testLink = "https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/blizo/pve/raids"

async function createWaitingForReviewMessage(interaction, charInfo) {
  const submissionChannel = bot.channels.fetch("1084873371797434438")


  const waitingForReviewEmbed = new EmbedBuilder()
    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.defaultAvatarUrl, url: interaction.user.defaultAvatarUrl })
    .setThumbnail(interaction.user.avatar)
    .setDescription(`
    Name: **${charInfo.characterName}** 
    Race: **${charInfo.characterRace}**
    Class: **${charInfo.characterClass}**
    Region: **${charInfo.region}**
      
    __2v2:                   **1400**__
      
    __3v3:                   **2444**__
      
    __10v10:                 **1123**__
      
    __Shuffle Fury:          **8391**__
      
    __Shuffle Arms:          **2415**__
      
    __Shuffle Protection:    **1241**__`)
    .setImage(interaction.user.defaultAvatarUrl)


  const waitingForReviewRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('claim')
        .setLabel('Claim')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('reject')
        .setLabel('Reject')
        .setStyle(ButtonStyle.Danger)
    );
      await submissionChannel.send({embeds:[waitingForReviewEmbed], components:[waitingForReviewRow]  })
  }

async function getCharacterInfo(region, slug, characterName, interaction) {
    
    const response = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    console.log(`characterSummary: ${response.status}. [ ${response.statusText} ]`)
    const responseSummary = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-summary?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    console.log(`pvpSummary: ${responseSummary.status}. [ ${responseSummary.statusText} ]`)
  
    let twoVtwoRating, threeVthreeRating, tenVtenRating, soloShuffleArmsRating, soloShuffleFuryRating, soloShuffleProtectionRating = null
  
  
  
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
    else if(bracket.href.includes(`shuffle-${characterClass}-arms`)) {
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/shuffle-${characterClass}-arms?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    soloShuffleArmsRating =bracketInfo.data.rating
  }
    else if(bracket.href.includes(`shuffle-${characterClass}-fury`)) {
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/shuffle-${characterClass}-fury?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    soloShuffleFuryRating = bracketInfo.data.rating
  }
    else if(bracket.href.includes(`shuffle-${characterClass}-protection`)) {
    const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/shuffle-${characterClass}-protection?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    soloShuffleProtectionRating = bracketInfo.data.rating
  }
    else {
      console.log("FOUND NO MATCH FOR BRACKET: ", bracket.href)
    }
    
  }
  
  const wowChar = await WoWCharacters.create({
    characterName:characterName,
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
  //return interaction.member.roles.cache.has('🧨 Skill Capped Member')
  return interaction.member.roles[0] == '🧨 Skill Capped Member'
  
}

module.exports = {
  name: 'submitReview',
  once: false,
  async execute(interaction) {  
    
    //let link = interaction.fields.fields.get("armory").value.replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
    let link = interaction.fields.fields.armory.value.replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
    const wowChar = getCharacterInfo(link[1], link[2], link[3],  interaction).catch(err=> { console.log("failed to get character info: ", err)})
    console.log("region: ", link[1])
    console.log("slug: ", link[2])
    console.log("name: ", link[3])
    //await getCharacterInfo(link[1], link[2], link[3], "warrior", interaction)

    const [verifiedAccount, created] = await ReviewHistory.findOrCreate({ 
      where:{ userID: interaction.user.id }, 
      defaults:{  status:"Available"  }, 
      order: [['CreatedAt', 'DESC']]})
    console.log(verifiedAccount, created)

    
    
    if(!isVerifiedByRole(interaction)) {
      await interaction.reply({content:"Please make sure you have been verified.", ephemeral:true})
    }


    if(Date.now() - (2629743*1000) >= verifiedAccount.createdAt) {  // 30 day reduction
      console.log(verifiedAccount.createdAt)
      await interaction.reply({content:`You can send a new submission in <t:${(verifiedAccount.createdAt/1000) +2629743}:R> ( <t:${(verifiedAccount.createdAt/1000) +2629743}> )`, ephemeral:true})
    }
    else {
      await createWaitingForReviewMessage(interaction, wowChar)
    }



      // do your stuff
  },
};


const statuses = ["Reviewed", "Available", "Rejected", "Broken", "Claimed"]






