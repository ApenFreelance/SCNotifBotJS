const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi.js");
const blizzard = require("blizzard.js");
const classes = require("../classes.json");
require("dotenv").config();
const { createWaitingForReviewMessage } = require("../components/actionRowComponents/createWaitingForReview.js");
const { cLog } = require("../components/functions/cLog.js");
const { getCorrectTable } = require("../src/db.js");


module.exports = {
  name: "submitReview",
  once: false,
  async execute(interaction, server) {
    try {
      let sheetBody = null;
      let characterData = null;
      let linkToUserPage = null;
      let userAccount = null;
      let wowClient = null;
      let accountName = null;
      let accountRegion = null;
      let accountSlug = null;
      let improvement = interaction.fields.getTextInputValue("improvementinput");
      // get correct link to user page
      let reviewHistory = await getCorrectTable(server.serverId, "reviewHistory")
      if(server.serverName== "WoW") {
        linkToUserPage = interaction.fields.getTextInputValue("armory");
        userAccount = decodeURI(linkToUserPage)
          .replace("https://worldofwarcraft.com/", "")
          .replace("https://worldofwarcraft.blizzard.com/", "")
          .replace("/character/", "/")
          .split("/");
        accountRegion = userAccount[1] 
        accountSlug = userAccount[2] 
        accountName = userAccount[3] 
        // Create a WoW Client connection
        wowClient = connectToWoW(interaction)
        try {
          characterData = await getCharacterInfo(accountRegion,accountSlug,accountName,wowClient,linkToUserPage,interaction.guildId);
        } catch (err) {
          if (err.response.status != 404) {
            console.log("failed to get character info: ", err);
          }
          characterData = null;
          console.log("Failed to get char, because char doesnt exist or couldnt be found");
        }
      } 
      else if (server.serverName == "Valorant") {
        linkToUserPage = interaction.fields.getTextInputValue("tracker");
        userAccount = decodeURI(linkToUserPage)
          .replace("https://tracker.gg/valorant/profile/riot/", "")
          .replace("%23", "#")
          .replace("/overview/", "/")
          .split("/");
        accountName = userAccount[0]
        accountRegion = userAccount[1]
        characterData = getValorantStats(interaction, accountName, accountRegion, reviewHistory)
      } 
      else {
        await interaction.editReply({content:"This server is unknown", ephemeral:true})
        return
      }
      
      //console.log(verifiedAccount, created)
      let [verifiedAccount, created] = await reviewHistory.findOrCreate({
        where: { userID: interaction.user.id },
        defaults: {
          status: "Available",
          userEmail: interaction.fields.getTextInputValue("email"),
          userTag: interaction.user.username,
          clipLink: interaction.fields.getTextInputValue("ytlink"),
        },
        order: [["CreatedAt", "DESC"]],
      });

      if (created) {
        // if a new entry is created there is no reason to check the rest
        try {
          await createWaitingForReviewMessage(interaction,characterData,verifiedAccount,improvement,linkToUserPage,accountName);
          await interaction.editReply({
            content: `Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`,
            ephemeral: true,
          });
        } catch (err) {
          console.log("Failed when responding or creating message for review for NEW user",err);
          await interaction.editReply({content: `Something went wrong registering new user.`,ephemeral: true});
        }
        let submissionPos = verifiedAccount.id;
        if(server.serverName == "WoW") {
          if(characterData == null) {
            sheetBody = createSheetBody(submissionPos, {status:verifiedAccount.status, createdAt:verifiedAccount.createdAt, id:verifiedAccount.id, userID:verifiedAccount.userID, userEmail:verifiedAccount.userEmail, clipLink:verifiedAccount.clipLink, armoryLink:linkToUserPage})
          } else {
            sheetBody = createSheetBody(submissionPos, {status:verifiedAccount.status, createdAt:verifiedAccount.createdAt, id:verifiedAccount.id, userID:verifiedAccount.userID, userEmail:verifiedAccount.userEmail, clipLink:verifiedAccount.clipLink, armoryLink:linkToUserPage,
              charClass:characterData.characterClass, twovtwo:characterData.twoVtwoRating, threevthree:characterData.threeVthreeRating, solo1:characterData.soloShuffleSpec1Rating, solo2:characterData.soloShuffleSpec2Rating, solo3:characterData.soloShuffleSpec3Rating, solo4:characterData.soloShuffleSpec4Rating})
          }
          await updateGoogleSheet(sheetBody)
        }
        await interaction.editReply({
          content: `Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`,
          ephemeral: true,
        });
        return;
      }

      if (Date.now() - 2629743 * 1000 <= verifiedAccount.createdAt) {
        // 30 day reduction
        await interaction.editReply({content: `You can send a new submission in <t:${verifiedAccount.createdAt / 1000 + 2629743}:R> ( <t:${verifiedAccount.createdAt / 1000 + 2629743}> )`,ephemeral: true});
        return;
      }

      // if none of the ones apply, create new entry
      verifiedAccount = await reviewHistory.create({
        userEmail: interaction.fields.getTextInputValue("email"),
        userID: interaction.user.id,
        status: "Available",
        userTag: interaction.user.username,
        clipLink: interaction.fields.getTextInputValue("ytlink"),
      });

      
      
      await createWaitingForReviewMessage(interaction,characterData,verifiedAccount,improvement,linkToUserPage,accountName);
      let submissionPos = verifiedAccount.id;
      if(server.serverName == "WoW") {
        
        if(characterData == null) {
          sheetBody = createSheetBody(submissionPos, {status:verifiedAccount.status, createdAt:verifiedAccount.createdAt, id:verifiedAccount.id, userID:verifiedAccount.userID, userEmail:verifiedAccount.userEmail, clipLink:verifiedAccount.clipLink, armoryLink:linkToUserPage})
        } else {
          sheetBody = createSheetBody(submissionPos, {status:verifiedAccount.status, createdAt:verifiedAccount.createdAt, id:verifiedAccount.id, userID:verifiedAccount.userID, userEmail:verifiedAccount.userEmail, clipLink:verifiedAccount.clipLink, armoryLink:linkToUserPage,
            charClass:characterData.characterClass, twovtwo:characterData.twoVtwoRating, threevthree:characterData.threeVthreeRating, solo1:characterData.soloShuffleSpec1Rating, solo2:characterData.soloShuffleSpec2Rating, solo3:characterData.soloShuffleSpec3Rating, solo4:characterData.soloShuffleSpec4Rating})
        }
        await updateGoogleSheet(sheetBody)
        await verifiedAccount.update({charIdOnSubmission: characterData.id})
        .catch((err) => {
          console.log("No charId found");
        });
      }
      await interaction.editReply({
        content: `Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`,
        ephemeral: true,
      });
    } catch (e) {
      console.log(e);
      await interaction.editReply({
        content: "Something went wrong when submitting. Please contact staff",
        ephemeral: true,
      });
    }
  },
};


