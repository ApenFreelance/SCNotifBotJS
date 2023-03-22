const { default: axios } = require('axios');
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const fs = require("fs");





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
        let game = interaction.options.getString('game');
        let newDump = interaction.options.getString('newdump');
        let oldDump = interaction.options.getString('olddump');
        console.log(game, newDump, oldDump)
        if(game == null) {
            console.log("hi")
            fs.readFile("./gameData.json", "utf-8", function(err, gameData){  
                gameData = JSON.parse(gameData)
               
                let dumpList = {}
                console.log(gameData)
                for(const game in gameData) {
                  try {
                    dumpList[game] = gameData[game].lastDump
                  }    
                  catch (err) {
                    console.log(err)
                  }
                }
                let dumpListString = JSON.stringify(dumpList).replaceAll(",", "\n\n").replace("{", "").replace("}", "").replaceAll('"', '`')
                
                console.log(dumpListString)
                let videoEmbed = new EmbedBuilder()
                    .setTitle("Current dumps")  
                    .setDescription(dumpListString)
            
            
               
                
                interaction.reply({embeds:[videoEmbed]})
                
            })
            return
      
        }
      
        if(newDump != null) {
          fs.readFile("./gameData.json", "utf-8", function(err, gameData){  
            gameData = JSON.parse(gameData)
            
            
              try {
                
                updatedDump = newDump
                fs.writeFile("./gameData.json", JSON.stringify(gameData, null, 2), (err) => {
                  if (err)
                    console.log(err);
                  else {
                    console.log("File written successfully\n");
                    
                    
                  }})
                  try{
                    console.log("trying to set dump")
                    if(oldDump == null) { 
                        oldDump = updatedDump
                        console.log("No oldDump provided, using stored")}
                  } catch (err) {
                    console.log(err)
                  }
                  try {
                    console.log("checking for changes")
                      checkForChanges(newDump, oldDump, game)
                  } catch(err) {
                      console.log(err)
                  }
              }    
              catch (err) {
                console.log(err)
              }
            })
            
            
            // Display the file content
            
          }

        
        
        
    }
};

async function checkForChanges(newDumpString, oldDumpString, game) {
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
        console.log("new video added")
        updateObject[vid.title] = {"courseTitle": null,"courseuuid":null,"videoTitle":vid.title, "videouuid": vid.uuid,"link":null,"tag": null,"tId": vid.tId}
        for(const video in updateObject) {
          //console.log(updateObject[video].videouuid, "video")
           for(const course in newDump.videosToCourses) {
            
            
            //console.log(newDump.videosToCourses[course].chapters)
      
            if(newDump.videosToCourses[course].chapters[0].vids.find(item => item.uuid == updateObject[video].videouuid) != undefined ) {
              
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
          
  
        }
      }
      
    })
    
  
    await createEmbed(updateObject, game)
    
    
  
  }

  
async function createEmbed(uploads, game)  {
    let breakdown = {}
    let failed = []
    fs.readFile("./gameData.json", "utf-8", function(err, data) {
      data = JSON.parse(data)
      Object.keys(data[game].roleDict).forEach(tags => {
        breakdown[tags] = []
      })
      for(const video in uploads){
        Object.keys(data[game].roleDict).forEach(tags => {
            try {
                if(uploads[video].tag.includes(tags)) {
                    breakdown[tags].push(uploads[video])
                    console.log("worked")
                  }
            } catch(err) {
                console.log(err)
                console.log(uploads[video])
                failed.push(uploads[video])
                

            }
          
        })
  
      }
        
    console.log(failed)
    const forLoop = async _ => {
        console.log("start")
        for(const tag in breakdown) {
            let logChannel = await interaction.channels.fetch(channelid)
            console.log(logChannel, "log")
            logChannel.send(`<@${logChannel}`)
            breakdown[tag].forEach(video => {
            let videoEmbed = new EmbedBuilder()
            .setTitle(video.courseTitle)  
            .setAuthor({ name: `A new Skill-Capped video has been released!`, iconURL: "https://media.discordapp.net/attachments/991013102688555069/994302850580631622/unknown.png"})
            .setDescription(`${video.videoTitle}\n(click here to watch)[${video.link}]`)
            //.setThumbnail(charInfo.characterImage)
            //.setFooter({text:"This submission is unclaimed"})
            .setThumbnail(data[game][tag].img)
            if(data[game][tag].img == "") {
                videoEmbed.setImage(`https://skillcappedzencoder.s3.amazonaws.com/${video.videouuid}/thumbnails/thumbnail_medium_${value['tId']}.jpg`)
            } else {
                videoEmbed.setImage(data[game][tag].img)
            }
            console.log(videoEmbed)
            return
            logChannel.send({embeds:[videoEmbed]})
            process.exit()
            })
        
      }}
      forLoop()
      console.log("done")
     
    })
    
  }

  async function getChannel(channelid) {
    return bot.channels.fetch(channelid)
  }