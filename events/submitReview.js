const {main } = require("../components/functions/googleApi.js")
const blizzard = require('blizzard.js')
const util = require('util')
const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ReviewHistory = require('../models/ReviewHistory');
const noBreakSpace = "\u00A0"
const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');
const WoWCharacters = require('../models/WoWCharacters');
const bot = require('../src/botMain');
const classes = require("../classes.json");
const { data } = require('../commands/dumps');
const accessToken = process.env.accessToken
const regexTemplateFullLink = "/(https):\/\/(worldofwarcraft\.blizzard\.com\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/[\w_-]+)/"

const linkTemplate = "https://worldofwarcraft.blizzard.com/{lang}/character/{region}/{slug}/{char}/"

const testLink = "https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/blizo/pve/raids"

async function createWaitingForReviewMessage(interaction, charInfo, verifiedAccount) {
  
  const submissionChannel = await bot.channels.fetch("1084873371797434438")
  const maxLengt = 60
  
  let description = `
  Name: **${charInfo.dataValues.characterName}** 
  Class: **${charInfo.dataValues.characterClass}**
  Region: **${charInfo.dataValues.characterRegion}**`

  if(charInfo.dataValues.twoVtwoRating != null) {
    let n = `\n\n__2v2:${noBreakSpace.repeat()}**${charInfo.dataValues.twoVtwoRating}**__`.length
    description+=`\n\n__2v2:${noBreakSpace.repeat(65-n)}**${charInfo.dataValues.twoVtwoRating}**__`
  }
  if(charInfo.dataValues.threeVthreeRating != null) {
    let n = `\n\n__3v3:${noBreakSpace.repeat()}**${charInfo.dataValues.threeVthreeRating}**__`.length
    description+=`\n\n__3v3:${noBreakSpace.repeat(65-n)}**${charInfo.dataValues.threeVthreeRating}**__`
  }
  if(charInfo.dataValues.soloShuffleSpec1Rating != null&& charInfo.dataValues.soloShuffleSpec1Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][0]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec1Rating}**__`.length
    description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][0]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec1Rating}**__`
  }
  if(charInfo.dataValues.soloShuffleSpec2Rating != null&& charInfo.dataValues.soloShuffleSpec2Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][1]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec2Rating}**__`.length
    description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][1]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec2Rating}**__`
  }
  if(charInfo.dataValues.soloShuffleSpec3Rating != null&& charInfo.dataValues.soloShuffleSpec3Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][2]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec3Rating}**__`.length
    description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][2]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec3Rating}**__`
  }
  if(charInfo.dataValues.soloShuffleSpec4Rating != null && charInfo.dataValues.soloShuffleSpec4Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][3]}:${noBreakSpace.repeat()}**${charInfo.dataValues.soloShuffleSpec4Rating}**__`.length
    description+=`\n\n__Shuffle ${classes[charInfo.dataValues.characterClass][3]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.dataValues.soloShuffleSpec4Rating}**__`
  }

  const waitingForReviewEmbed = new EmbedBuilder()
  .setTitle(`Submission ${verifiedAccount.dataValues.id}`)  
  .setAuthor({ name: `${interaction.user.tag} ( ${interaction.user.id} )`, iconURL: interaction.member.displayAvatarURL(true)})
    .setDescription(description)
    //.setThumbnail(charInfo.characterImage)
    //.setFooter({text:"This submission is unclaimed"})

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

async function getCharacterInfo(region, slug, characterName, wowClient) {
    const Cprofile = await wowClient.characterProfile({ realm: slug, name: characterName })
    //console.log(Cprofile.data)

    console.log(`Cprofile: ${Cprofile.status}. [ ${Cprofile.statusText} ]`)
    const Cpvp = await wowClient.characterPVP({ realm: slug, name: characterName})
    console.log(`pvpSummary: ${Cpvp.status}. [ ${Cpvp.statusText} ]`, Cpvp.data)
    //const media = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/character-media?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    
    let twoVtwoRating= threeVthreeRating= tenVtenRating=  soloShuffleSpec1Rating=  soloShuffleSpec2Rating= soloShuffleSpec3Rating=  soloShuffleSpec4Rating = null
  
    
  
  for(const bracket of Cpvp.data.brackets) {
    try {

    
      if(bracket.href.includes("2v2")) {
        const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: "2v2"})
        
       
        twoVtwoRating = bracketInfo.data.rating
      }
      else if(bracket.href.includes("3v3")) {
      
        const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: "3v3"})

      threeVthreeRating = bracketInfo.data.rating
      }
        
      /*   else if(bracket.href.includes("rbg")) {
        const bracketInfo = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/pvp-bracket/rbg?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
        tenVtenRating = bracketInfo.data.rating
      } */
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][0].toLowerCase()}`)) {
        const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][0].toLowerCase()}`})
        soloShuffleSpec1Rating =bracketInfo.data.rating
      }
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][1].toLowerCase()}`)) {
          const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][1].toLowerCase()}`})
        soloShuffleSpec2Rating = bracketInfo.data.rating
      }
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][2].toLowerCase()}`)) {
          const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][2].toLowerCase()}`})

        soloShuffleSpec3Rating = bracketInfo.data.rating
      }
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][3].toLowerCase()}`)) {
          const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase()}-${classes[Cprofile.data.character_class.name][3].toLowerCase()}`})

          soloShuffleSpec4Rating = bracketInfo.data.rating
        }
        else {
          console.log("FOUND NO MATCH FOR BRACKET: ", bracket.href)
        }
  } catch(err) {
    if (err.toString().includes("TypeError: Cannot read properties of undefined (reading 'toLowerCase')")) {
      console.log("This role does not exist in classes")
    }
    else {
      console.log(err)
    }
  }
    
  }

  let wowChar = await WoWCharacters.create({
    characterName:Cprofile.data.name,
    characterRegion:region,
    slug:slug,
    //characterRace:response.data.race.name,
    characterClass:Cprofile.data.character_class.name,
    //characterImage:media.data.assets[1].value,
    //honorableKills:responseSummary.data.honorable_kills,
    twoVtwoRating:twoVtwoRating,
    threeVthreeRating:threeVthreeRating,
    tenVtenRating:tenVtenRating,
    soloShuffleSpec1Rating:soloShuffleSpec1Rating,
    soloShuffleSpec2Rating:soloShuffleSpec2Rating,
    soloShuffleSpec3Rating:soloShuffleSpec3Rating,
    soloShuffleSpec4Rating:soloShuffleSpec4Rating
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
    const wowClient = await blizzard.wow.createInstance({
      key: process.env.BCID,
      secret: process.env.BCS,
      origin: link[1], // optional
      locale: 'en_US', // optional
      token: '', // optional
    })
    
    const wowChar = await getCharacterInfo(link[1], link[2], link[3],  wowClient).catch(err=> { console.log("failed to get character info: ", err)})
/*     console.log("region: ", link[1])
    console.log("slug: ", link[2])
    console.log("name: ", link[3])
    console.log(wowChar, "wow") */
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
      createWaitingForReviewMessage(interaction, wowChar, verifiedAccount)
      await interaction.reply({content:"Thank you for your submission. If your submission is picked you will be notified.", ephemeral:true})
      return
    }
    
    

    if((Date.now() - (2629743*1000)) <= verifiedAccount.createdAt) {  // 30 day reduction
      console.log(verifiedAccount.createdAt)
      await interaction.reply({content:`You can send a new submission in <t:${(verifiedAccount.createdAt/1000) +2629743}:R> ( <t:${(verifiedAccount.createdAt/1000) +2629743}> )`, ephemeral:true})
      return
    }
    
    // if none of the ones apply, create new entry
    verifiedAccount = await ReviewHistory.create({
      userID:interaction.user.id,
      status:"Available"
    })
    await interaction.reply({content:"Thank you for your submission. If your submission is picked you will be notified.", ephemeral:true})
    await createWaitingForReviewMessage(interaction, wowChar, verifiedAccount)
    const forSpread = [
      {
        "range": `A${verifiedAccount.id}`,
        "values": [
          [
            verifiedAccount.userID
          ]
        ]
      },
      {
        "range": `B${verifiedAccount.id}`,
        "values": [
          [
            verifiedAccount.status
          ]
        ]
      }]
    await main(forSpread)
      // do your stuff
  },
};


const statuses = ["Reviewed", "Available", "Rejected", "Broken", "Claimed"]






