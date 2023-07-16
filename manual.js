const { default: axios } = require("axios")
require("dotenv").config();
const fs = require("fs");
const { stringify } = require("querystring");
async function verifyEmailExists() {
    console.log("Verifying Email")
    const response = await axios.post('https://www.skill-capped.com/lol/api/new/loginv2', { email:process.env.mail, password:process.env.pass})
    console.log(response.data)
    if (response.success == false) { 
      return(false, "Wrong email or password")
    }

    
    if(response.data.data.fsData.user.role == "SC_ROLE_PAID_USER") {
      return(true, "User has active account")
    }
    if(response.data.data.fsData.user.role == "SC_ROLE_FREE_USER") {
      return(false, "User has free account")
    }
    else {
      console.log(response.data.data.fsData.user.role)
    }
    return response.data.available
  }

async function getIt() {
  let a = 13
  let j = {}
  while (a < 14) {
  const response = await axios.get(`https://eu.battle.net/oauth?code=MjEzMjczMDY3ZmJlNDYwN2FlNTg4YWE1NmI3ZGNmZGQ6cEhORnJXSmJHV0RiS253Z3BEM3hZYWpBSXdsdm91dko`)
    f = []
    console.log(response.data)
    response.data.specializations.forEach(spec => {
      f.push(spec.name)
    })
    j[response.data.name] += f

    a+=1
  }
  console.log(j)
}


//updateValues("1oCLc7RGXaK79gewCkhm1s30QD9zQ3KiZs3fPoPBg7LM", `A${verifiedAccount.userID}`, "USER_ENTERED", verifiedAccount.userID)

async function updateValues(spreadsheetId, range, valueInputOption, _values) {
  const {GoogleAuth} = require('google-auth-library');
  const {google} = require('googleapis');

  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const service = google.sheets({version: 'v4', auth});
  let values = [
    [
      // Cell values ...
    ],
    // Additional rows ...
  ];
  const resource = {
    values,
  };
  try {
    const result = await service.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    });
    console.log('%d cells updated.', result.data.updatedCells);
    return result;
  } catch (err) {
    // TODO (Developer) - Handle exception
    throw err;
  }
}



async function dumpFunction(game, newDump, oldDump) {
  //const game = interaction.options.getString('game');
  //const newDump = interaction.options.getString('newdump');
  //const oldDump = interaction.options.getString('olddump');


  if(game == null) {
      fs.readFile("./gameData.json", "utf-8", function(err, gameData){  
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
          let dumpListString = JSON.stringify(dumpList).replace(",", "\n").replace("{", "").replace("}", "")
          console.log(dumpListString)
          
          // Display the file content
          console.log(gameData, dumpList);
          
      })

  }

  if(newDump != null) {
    fs.readFile("./gameData.json", "utf-8", function(err, gameData){  
      gameData = JSON.parse(gameData)
      console.log(gameData[game])
      try{
        if(oldDump == null) { oldDump = gameData[game].lastDump}
      } catch (err) {
        console.log(err)
      }
      
        try {
          
          gameData[game].lastDump = newDump
          fs.writeFile("./gameData.json", JSON.stringify(gameData, null, 2), (err) => {
            if (err)
              console.log(err);
            else {
              console.log("File written successfully\n");
              
              
            }})
        }    
        catch (err) {
          console.log(err)
        }
      })
      
      
      // Display the file content
      
    }
  }
  


  
  

async function checkForChanges(newDumpString, oldDumpString) {
  let newDump = await axios.get(newDumpString)
  let oldDump = await axios.get(oldDumpString)
  newDump = newDump.data
  oldDump = oldDump.data

  let updateObject = {}
  let oldVideos = []
  Object.values(oldDump.videos).forEach(video =>{
    oldVideos.push(video.title)
  })
  Object.values(newDump.videos).forEach(vid => {

    

    if(!oldVideos.includes(vid.title)) {
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
          updateObject[video].tag = newDump.courses.find(item => item.title == updateObject[video].courseTitle).tags[0]
        }
        

      }
    }
    
  })
  

  createEmbed(updateObject, "wow")
  
  

}


//checkForChanges("https://lol-content-dumps.s3.amazonaws.com/courses_v2/wow/course_dump_1674624635709.json", "https://lol-content-dumps.s3.amazonaws.com/courses_v2/wow/course_dump_1677799755405.json")




const {main, authorize} = require("./components/functions/googleApi")
const forSpread = [
  {
    "range": `B2`,
    "values": [
      [
        "WORKS"
      ]
    ]
  }
]






