const axios = require('axios')
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const fs = require("fs");
const bot = require('../src/botMain');

const { parseDump } = require('../components/functions/valorantDumps');

const jsonLocation = "./gameData.json"



module.exports = {
    data: new SlashCommandBuilder()
        .setName('dumps')
        .setDescription('close the review')
        .addStringOption(option =>
            option
            .setName('game')
            .setDescription('the game you wish to update')
            .addChoices(
				{ name: 'wow', value: 'wow' },
				{ name: 'wrath', value: 'wrath' },
        { name: 'valorant', value: 'valorant'}
			))
        .addStringOption(option =>
            option
            .setName('newdump')
            .setDescription('The new dump you want to upload'))
        .addStringOption(option =>
            option
            .setName('olddump')
            .setDescription('the old dump it uses to compare')),
                    
    async execute(interaction) {
      try {

      
        let game = interaction.options.getString('game');
        let newDump = interaction.options.getString('newdump');
        let oldDump = interaction.options.getString('olddump');

        //const logChannelServer = interaction.guild.channels.fetch("1024961321768329249").catch(err => console.log(err))
        await interaction.deferReply({ ephemeral: true })
        if(game == null) {
        
          fs.readFile(jsonLocation, "utf-8", function(err, gameData){  
              gameData = JSON.parse(gameData)
              
              let dumpList = {}
              
              for(const game in gameData) {
                  try {
                  dumpList[game] = gameData[game].lastDump
                  }    
                  catch (err) {
                  console.log(err)
                  }
              }
              let dumpListString = JSON.stringify(dumpList).replaceAll(",", "\n\n").replace("{", "").replace("}", "").replaceAll('"', '`')
              
              
              let videoEmbed = new EmbedBuilder()
                  .setTitle("Current dumps")  
                  .setDescription(dumpListString)
          
          
              
              
              interaction.editReply({embeds:[videoEmbed],  ephemeral: true })
              
          })
          return
      
      }
      
      if(newDump != null) {
        if(game == "valorant") {
          parseDump(newDump, oldDump, "valorant", bot)
          return
        }
          fs.readFile(jsonLocation, "utf-8", function(err, gameData){  
          gameData = JSON.parse(gameData)
          let lastDump = gameData[game].lastDump
          gameData[game].lastDump = newDump
              try {
              fs.writeFile(jsonLocation, JSON.stringify(gameData, null, 2), (err) => {
                  if (err)
                  console.log(err);
                  else {
                    console.log("File written successfully\n");
                  
                  
                  }})
                  try{
                  console.log("trying to set dump")
                  if(oldDump == null) { 
                      oldDump = lastDump
                      console.log("No oldDump provided, using stored")}
                  } catch (err) {
                  console.log(err)
                  }
                  try {
                    console.log("checking for changes")
                    checkForChanges(newDump, oldDump, game, interaction)
                  } catch(err) {
                      console.log(err)
                  }
              }    
              catch (err) {
              console.log(err)
              }
          })
          
          
             
              
            }
  
          
          
          
      } catch (err){
      console.log("failed somewhere: \n", err, "\n\n")
    }}
};

