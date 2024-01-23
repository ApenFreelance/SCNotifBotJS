const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi.js");
const blizzard = require("blizzard.js");
const classes = require("../classes.json");
const { createWaitingForReviewMessage } = require("../components/actionRowComponents/createWaitingForReview.js");
const { cLog } = require("../components/functions/cLog.js");
const { getCorrectTable } = require("../src/db.js");
const axios = require("axios");
const { reduceTimeBetweenUses, getOverwrites, getShortestOverwrite } = require("../components/functions/timerOverwrite.js");

module.exports = {
    name: "submitReview",
    once: false,
    async execute(interaction, server, mode = null) {
        try {
            let sheetBody = null;
            let characterData = null;
            let linkToUserPage = null;
            let wowClient = null;
            let accountName = null;
            let accountRegion = null;
            let accountSlug = null;
            let improvement = interaction.fields.getTextInputValue("improvementinput");
            let consentInput = interaction.fields.getTextInputValue("consentinput");
            // get correct link to user page
            await interaction.reply({ content: "Attempting to submit review...", ephemeral: true });

            let reviewHistory = await getCorrectTable(server.serverId,"reviewHistory",mode);

            if (server.serverName == "WoW") {
                linkToUserPage = interaction.fields.getTextInputValue("armory");
                [_ , accountRegion, accountSlug, accountName] = decodeURI(linkToUserPage)
                    .toLowerCase()
                    .replace("https://worldofwarcraft.com/", "")
                    .replace("https://worldofwarcraft.blizzard.com/", "")
                    .replace("/character/", "/")
                    .split("/");
                // Create a WoW Client connection
                wowClient = await connectToWoW(interaction, accountRegion);
                try {
                    characterData = await getCharacterInfo(
                        accountRegion,
                        accountSlug,
                        accountName,
                        wowClient,
                        linkToUserPage,
                        interaction.guildId
                    );
                } catch (err) {
                    console.log(err);
                    characterData = null;
                    console.log("Failed to get char, because char doesnt exist or couldnt be found");
                }
            } else if (server.serverName == "Valorant") {
                linkToUserPage = interaction.fields.getTextInputValue("tracker");
                [accountName, accountRegion] = decodeURI(linkToUserPage)
                    .replace("https://tracker.gg/valorant/profile/riot/", "")
                    .replace("%23", "#")
                    .replace("/overview/", "/")
                    .split("/")[0]
                    .split("#");
                characterData = await getValorantStats(interaction,accountName,accountRegion);
            } else {
                await interaction.editReply({content: "This server is unknown",ephemeral: true});
                return;
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
                    await createWaitingForReviewMessage(
                        interaction,
                        characterData,
                        verifiedAccount,
                        improvement,
                        consentInput,
                        linkToUserPage,
                        accountName,
                        server,
                        mode
                    );
                } catch (err) {
                    console.log("Failed when responding or creating message for review for NEW user",err);
                    await interaction.editReply({content: `Something went wrong registering new user.`,ephemeral: true});
                }
                let submissionPos = verifiedAccount.id;
                if (server.serverName == "WoW") {
                    sheetBody = firstSheetBody(mode, submissionPos, verifiedAccount, characterData, linkToUserPage);
                    await updateGoogleSheet(sheetBody);
                } else if (server.serverName == "Valorant") {
                    if (characterData != null) {
                        await verifiedAccount.update({
                            CurrentTier: characterData.MMRdata.data.data.current_data.currenttierpatched,
                            AllTimeTier: characterData.MMRdata.data.data.highest_rank.patched_tier,
                        });
                    }
                }
                await interaction.editReply({
                    content: `Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`,
                    ephemeral: true,
                });
                return;
            }
            // Reduction decided on in DB
            const { userTimeBetween, timeBetweenRoles } = await getOverwrites(
                await interaction.user.id,
                await interaction.member.roles.cache,
                server
            );
            const shortest = await getShortestOverwrite(
                userTimeBetween,
                timeBetweenRoles,
                interaction.guildId
            );
            if (Date.now() - shortest.timeBetween * 1000 <= verifiedAccount.createdAt ) {
                await interaction.editReply({content: `You can send a new submission in <t:${verifiedAccount.createdAt / 1000 + parseInt(shortest.timeBetween) }:R> ( <t:${verifiedAccount.createdAt / 1000 + parseInt(shortest.timeBetween)}> )`,ephemeral: true});
                return;
            }
            if (shortest.uses != "unlimited") {
                await reduceTimeBetweenUses(shortest.userId,interaction.guildId);
            }

            // if none of the ones apply, create new entry
            verifiedAccount = await reviewHistory.create({
                userEmail: interaction.fields.getTextInputValue("email"),
                userID: interaction.user.id,
                status: "Available",
                userTag: interaction.user.username,
                clipLink: interaction.fields.getTextInputValue("ytlink"),
            });

            await createWaitingForReviewMessage(
                interaction,
                characterData,
                verifiedAccount,
                improvement,
                consentInput,
                linkToUserPage,
                accountName,
                server,
                mode
            );
            let submissionPos = verifiedAccount.id;
            if (server.serverName == "WoW") {
                sheetBody = firstSheetBody(mode, submissionPos, verifiedAccount, characterData, linkToUserPage);
                await updateGoogleSheet(sheetBody);
                await verifiedAccount.update({ charIdOnSubmission: characterData.id }).catch((err) => {
                    console.log("No charId found");
                });
            } else if (server.serverName == "Valorant") {
                if (characterData != null) {
                    await verifiedAccount.update({
                        CurrentTier: characterData.MMRdata.data.data.current_data.currenttierpatched,
                        AllTimeTier: characterData.MMRdata.data.data.highest_rank.patched_tier,
                    });
                }
            }
            await interaction.editReply({
                content: `Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.\n\n**Videos above 15 minutes from unverified YouTube accounts will be removed by YouTube. Verify here:** https://www.youtube.com/verify`,
                ephemeral: true,
            });
        } catch (e) {
            console.log(e);
            await interaction.editReply({content:"Something went wrong when submitting. Please contact staff",ephemeral: true});
        }
    }
};

