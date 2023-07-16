const { default: axios } = require("axios")
const { cLog } = require("../components/functions/cLog");
const { createValWaitingForReviewMessage } = require("../components/actionRowComponents/createWaitingForReview");
const { getCorrectTable, updatePlayerStats,  } = require("../components/functions/databaseFunctions/updateValue");

module.exports = {
    name: 'submitValReview',
    once: false,
    async execute(interaction) { 
    interaction = interaction;
    let trackerInput = interaction.fields.getTextInputValue("tracker");
    let improvement = interaction.fields.getTextInputValue("improvementinput");
	let link = decodeURI(trackerInput).replace("https://tracker.gg/valorant/profile/riot/", "").replace("%23", "#").replace("/overview/", "/").split("/");
	cLog([link[0].split("#").join(" ")], {guild:interaction.guild, subProcess:"Decoding Link"});
	
	const reviewInDB = await getCorrectTable(interaction.guildId, "reviewHistory")
	let [verifiedAccount, created] = await reviewInDB.findOrCreate({ 
        where:{ userID: interaction.user.id }, 
        defaults:{  status:"Available", 
        userEmail:interaction.fields.getTextInputValue("email"),
        userTag:interaction.user.tag,
        clipLink: interaction.fields.getTextInputValue("ytlink")}, 
        order: [['CreatedAt', 'DESC']]});


		if(created) { // if a new entry is created there is no reason to check the rest
			try {
				createValWaitingForReviewMessage(interaction, await getValorantinteraction(link[0].split("#"), interaction, verifiedAccount), verifiedAccount, improvement, interaction.guildId, trackerInput, link[0].split("#")[0], "1118571029963481088");
				await interaction.editReply({content:`Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`, ephemeral:true})
		  } catch (err) {
			  cLog(["Failed when responding or creating message for review for NEW user"], {guild:interaction.guild, subProcess:"Submission"})
			  await interaction.editReply({content:`Something went wrong registering new user.`, ephemeral:true})
			}
			return
		  }
		if((Date.now() - (2629743*1000)) >= verifiedAccount.createdAt) {  // 30 day reduction
		await interaction.editReply({content:`You can send a new submission in <t:${(verifiedAccount.createdAt/1000) +2629743}:R> ( <t:${(verifiedAccount.createdAt/1000) +2629743}> )`, ephemeral:true})
		return
		}
		  
		  // if none of the ones apply, create new entry
		  verifiedAccount = await reviewInDB.create({
			userEmail:interaction.fields.getTextInputValue("email"),
			userID:interaction.user.id,
			status:"Available",
			userTag:interaction.user.tag,
			clipLink: interaction.fields.getTextInputValue("ytlink")
		  })
	createValWaitingForReviewMessage(interaction, await getValorantinteraction(link[0].split("#"), interaction, verifiedAccount), verifiedAccount, improvement, interaction.guildId, trackerInput, link[0].split("#")[0], "1118571029963481088");
	await interaction.editReply({content:`Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.`, ephemeral:true})
}
}


async function getValorantinteraction(player, interaction, reviewInDB) {
	let accountData = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${player[0]}/${player[1]}`)
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

	await updatePlayerStats(reviewInDB, {guild:interaction.guildId, MMRdata})
	return {accountData, MMRdata}
}


