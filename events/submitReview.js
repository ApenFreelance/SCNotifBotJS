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
const wowServer = "294958471953252353"
const { createWaitingForReviewMessage } = require("../components/functions/createWaitingForReview.js");
const accessToken = process.env.accessToken
const regexTemplateFullLink = "/(https):\/\/(worldofwarcraft\.blizzard\.com\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/[\w_-]+)/"

const linkTemplate = "https://worldofwarcraft.blizzard.com/{lang}/character/{region}/{slug}/{char}/"

const testLink = "https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/blizo/pve/raids"


async function getCharacterInfo(region, slug, characterName, wowClient, armoryLink) {
    const Cprofile = await wowClient.characterProfile({ realm: slug, name: characterName })
    //console.log(Cprofile.data)

    console.log(`Cprofile: ${Cprofile.status}. [ ${Cprofile.statusText} ]`)
    const Cpvp = await wowClient.characterPVP({ realm: slug, name: characterName})
    console.log(`pvpSummary: ${Cpvp.status}. [ ${Cpvp.statusText} ]`)
    //const media = await axios.get(`https://${region}.api.blizzard.com/profile/wow/character/${slug}/${characterName}/character-media?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    let twoVtwoRating= threeVthreeRating= tenVtenRating=  soloShuffleSpec1Rating=  soloShuffleSpec2Rating= soloShuffleSpec3Rating=  soloShuffleSpec4Rating = null
  
  try {

  
  
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
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][0].toLowerCase().replace(" ", "")}`)) {
        const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][0].toLowerCase().replace(" ", "")}`})
        soloShuffleSpec1Rating =bracketInfo.data.rating
      }
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][1].toLowerCase()}.replace(" ", "")`)) {
          const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][1].toLowerCase().replace(" ", "")}`})
        soloShuffleSpec2Rating = bracketInfo.data.rating
      }
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][2].toLowerCase().replace(" ", "")}`)) {
          const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][2].toLowerCase().replace(" ", "")}`})

        soloShuffleSpec3Rating = bracketInfo.data.rating
      }
        else if(bracket.href.includes(`shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][3].toLowerCase().replace(" ", "")}`)) {
          const bracketInfo = await wowClient.characterPVP({ realm: slug, name: characterName, bracket: `shuffle-${Cprofile.data.character_class.name.toLowerCase().replace(" ", "")}-${classes[Cprofile.data.character_class.name][3].toLowerCase().replace(" ", "")}`})

          soloShuffleSpec4Rating = bracketInfo.data.rating
        }
        else {
          console.log("FOUND NO MATCH FOR BRACKET: ", bracket.href)
        }
  } catch(err) {
    if (err.toString().includes("TypeError: Cannot read properties of undefined (reading 'toLowerCase')")) {
      console.log("This role does not exist in classes, or class is lacking subclass")
    }
    else {
      console.log(err, "Error when checking classes")
    }
  }
    
  } }
  catch {
    console.log("User most likely has no rank history")
  }

  let wowChar = await WoWCharacters.create({
    armoryLink:armoryLink,
    characterName:Cprofile.data.name,
    characterRegion:region,
    slug:slug,
    armorLevel:Cprofile.data.equipped_item_level,
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
  if(interaction.member.roles.cache.some(role => role.name === '🧨 Skill Capped Member') ||
  interaction.member.roles.cache.some(role => role.name === '💙Premium Member')){
    return true
  }
  //return interaction.member.roles[0] == '🧨 Skill Capped Member'
  return false
}

function nullOnError(value){
  try {
    value
  } catch(err) {
    return null
  }
  return value
}



function forSpread(verifiedAccount, wowChar, submissionPos, arm, name) {
  
  if (wowChar == null) {
    return [
      //THIS IS STATUS. ON TOP FOR CONVENIENCE. ALWAYS COLUMN "O"
      {
        "range": `O${submissionPos}`, //Ticket status
        "values": [
          [
            verifiedAccount.dataValues.status
          ]
        ]
      },
      //BELOW THIS IS REVIEW HISTORY
      {
        "range": `A${submissionPos}`, //Ticket created
        "values": [
          [
            verifiedAccount.dataValues.createdAt
          ]
        ]
      },
      {
        "range": `B${submissionPos}`, //Ticket ID
        "values": [
          [
            verifiedAccount.dataValues.id
          ]
        ]
      },
      {
        "range": `C${submissionPos}`, // User ID
        "values": [
          [
            verifiedAccount.dataValues.userID
          ]
        ]
      },
      {
        "range": `D${submissionPos}`, // User Tag
        "values": [
          [
            verifiedAccount.dataValues.userTag
          ]
        ]
      },{
        "range": `E${submissionPos}`, // User Mail
        "values": [
          [
            verifiedAccount.dataValues.userEmail
          ]
        ]
      },
      {
        "range": `F${submissionPos}`, // User Clip
        "values": [
          [
            "Clip link not given yet"
            //verifiedAccount.dataValues.userEmail
          ]
        ]
      },
      // BELOW IS ALL FROM WOWCHARACTER AND NOT REVIEWHISTORY
      {
        "range": `G${submissionPos}`, // Armory Link
        "values": [
          [
            arm
          ]
        ]
      },
    ]
  }
  
  return [
    //THIS IS STATUS. ON TOP FOR CONVENIENCE. ALWAYS COLUMN "O"
    {
      "range": `O${submissionPos}`, //Ticket status
      "values": [
        [
          verifiedAccount.dataValues.status
        ]
      ]
    },
    //BELOW THIS IS REVIEW HISTORY
    {
      "range": `A${submissionPos}`, //Ticket created
      "values": [
        [
          verifiedAccount.dataValues.createdAt
        ]
      ]
    },
    {
      "range": `B${submissionPos}`, //Ticket ID
      "values": [
        [
          verifiedAccount.dataValues.id
        ]
      ]
    },
    {
      "range": `C${submissionPos}`, // User ID
      "values": [
        [
          verifiedAccount.dataValues.userID
        ]
      ]
    },
    {
      "range": `D${submissionPos}`, // User Tag
      "values": [
        [
          verifiedAccount.dataValues.userTag
        ]
      ]
    },{
      "range": `E${submissionPos}`, // User Mail
      "values": [
        [
          verifiedAccount.dataValues.userEmail
        ]
      ]
    },
    {
      "range": `F${submissionPos}`, // User Clip
      "values": [
        [
          verifiedAccount.dataValues.clipLink
          //verifiedAccount.dataValues.userEmail
        ]
      ]
    },
    // BELOW IS ALL FROM WOWCHARACTER AND NOT REVIEWHISTORY
    {
      "range": `G${submissionPos}`, // Armory Link
      "values": [
        [
          wowChar.dataValues.armoryLink 
        ]
      ]
    },
    {
      "range": `H${submissionPos}`, // Character class
      "values": [
        [
          wowChar.dataValues.characterClass
        ]
      ]
    },
    {
      "range": `I${submissionPos}`, // 2v2
      "values": [
        [
          wowChar.dataValues.twoVtwoRating
        ]
      ]
    },
    {
      "range": `J${submissionPos}`, // 3v3
      "values": [
        [
          wowChar.dataValues.threeVthreeRating
        ]
      ]
    },
    {
      "range": `K${submissionPos}`, // Solo1
      "values": [
        [
          wowChar.dataValues.soloShuffleSpec1Rating
        ]
      ]
    },
    {
      "range": `L${submissionPos}`, // Solo2
      "values": [
        [
          wowChar.dataValues.soloShuffleSpec2Rating 
        ]
      ]
    },
    {
      "range": `M${submissionPos}`, // Solo3
      "values": [
        [
          wowChar.dataValues.soloShuffleSpec3Rating
        ]
      ]
    },
    {
      "range": `N${submissionPos}`, // Solo4
      "values": [
        [
          wowChar.dataValues.soloShuffleSpec4Rating
        ]
      ]
    },
  ]
}


module.exports = {
  name: 'submitReview',
  once: false,
  async execute(interaction) { 
    try {
      let wowChar = null
      
      interaction = interaction 
      let arm = interaction.fields.getTextInputValue("armory")
      let improvement = interaction.fields.getTextInputValue("improvementinput")

      let link = decodeURI(arm).replace("https://worldofwarcraft.com/", "").replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
      //let link = interaction.fields.fields.armory.value.replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
      
      const wowClient = await blizzard.wow.createInstance({
        key: process.env.BCID,
        secret: process.env.BCS,
        origin: link[1], // optional
        locale: 'en_US', // optional
        token: '', // optional
      }).catch(err => {
        console.log(err) 
        interaction.editReply({content:"Failed to get character info, continuing", ephemeral:true})
        console.log("region: ", link[1])
        console.log("slug: ", link[2])
        console.log("name: ", link[3])
      })
      try {
        wowChar = await getCharacterInfo(link[1], link[2], link[3],  wowClient, interaction.fields.getTextInputValue("armory"))
      }catch(err){
        if(!err.response.status == 404){
          console.log("failed to get character info: ", err)
        }
        wowChar = null
        console.log("Failed to get char, because char doesnt exist or couldnt be found")
      }
      
      //console.log(wowChar, "wow")
      //await getCharacterInfo(link[1], link[2], link[3], "warrior", interaction)
      if(!isVerifiedByRole(interaction)) {
        await interaction.editReply({content:"Please make sure you have been verified.", ephemeral:true})
        return
      }
    
      //console.log(verifiedAccount, created)
      let [verifiedAccount, created] = await ReviewHistory.findOrCreate({ 
        where:{ userID: interaction.user.id }, 
        defaults:{  status:"Available", 
        userEmail:interaction.fields.getTextInputValue("email"),
        userTag:interaction.user.tag,
        clipLink: interaction.fields.getTextInputValue("ytlink")}, 
        order: [['CreatedAt', 'DESC']]})
      
      if(created) { // if a new entry is created there is no reason to check the rest
        try {

        
        await createWaitingForReviewMessage(interaction, wowChar, verifiedAccount, improvement, wowServer, arm, link[3])
        await interaction.editReply({content:`Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`, ephemeral:true})
        
      } catch (err) {
          console.log("Failed when responding or creating message for review for NEW user", err)
          await interaction.editReply({content:`Something went wrong registering new user.`, ephemeral:true})
        }
        let submissionPos = verifiedAccount.dataValues.id
        
      //console.log(forSpread)
        await main(forSpread(verifiedAccount, wowChar, submissionPos, arm, link[3]))
        
        return
      }
      
      

      if((Date.now() - (2629743*1000)) <= verifiedAccount.createdAt) {  // 30 day reduction
        await interaction.editReply({content:`You can send a new submission in <t:${(verifiedAccount.createdAt/1000) +2629743}:R> ( <t:${(verifiedAccount.createdAt/1000) +2629743}> )`, ephemeral:true})
        return
      }
      
      // if none of the ones apply, create new entry
      verifiedAccount = await ReviewHistory.create({
        userEmail:interaction.fields.getTextInputValue("email"),
        userID:interaction.user.id,
        status:"Available",
        userTag:interaction.user.tag,
        clipLink: interaction.fields.getTextInputValue("ytlink")
      })

      await verifiedAccount.update({
        charIdOnSubmission:wowChar.id
      }).catch(err => {
        console.log("No charId found")
      })
      //console.log(verifiedAccount)
      linkingButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
              .setLabel('I have done this')
              .setStyle("Success")
              .setCustomId(`clip-${verifiedAccount.id}`))
      
      
              //await interaction.reply({content:"Thank you for your submission. If your submission is picked you will be notified.", ephemeral:true})
      await createWaitingForReviewMessage(interaction, wowChar, verifiedAccount, improvement, wowServer, arm, link[3])
      let submissionPos = verifiedAccount.dataValues.id
      console.log(submissionPos, "SUBMISSION POS")
      //console.log(forSpread)
      await main(forSpread(verifiedAccount, wowChar, submissionPos, arm, link[3]))
      await interaction.editReply({content:`Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`, ephemeral:true})
        // do your stuff
    } catch(e) {
      console.log(e)
      await interaction.editReply({content:"Something went wrong when submitting. Please contact staff", ephemeral:true})
    }

}
};


const statuses = ["Reviewed", "Available", "Rejected", "Broken", "Claimed"]