function createAccessToken(apiKey, apiSecret, region = 'eu') {
  return new Promise((resolve, reject) => {
      let credentials = Buffer.from(`${apiKey}:${apiSecret}`);

      const requestOptions = {
          host: `${region}.battle.net`,
          path: '/oauth/token',
          method: 'POST',
          headers: {
              'Authorization': `Basic ${credentials.toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      };

      let responseData = '';

      function requestHandler(res) {
          res.on('data', (chunk) => {
              responseData += chunk;
              console.log(chunk)
          });
          res.on('end', () => {
              let data = JSON.parse(responseData);
              resolve(data);
              console.log(data)
          });
      }
      console.log(responseData)
      let request = require('https').request(requestOptions, requestHandler);
      request.write('grant_type=client_credentials');
      request.end();
      console.log(request)
      request.on('error', (error) => {
          reject(error);
      });
  });
}


//createAccessToken("213273067fbe4607ae588aa56b7dcfdd", "pHNFrWJbGWDbKnwgpD3xYajAIwlvouvJ")
const blizzard = require('blizzard.js')
const wowClient = blizzard.wow.createInstance({
  key: process.env.BCID,
  secret: process.env.BCS,
  origin: 'us', // optional
  locale: 'en_US', // optional
  token: '', // optional
})

//parseDump("https://lol-content-dumps.s3.amazonaws.com/courses_v2/valorant/course_dump_1684120339425.json", "https://lol-content-dumps.s3.amazonaws.com/courses_v2/valorant/course_dump_1682641484587.json", "valorant")
async function parseDump(newDumpString, oldDumpString, game){
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
      }
      
    })
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
          //console.log(updateObject)
          
          updateObject[video].courseuuid = newDump.courses.find(item => item.title == updateObject[video].courseTitle).uuid
          updateObject[video].tag = newDump.courses.find(item => item.title == updateObject[video].courseTitle).tags[0]
/*           if(newDump.courses.find(item => item.title == updateObject[video].courseTitle).tags[0] == null) {
              console.log("tag was null from dump")
              updateObject[video].tag = "All Classes"
          } else {
          
          //console.log(updateObject[video])
        } */
      }
        updateObject[video].link = `https://www.skill-capped.com/${game}/browse3/course/${updateObject[video].videouuid}/${updateObject[video].courseuuid}`

      }

    
    let interaction
    await createEmbed(updateObject, game, interaction)
    
    
  
  }    
  const jsonLocation = "./testGameData.json"
  async function createEmbed(uploads, game, interaction)  {
    
    let breakdown = {}
    let failed = []
    fs.readFile(jsonLocation, "utf-8", function(err, data) {

      data = JSON.parse(data)
      Object.keys(data[game].roleDict).forEach(tags => {
        breakdown[tags] = []
      })
      const videoAmountFound =Object.keys(uploads).length
      console.log(videoAmountFound, "total videos for upload")
      for(const video in uploads){
        
        switch(uploads[video].tag){
          case "Agent":
          case "Coaching":
            //console.log("\n",video, "\n",Object.entries(data[game].agents).filter(([key, value])=> video.includes(key) || video.includes("Yoru")))
            let whatAgent = Object.entries(data[game].agents).filter(([key, value])=> video.includes(key))
            
          if(whatAgent.length > 1 ) {
            console.log("[TOO MANY AGENTS]", video, whatAgent)
            failed[video] = uploads[video]
            continue;
          }
            breakdown[whatAgent[0][1]].push(uploads[video])
            break;
          case "Maps":
            breakdown["Maps"].push(uploads[video].videouuid)
            break;
          
          default:
            breakdown["All Videos"].push(uploads[video].videouuid)
            break;

        }
      }
        
    //interaction.editReply({contents:`Will now attempt to post all videos.`, ephemeral:true})
    const forLoop = async _ => {
        console.log("start")
      console.log(breakdown["Maps"])
      let videosGettingPosted =0
      for(const key in breakdown){
        console.log("[",key, "]", breakdown[key].length)
        videosGettingPosted+= breakdown[key].length
      }
      console.log("[ TOTAL ]", videosGettingPosted)
      if(videoAmountFound != videosGettingPosted) {
        console.log("[ ERROR ] Should be", videoAmountFound, "but was actually", videosGettingPosted)
        return
      }
        
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
    //await interaction.editReply({contents:`Dump upload completed`, ephemeral:true}).catch(err => console.log(err))
    
  }



function loopTest() {
  let uploads = {"Hunter":[], "Demon Hunter":[], "Warrior":[], "Spice":[]}
  let tagger = ["Hunter", "Demon Hunter", "Warrior"]
  let breakdown= {"Hunter":[], "Demon Hunter":[], "Warrior":[], "Spice":[]}
  for(video in uploads){
    let i = 0
    for(let tags of tagger) {
      i++
       console.log(video, "video", tags, "tags", i)
       if(video == tags){
        console.log("MaTch", video, tags)
        
        break
       }
      
    }

  }
  console.log(breakdown)
}


loopTest()