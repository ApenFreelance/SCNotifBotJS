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
      console.log(err)
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
    let arm = interaction.fields.getTextInputValue("armory")

    let link = decodeURI(arm).replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
    //let link = interaction.fields.fields.armory.value.replace("https://worldofwarcraft.blizzard.com/", "").replace("/character/", "/").split("/")
   /*  console.log("region: ", link[1])
    console.log("slug: ", link[2])
    console.log("name: ", link[3]) */
    const wowClient = await blizzard.wow.createInstance({
      key: process.env.BCID,
      secret: process.env.BCS,
      origin: link[1], // optional
      locale: 'en_US', // optional
      token: '', // optional
    })
    
    const wowChar = await getCharacterInfo(link[1], link[2], link[3],  wowClient, interaction.fields.getTextInputValue("armory")).catch(err=> { console.log("failed to get character info: ", err)})
    
    //console.log(wowChar, "wow")
    //await getCharacterInfo(link[1], link[2], link[3], "warrior", interaction)
    if(!isVerifiedByRole(interaction)) {
      await interaction.user.send({content:"Please make sure you have been verified.", ephemeral:true})
      return
    }
   
    //console.log(verifiedAccount, created)
    let [verifiedAccount, created] = await ReviewHistory.findOrCreate({ 
      where:{ userID: interaction.user.id }, 
      defaults:{  status:"SentToUser", 
      userEmail:interaction.fields.getTextInputValue("email"),
      userTag:interaction.user.tag,
      charIdOnSubmission:wowChar.id  }, 
      order: [['CreatedAt', 'DESC']]})

    let linkingButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
            .setLabel('I have done this')
            .setStyle("Success")
            .setCustomId(`clip-${verifiedAccount.id}`))
    
    
    if(created) { // if a new entry is created there is no reason to check the rest
      await interaction.user.send({content:`VoD Review ID: **${verifiedAccount.id}**\n\nThank you for requesting a free Skill Capped VoD Review\n\nFor us to process your ticket, please ensure the name of the clip you upload matches the ID at the top of this message - this means you should upload a file named **${verifiedAccount.id}**\n\nUpload your clip here: https://www.dropbox.com/request_edison/j45mpngIwOopNvH8akE\n\nWe recommend you use https://obsproject.com/ to record your gameplay.\n\nIf your submission is accepted, a ticket will be created in the SkillCappedWoWGuides Discord server and you will be tagged once the review has been completed and uploaded`, components:[linkingButton]})
      //await createWaitingForReviewMessage(interaction, wowChar, verifiedAccount)
      let submissionPos = verifiedAccount.dataValues.id
      
      const forSpread = [
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
              "WIP: cliplink"
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
    //console.log(forSpread)
      await main(forSpread)
      
      return
    }
    
    

    if((Date.now() - (2629743*1000)) <= verifiedAccount.createdAt) {  // 30 day reduction
      await interaction.user.send({content:`You can send a new submission in <t:${(verifiedAccount.createdAt/1000) +2629743}:R> ( <t:${(verifiedAccount.createdAt/1000) +2629743}> )`, ephemeral:true})
      return
    }
    
    // if none of the ones apply, create new entry
    verifiedAccount = await ReviewHistory.create({
      userEmail:interaction.fields.getTextInputValue("email"),
      userID:interaction.user.id,
      status:"SentToUser",
      userTag:interaction.user.tag,
      charIdOnSubmission:wowChar.id
    })
    //console.log(verifiedAccount)
    linkingButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
            .setLabel('I have done this')
            .setStyle("Success")
            .setCustomId(`clip-${verifiedAccount.id}`))

            await interaction.user.send({content:`VoD Review ID: **${verifiedAccount.id}**\n\nThank you for requesting a free Skill Capped VoD Review\n\nFor us to process your ticket, please ensure the name of the clip you upload matches the ID at the top of this message - this means you should upload a file named **${verifiedAccount.id}**\n\nUpload your clip here: https://www.dropbox.com/request_edison/j45mpngIwOopNvH8akE\n\nWe recommend you use https://obsproject.com/ to record your gameplay.\n\nIf your submission is accepted, a ticket will be created in the SkillCappedWoWGuides Discord server and you will be tagged once the review has been completed and uploaded`, components:[linkingButton]})
    //await interaction.reply({content:"Thank you for your submission. If your submission is picked you will be notified.", ephemeral:true})
    //await createWaitingForReviewMessage(interaction, wowChar, verifiedAccount)
    let submissionPos = verifiedAccount.dataValues.id
    console.log(submissionPos, "SUBMISSION POS")
    const forSpread = [
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
            "WIP: cliplink"
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
    //console.log(forSpread)
    await main(forSpread)
      // do your stuff
  },
};


const statuses = ["Reviewed", "Available", "Rejected", "Broken", "Claimed"]






