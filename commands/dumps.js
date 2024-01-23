const axios = require("axios");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { parseDump } = require("../components/functions/dumps/valorantDumps");
const { cLog } = require("../components/functions/cLog");

const jsonLocation = "./gameData.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dumps")
    .setDescription("close the review")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("the game you wish to update")
        .addChoices({ name: "valorant", value: "valorant" },
        { name: "wrath", value: "wrath" },
        { name: "wow", value: "wow" })
    )
    .addStringOption((option) =>
      option
        .setName("newdump")
        .setDescription("The new dump you want to upload")
    )
    .addStringOption((option) =>
      option
        .setName("olddump")
        .setDescription("the old dump it uses to compare")
    ),

  async execute(interaction) {
    try {
      let game = interaction.options.getString("game");
      let newDump = interaction.options.getString("newdump");
      let oldDump = interaction.options.getString("olddump");

      //const logChannelServer = interaction.guild.channels.fetch("1024961321768329249").catch(err => console.log(err))
      await interaction.deferReply({ ephemeral: true });
      if (game == null) {
        fs.readFile(jsonLocation, "utf8", function (err, gameData) {
          gameData = JSON.parse(gameData);

          let dumpList = {};

          for (const game in gameData) {
            try {
              dumpList[game] = gameData[game].lastDump;
            } catch (err) {
              console.log(err);
            }
          }
          let dumpListString = JSON.stringify(dumpList)
            .replaceAll(",", "\n\n")
            .replace("{", "")
            .replace("}", "")
            .replaceAll('"', "`");

          let videoEmbed = new EmbedBuilder()
            .setTitle("Current dumps")
            .setDescription(dumpListString);

          interaction.editReply({ embeds: [videoEmbed], ephemeral: true });
        });
        return;
      }
      if (newDump != null) {
        fs.readFile(jsonLocation, "utf8", function (err, gameData) {
          gameData = JSON.parse(gameData);
          let lastDump = gameData[game].lastDump;
          gameData[game].lastDump = newDump;
          fs.writeFile(jsonLocation, JSON.stringify(gameData, null, 2), (err) => {
              if (err)
                cLog(["ERROR :" + err], {guild: interaction.guildId,subProcess: "Dumps"});
              else {
                cLog(["Succesfully wrote file"], {guild: interaction.guildId,subProcess: "Dumps"});
              }
            });
            try {
              cLog(["Trying to set dump"], {
                guild: interaction.guildId,
                subProcess: "Dumps",
              });
              if (oldDump == null) {
                oldDump = lastDump;
                cLog(["No oldDump provided, using stored"], {
                  guild: interaction.guildId,
                  subProcess: "Dumps",
                });
              }
            } catch (err) {
              cLog(["ERROR :" + err], {
                guild: interaction.guildId,
                subProcess: "Dumps",
              });
            }
            try {
              cLog(["Checking for changes"], {
                guild: interaction.guildId,
                subProcess: "Dumps",
              });
              if (game == "valorant") {
                parseDump(newDump, oldDump, "valorant", interaction.client);
                return;
              }
              if(game == "wrath" || game == "wow") {
                checkForChanges(newDump, oldDump, game, interaction)
              }
            } catch (err) {
              console.log(err);
            }
          
        });
        
      }
    } catch (err) {
      cLog(["Failed somewhere: \n" + err + "\n\n"], {
        guild: interaction.guildId,
        subProcess: "Dumps",
      });
    }
  },
};

async function checkForChanges(
  newDumpString,
  oldDumpString,
  game,
  interaction,
) {
  let newDump = await axios.get(newDumpString);
  let oldDump = await axios.get(oldDumpString);
  newDump = newDump.data;
  oldDump = oldDump.data;
  let updateObject = {};
  let oldVideos = [];
  cLog(["Sorting old videos"], {
    guild: interaction.guildId,
    subProcess: "Dumps",
  });

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
          updateObject[video].courseuuid = newDump.courses.find(
            (item) => item.title == updateObject[video].courseTitle
          ).uuid;
          if (
            newDump.courses.find(
              (item) => item.title == updateObject[video].courseTitle
            ).tags[0] == null
          ) {
            cLog(["Tag was null from dumps. Default 'All Classes'"], {
              guild: interaction.guildId,
              subProcess: "Dumps",
            });
            updateObject[video].tag = "All Classes";
          } else {
            updateObject[video].tag = newDump.courses.find(
              (item) => item.title == updateObject[video].courseTitle
            ).tags[0];
          }
        }
        updateObject[
          video
        ].link = `https://www.skill-capped.com/${game}/browse/course/${updateObject[video].videouuid}/${updateObject[video].courseuuid}`;
      }
    }
  });
  await interaction.editReply({content:"Dump parsed. Now attempting to post"})
  .then(message => {
    createEmbed(updateObject, game, interaction)
  })
}

async function createEmbed(uploads, game, interaction) {
  let breakdown = {};
  let failed = [];
  fs.readFile(jsonLocation, "utf8", function (err, data) {
    data = JSON.parse(data);
    Object.keys(data[game].roleDict).forEach((tags) => {
      breakdown[tags] = [];
    });
    for (const video in uploads) {
      for (tags of Object.keys(data[game].roleDict)) {
        try {
          if (uploads[video].tag.includes(tags)) {
            if (uploads[video].tag.includes("Demon Hunter")) {
              breakdown["Demon Hunter"].push(uploads[video]);
              break;
            }
            breakdown[tags].push(uploads[video]);
            break;
          }
        } catch (err) {
          console.log(err);
          console.log(uploads[video]);
          failed.push(uploads[video]);
        }
      }
    }
    cLog(["THESE FAILED: " + failed], {
      guild: interaction.guildId,
      subProcess: "Dumps",
    });
    const forLoop = async (_) => {
      for (const tag in breakdown) {
        if (breakdown[tag].length == 0) {
          cLog(["No videos uploaded for: " + tag], {
            guild: interaction.guildId,
            subProcess: "Dumps",
          });
          continue;
        }
        cLog([breakdown[tag].length + " " + tag], {
          guild: interaction.guildId,
          subProcess: "Dumps",
        });

        //console.log(data[game].logChannelID.toString())
        let videoChannel = await interaction.client.channels
          .fetch(data[game].roleDict[tag].channelid.toString())
          .catch((err) => {
            if (err.toString().startsWith("DiscordAPIError[10003]: Unknown Channel")) {
              cLog([err], { guild: interaction.guildId, subProcess: "Dumps" });
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
                "https://media.discordapp.net/attachments/991013102688555069/994302850580631622/unknown.png",
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
      }
    };

    forLoop().then(() => {
      cLog(["COMPLETED"], { guild: interaction.guildId, subProcess: "Dumps" });
      
    });
  });
  //await interaction.editReply({contents:`Dump upload completed`, ephemeral:true}).catch(err => console.log(err))
}
