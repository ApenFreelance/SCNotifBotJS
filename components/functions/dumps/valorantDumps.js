const { default: axios } = require("axios");
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

async function parseDump(newDumpString, oldDumpString, game, bot) {
  let newDump = await axios.get(newDumpString);
  let oldDump = await axios.get(oldDumpString);
  newDump = newDump.data;
  oldDump = oldDump.data;

  let updateObject = {};
  let oldVideos = [];
  console.log("Sorting old videos");
  Object.values(oldDump.videos).forEach((video) => {
    oldVideos.push(video.title);
  });
  Object.values(newDump.videos).forEach((vid) => {
    if (!oldVideos.includes(vid.title)) {
      //console.log(vid.title)
      updateObject[vid.title] = {
        courseTitle: null,
        courseuuid: null,
        videoTitle: vid.title,
        videouuid: vid.uuid,
        link: null,
        tag: null,
        tId: vid.tId,
      };
    }
  });
  for (const video in updateObject) {
    //console.log(updateObject[video].videouuid, "video")
    for (const course in newDump.videosToCourses) {
      //console.log(newDump.videosToCourses[course].chapters)

      if (
        newDump.videosToCourses[course].chapters[0].vids.find(
          (item) => item.uuid == updateObject[video].videouuid
        ) != undefined
      ) {
        //console.log(newDumpm.videosToCourses[course])
        updateObject[video].courseTitle = course;
      }
    }
    if (
      newDump.courses.find(
        (item) => item.title == updateObject[video].courseTitle
      ) != undefined
    ) {
      //console.log(updateObject)
      updateObject[video].courseuuid = newDump.courses.find(
        (item) => item.title == updateObject[video].courseTitle
      ).uuid;
      updateObject[video].tag = newDump.courses.find(
        (item) => item.title == updateObject[video].courseTitle
      ).tags[0];
      /*           if(newDump.courses.find(item => item.title == updateObject[video].courseTitle).tags[0] == null) {
                console.log("tag was null from dump")
                updateObject[video].tag = "All Classes"
            } else {
            
            //console.log(updateObject[video])
          } */
    }
    updateObject[
      video
    ].link = `https://www.skill-capped.com/${game}/browse3/course/${updateObject[video].videouuid}/${updateObject[video].courseuuid}`;
  }

  let interaction;
  await createEmbed(updateObject, game, interaction, bot);
}
const jsonLocation = "gameData.json";
async function createEmbed(uploads, game, interaction, bot) {
  let breakdown = {};
  let failed = [];
  fs.readFile(jsonLocation, "utf-8", function (err, data) {
    data = JSON.parse(data);
    Object.keys(data[game].roleDict).forEach((tags) => {
      breakdown[tags] = [];
    });
    const videoAmountFound = Object.keys(uploads).length;
    console.log(videoAmountFound, "total videos for upload");
    for (const video in uploads) {
      switch (uploads[video].tag) {
        case "Agent":
        case "Coaching":
          //console.log("\n",video, "\n",Object.entries(data[game].agents).filter(([key, value])=> video.includes(key) || video.includes("Yoru")))
          let whatAgent = Object.entries(data[game].agents).filter(
            ([key, value]) => video.includes(key)
          );

          if (whatAgent.length > 1) {
            console.log("[TOO MANY AGENTS]", video, whatAgent);
            failed[video] = uploads[video];
            break;
          }
          breakdown[whatAgent[0][1]].push(uploads[video]);
          break;
        case "Mastermind":
          breakdown["Mastermind"].push(uploads[video]);
          break;

        default:
          if (video.includes("Radiant Earpiece")) {
            breakdown["Radiant Earpiece"].push(uploads[video]);
            break;
          } else if (video.toLowerCase().includes("mastermind")) {
            breakdown["Mastermind"].push(uploads[video]);
            break;
          }
          breakdown["All Videos"].push(uploads[video]);
          break;
      }
    }

    //interaction.editReply({contents:`Will now attempt to post all videos.`, ephemeral:true})
    const forLoop = async (_) => {
      console.log("start");
      console.log(breakdown["Maps"]);
      let videosGettingPosted = 0;
      for (const key in breakdown) {
        console.log("[", key, "]", breakdown[key].length);
        videosGettingPosted += breakdown[key].length;
      }
      console.log("[ TOTAL ]", videosGettingPosted);
      if (videoAmountFound != videosGettingPosted) {
        console.log(
          "[ ERROR ] Should be",
          videoAmountFound,
          "but was actually",
          videosGettingPosted
        );
        return;
      }

      for (const tag in breakdown) {
        console.log(breakdown[tag].length, tag);
        if (breakdown[tag].length == 0) {
          console.log("No videos uploaded for: ", tag);
          continue;
        }
        //console.log(data[game].logChannelID.toString())
        let videoChannel = await bot.channels
          .fetch(data[game].roleDict[tag].channelid.toString())
          .catch((err) => {
            if (
              err
                .toString()
                .startsWith("DiscordAPIError[10003]: Unknown Channel")
            ) {
              console.log(err);
              console.log("erred");
              //interaction.editReply({contents:`This channel does not exist in this server: ${tag} ( Set to: ${data[game].roleDict[tag].channelid.toString()})`, ephemeral:true})
              return;
            }
          });

        await videoChannel.send(`<@&${data[game].roleDict[tag].id}>`);
        breakdown[tag].forEach((video) => {
          let videoEmbed = new EmbedBuilder()
            .setTitle(video.courseTitle)
            .setAuthor({
              name: `A new Skill-Capped video has been released!`,
              iconURL:
                "https://media.discordapp.net/attachments/1065568610132697159/1110677308555137054/Skillcapped_Logo.jpg?width=585&height=585",
            })
            .setDescription(
              `${video.videoTitle}\n[click here to watch](${video.link})`
            )
            .setImage(
              `https://skillcappedzencoder.s3.amazonaws.com/${video.videouuid}/thumbnails/thumbnail_medium_${video.tId}.jpg`
            );
          //.setFooter({text:"This submission is unclaimed"})
          //.setThumbnail(data[game].roleDict[tag].img)
          if (data[game].roleDict[tag].img == "") {
            videoEmbed.setThumbnail(
              `https://media.discordapp.net/attachments/991013102688555069/994302850580631622/unknown.png`
            );
          } else {
            videoEmbed.setThumbnail(data[game].roleDict[tag].img);
          }

          videoChannel.send({ embeds: [videoEmbed] });
        });
        console.log("done");
      }
    };
    forLoop();
  });
  //await interaction.editReply({contents:`Dump upload completed`, ephemeral:true}).catch(err => console.log(err))
}
module.exports = { parseDump };