async function connectToWoW(interaction) {
  await blizzard.wow
  .createInstance({
    key: process.env.BCID,
    secret: process.env.BCS,
    origin: link[1], // optional
    locale: "en_US", // optional
    token: "", // optional
  })
  .catch((err) => {
    cLog([err], {
      guild: interaction.guild,
      subProcess: "CreateWoWInstance",
    });
    interaction.editReply({
      content: "Failed to get character info, continuing",
      ephemeral: true,
    })
  });
}

async function getValorantStats(interaction, accountName, accountRegion,  reviewHistory) {
	let accountData = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${accountName}/${accountRegion}`)
		.catch(err => {cLog([accountData.data.status, err], {guild:interaction.guild, subProcess:"AccountData"});});
	cLog([accountData.data.status], {guild:interaction.guild, subProcess:"AccountData"});
	if(accountData.data.status != 200) {
		cLog([accountData.data.errors[0].message], {guild:interaction.guild, subProcess:"AccountData"});
		return null
	}

	let MMRdata = await axios.get(`https://api.henrikdev.xyz/valorant/v2/by-puuid/mmr/${accountData.data.data.region}/${accountData.data.data.puuid}`)
		.catch(err => {cLog([MMRdata.data.status, err], {guild:interaction.guild, subProcess:"MMRdata"})});

	cLog([MMRdata.data.status], {guild:interaction.guild, subProcess:"MMRdata"});
	if(MMRdata.data.status != 200) {
		cLog([MMRdata.data.errors[0].message], {guild:interaction.guild, subProcess:"MMRdata"});
		return null
	}

	await updatePlayerStats(reviewHistory, {guild:interaction.guildId, MMRdata})
	return {accountData, MMRdata}
}