async function checkForChanges(newDumpString, oldDumpString, game, interaction) {
    let newDump = await axios.get(newDumpString)
    let oldDump = await axios.get(oldDumpString)
    newDump = newDump.data
    oldDump = oldDump.data
  
    let updateObject = {}
    let oldVideos = []
    console.log("Sorting old videos")
    Object.values(oldDump.videos).forEach(video =>{
      oldVideos.push(video.title)
    })

    
    Object.values(newDump.videos).forEach(vid => {

      if(!oldVideos.includes(vid.title)) {
        //console.log(vid.title)
        updateObject[vid.title] = {"courseTitle": null,"courseuuid":null,"videoTitle":vid.title, "videouuid": vid.uuid,"link":null,"tag": null,"tId": vid.tId}
        for(const video in updateObject) {
            //console.log(updateObject[video].videouuid, "video")
           for(const course in newDump.videosToCourses) {
            
            
            //console.log(newDump.videosToCourses[course].chapters)
      
            if(newDump.videosToCourses[course].chapters[0].vids.find(item => item.uuid == updateObject[video].videouuid) != undefined ) {
              //console.log(newDumpm.videosToCourses[course])
              updateObject[video].courseTitle = course
            }
  
            
            
          }
          
          if (newDump.courses.find(item => item.title == updateObject[video].courseTitle) != undefined) {
  
            updateObject[video].courseuuid = newDump.courses.find(item => item.title == updateObject[video].courseTitle).uuid
            if(newDump.courses.find(item => item.title == updateObject[video].courseTitle).tags[0] == null) {
                console.log("tag was null from dump")
                updateObject[video].tag = "All Classes"
            } else {
            updateObject[video].tag = newDump.courses.find(item => item.title == updateObject[video].courseTitle).tags[0]
          }}
          updateObject[video].link = `https://www.skill-capped.com/${game}/browse3/course/${updateObject[video].videouuid}/${updateObject[video].courseuuid}`
          
  
        }
      }
      
    })
    
  
    await createEmbed(updateObject, game, interaction)
    
    
  
  }

  
async function createEmbed(uploads, game, interaction)  {
    
    let breakdown = {}
    let failed = []
    fs.readFile(jsonLocation, "utf-8", function(err, data) {

      data = JSON.parse(data)
      Object.keys(data[game].roleDict).forEach(tags => {
        breakdown[tags] = []
      })
      for(const video in uploads){
        Object.keys(data[game].roleDict).forEach(tags => {
            try {
                if(uploads[video].tag.includes(tags)) {
                    breakdown[tags].push(uploads[video])
                    
                  }
            } catch(err) {
                console.log(err)
                console.log(uploads[video])
                failed.push(uploads[video])
                

            }
          
        })
  
      }
        
    interaction.editReply({contents:`Will now attempt to post all videos.`, ephemeral:true})
    const forLoop = async _ => {
        console.log("start")
        
        
        for(const tag in breakdown) {
            console.log(breakdown[tag].length, tag)
            if(breakdown[tag].length == 0) {
                console.log("No videos uploaded for: ", tag)
                continue
            }
            //console.log(data[game].logChannelID.toString())
            let videoChannel = await bot.channels.fetch(data[game].roleDict[tag].channelid.toString()).catch(err => {
                if(err.toString().startsWith("DiscordAPIError[10003]: Unknown Channel")){
                    console.log(err)
                    console.log("erred")
                    //interaction.editReply({contents:`This channel does not exist in this server: ${tag} ( Set to: ${data[game].roleDict[tag].channelid.toString()})`, ephemeral:true})
                    return
                }
            })
            
            await videoChannel.send(`<@&${data[game].roleDict[tag].id}>`)
            breakdown[tag].forEach(video => {
                
            let videoEmbed = new EmbedBuilder()
                .setTitle(video.courseTitle)  
                .setAuthor({ name: `A new Skill-Capped video has been released!`, iconURL: "https://media.discordapp.net/attachments/991013102688555069/994302850580631622/unknown.png"})
                .setDescription(`${video.videoTitle}\n[click here to watch](${video.link})`)
                .setImage(`https://skillcappedzencoder.s3.amazonaws.com/${video.videouuid}/thumbnails/thumbnail_medium_${video.tId}.jpg`)
            //.setFooter({text:"This submission is unclaimed"})
            //.setThumbnail(data[game].roleDict[tag].img)
            if(data[game].roleDict[tag].img == "") {
                videoEmbed.setThumbnail(`https://media.discordapp.net/attachments/991013102688555069/994302850580631622/unknown.png`)
            } else {
                videoEmbed.setThumbnail(data[game].roleDict[tag].img)
            }
            
            
            videoChannel.send({embeds:[videoEmbed]})
            
            })
        
      }}
      forLoop()
      console.log("done")
     
    })
    await interaction.editReply({contents:`Dump upload completed`, ephemeral:true}).catch(err => console.log(err))
    
  }

 