async function connectToWoW(interaction, accountRegion) {
    const con = await blizzard.wow
        .createInstance({
            key: process.env.BCID,
            secret: process.env.BCS,
            origin: accountRegion, // optional
            //locale: "en_US", // optional
            token: "", // optional
        })
        .catch((err) => {
            cLog([err], { guild: interaction.guild, subProcess: "CreateWoWInstance"});
        });
    return con;
}

async function getValorantStats(interaction, accountName, accountRegion) {
    let accountData = await axios
        .get(
            `https://api.henrikdev.xyz/valorant/v1/account/${accountName}/${accountRegion}`
        )
        .catch((err) => {
            cLog([err], {
                guild: interaction.guild,
                subProcess: "AccountData",
            });
        });
    cLog([accountData.data.status], { guild: interaction.guild, subProcess: "AccountData" });
    if (accountData.data.status != 200) {
        cLog([accountData.data.errors[0].message], {
            guild: interaction.guild,
            subProcess: "AccountData",
        });
        return null;
    }

    let MMRdata = await axios
        .get(`https://api.henrikdev.xyz/valorant/v2/by-puuid/mmr/${accountData.data.data.region}/${accountData.data.data.puuid}`)
        .catch((err) => {
            cLog([err], { guild: interaction.guild, subProcess: "MMRdata" });
        });

    cLog([MMRdata.data.status], {
        guild: interaction.guild,
        subProcess: "MMRdata",
    });
    if (MMRdata.data.status != 200) {
        cLog([MMRdata.data.errors[0].message], {
            guild: interaction.guild,
            subProcess: "MMRdata",
        });
        return null;
    }

    return { accountData, MMRdata };
}

async function getCharacterInfo(region,slug,characterName,wowClient,armoryLink,guildId) {
    const Cprofile = await getCharacterProfile(slug, characterName, wowClient, guildId)
    const pvpData = await getPVPData(slug, characterName, Cprofile.character_class.name, wowClient, guildId);
    const mythicPlusScore = await getMythicPlusScore(slug, characterName, wowClient, guildId);
    
    
    let characterData = await getCorrectTable(guildId, "WoWCharacter");
    characterData = await characterData.create({
        armoryLink,
        characterName: Cprofile.name,
        characterRegion: region,
        slug,
        armorLevel: Cprofile.equipped_item_level,
        characterClass: Cprofile.character_class.name,
        ...pvpData,
        specialization: Cprofile.active_spec.name,
        mythicPlusScore,
    });
    return characterData;
}

async function getMythicPlusScore(realm,name, wowClient, guildId) {
    const mythicScore = await wowClient.characterMythicKeystone({realm, name})
    cLog([`Mythic+: ${mythicScore.status}. [ ${mythicScore.statusText} ]`], {guild: guildId, subProcess: "getMythic+" });
    return Math.floor(mythicScore?.data?.current_mythic_rating?.rating) || null;
}