async function getCharacterInfo(
  region,
  slug,
  characterName,
  wowClient,
  armoryLink,
  guildId
) {
  const Cprofile = await wowClient.characterProfile({
    realm: slug,
    name: characterName,
  });
  cLog([`Cprofile: ${Cprofile.status}. [ ${Cprofile.statusText} ]`], {
    guild: guildId,
    subProcess: "characterData",
  });
  const Cpvp = await wowClient.characterPVP({
    realm: slug,
    name: characterName,
  });
  cLog([`pvpSummary: ${Cpvp.status}. [ ${Cpvp.statusText} ]`], {
    guild: guildId,
    subProcess: "characterData",
  });
  let twoVtwoRating =
    (threeVthreeRating =
    tenVtenRating =
    soloShuffleSpec1Rating =
    soloShuffleSpec2Rating =
    soloShuffleSpec3Rating =
    soloShuffleSpec4Rating =
      null);

  try {
    for (const bracket of Cpvp.data.brackets) {
      try {
        if (bracket.href.includes("2v2")) {
          const bracketInfo = await wowClient.characterPVP({
            realm: slug,
            name: characterName,
            bracket: "2v2",
          });

          twoVtwoRating = bracketInfo.data.rating;
        } else if (bracket.href.includes("3v3")) {
          const bracketInfo = await wowClient.characterPVP({
            realm: slug,
            name: characterName,
            bracket: "3v3",
          });

          threeVthreeRating = bracketInfo.data.rating;
        } else if (
          bracket.href.includes(
            `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][0]
              .toLowerCase()
              .replace(" ", "")}`
          )
        ) {
          const bracketInfo = await wowClient.characterPVP({
            realm: slug,
            name: characterName,
            bracket: `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][0]
              .toLowerCase()
              .replace(" ", "")}`,
          });
          soloShuffleSpec1Rating = bracketInfo.data.rating;
        } else if (
          bracket.href.includes(
            `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][1].toLowerCase()}.replace(" ", "")`
          )
        ) {
          const bracketInfo = await wowClient.characterPVP({
            realm: slug,
            name: characterName,
            bracket: `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][1]
              .toLowerCase()
              .replace(" ", "")}`,
          });
          soloShuffleSpec2Rating = bracketInfo.data.rating;
        } else if (
          bracket.href.includes(
            `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][2]
              .toLowerCase()
              .replace(" ", "")}`
          )
        ) {
          const bracketInfo = await wowClient.characterPVP({
            realm: slug,
            name: characterName,
            bracket: `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][2]
              .toLowerCase()
              .replace(" ", "")}`,
          });

          soloShuffleSpec3Rating = bracketInfo.data.rating;
        } else if (
          bracket.href.includes(
            `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][3]
              .toLowerCase()
              .replace(" ", "")}`
          )
        ) {
          const bracketInfo = await wowClient.characterPVP({
            realm: slug,
            name: characterName,
            bracket: `shuffle-${Cprofile.data.character_class.name
              .toLowerCase()
              .replace(" ", "")}-${classes[
              Cprofile.data.character_class.name
            ][3]
              .toLowerCase()
              .replace(" ", "")}`,
          });

          soloShuffleSpec4Rating = bracketInfo.data.rating;
        } else {
          console.log("FOUND NO MATCH FOR BRACKET: ", bracket.href);
        }
      } catch (err) {
        if (
          err
            .toString()
            .includes(
              "TypeError: Cannot read properties of undefined (reading 'toLowerCase')"
            )
        ) {
          console.log(
            "This role does not exist in classes, or class is lacking subclass"
          );
        } else {
          console.log(err, "Error when checking classes");
        }
      }
    }
  } catch {
    console.log("User most likely has no rank history");
  }

  let characterData = await characterDataacters.create({
    armoryLink: armoryLink,
    characterName: Cprofile.data.name,
    characterRegion: region,
    slug: slug,
    armorLevel: Cprofile.data.equipped_item_level,
    characterClass: Cprofile.data.character_class.name,
    twoVtwoRating: twoVtwoRating,
    threeVthreeRating: threeVthreeRating,
    tenVtenRating: tenVtenRating,
    soloShuffleSpec1Rating: soloShuffleSpec1Rating,
    soloShuffleSpec2Rating: soloShuffleSpec2Rating,
    soloShuffleSpec3Rating: soloShuffleSpec3Rating,
    soloShuffleSpec4Rating: soloShuffleSpec4Rating,
  });

  return characterData;
}