async function findRatings(realm, name, brackets, characterClass, wowClient) {
    let twoVtwoRating = null;
    let threeVthreeRating = null;
    let soloShuffleSpec1Rating = null;
    let soloShuffleSpec2Rating = null;
    let soloShuffleSpec3Rating = null;
    let soloShuffleSpec4Rating = null;
    for (const bracket of brackets) {
        try {
            const bracketType = bracket.href.includes("2v2") ? "2v2"
            : bracket.href.includes("3v3") ? "3v3"
            : bracket.href.includes(`shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][0].toLowerCase().replace(" ", "")}`) ? `shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][0].toLowerCase().replace(" ", "")}`
            : bracket.href.includes(`shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][1].toLowerCase().replace(" ", "")}`) ? `shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][1].toLowerCase().replace(" ", "")}`
            : bracket.href.includes(`shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][2].toLowerCase().replace(" ", "")}`) ? `shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][2].toLowerCase().replace(" ", "")}`
            : bracket.href.includes(`shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][3].toLowerCase().replace(" ", "")}`) ? `shuffle-${characterClass.toLowerCase().replace(" ", "")}-${classes[characterClass][3].toLowerCase().replace(" ", "")}`
            : null;
        if (bracketType) {
            const bracketInfo = await wowClient.characterPVP({ realm,name,bracket: bracketType });
            cLog([`getBracketData: ${bracketInfo.status}. [ ${bracketInfo.statusText} ]`], { subProcess: "findRatings" });
            if (bracketType === "2v2") {
                twoVtwoRating = bracketInfo.data.rating;
            } else if (bracketType === "3v3") {
                threeVthreeRating = bracketInfo.data.rating;
            } else if (bracketType.includes("shuffle")) {
                if (bracketType.endsWith(classes[characterClass][0].toLowerCase().replace(" ", ""))) {
                    soloShuffleSpec1Rating = bracketInfo.data.rating;
                } else if (bracketType.endsWith(classes[characterClass][1].toLowerCase().replace(" ", ""))) {
                    soloShuffleSpec2Rating = bracketInfo.data.rating;
                } else if (bracketType.endsWith(classes[characterClass][2].toLowerCase().replace(" ", ""))) {
                    soloShuffleSpec3Rating = bracketInfo.data.rating;
                } else if (bracketType.endsWith(classes[characterClass][3].toLowerCase().replace(" ", ""))) {
                    soloShuffleSpec4Rating = bracketInfo.data.rating;
                }
            }
        }
        } catch (err) {
            if (!err.toString().includes("TypeError: Cannot read properties of undefined (reading 'toLowerCase')")) {
                console.log(err, "Error when checking characterClasses");
            }
        }
    }
    return {twoVtwoRating, threeVthreeRating, soloShuffleSpec1Rating, soloShuffleSpec2Rating, soloShuffleSpec3Rating, soloShuffleSpec4Rating};
}

async function getPVPData(realm, name, characterClass, wowClient, guildId) {
    const Cpvp = await wowClient.characterPVP({ realm, name });
    cLog([`pvpSummary: ${Cpvp.status}. [ ${Cpvp.statusText} ]`], {guild: guildId, subProcess: "getPVPData" });
    try {
        if(Cpvp.data.brackets) {
            return await findRatings(realm, name, Cpvp.data.brackets, characterClass, wowClient);
        }
    } catch(e) {
        console.log(e)
        console.log("User most likely has no rank history");
    }
}


async function getCharacterProfile(realm, name, wowClient, guildId) {
    const Cprofile = await wowClient.characterProfile({ realm,name });
    cLog([`Cprofile: ${Cprofile.status}. [ ${Cprofile.statusText} ]`], {guild: guildId,subProcess: "characterData"});
    return Cprofile.data;
}

function firstSheetBody(mode, submissionPos, verifiedAccount, characterData, armoryLink) {
    let sheetBodyData = {
        status: verifiedAccount.status,
        createdAt: verifiedAccount.createdAt,
        id: verifiedAccount.id,
        userID: verifiedAccount.userID,
        userEmail: verifiedAccount.userEmail,
        clipLink: verifiedAccount.clipLink,
        armoryLink,
    };
    if (characterData != null) {
        sheetBodyData.charClass = characterData.characterClass;
        sheetBodyData.twovtwo = characterData.twoVtwoRating;
        sheetBodyData.threevthree = characterData.threeVthreeRating;
        sheetBodyData.solo1 = characterData.soloShuffleSpec1Rating;
        sheetBodyData.solo2 = characterData.soloShuffleSpec2Rating;
        sheetBodyData.solo3 = characterData.soloShuffleSpec3Rating;
        sheetBodyData.solo4 = characterData.soloShuffleSpec4Rating;
        sheetBodyData.mythicPlusScore = characterData.mythicPlusScore;
        sheetBodyData.specialization = characterData.specialization;
    }
    return createSheetBody(mode, submissionPos, sheetBodyData);
}