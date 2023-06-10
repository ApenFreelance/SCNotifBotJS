const { default: axios } = require("axios")
const { cLog } = require("../components/functions/cLog");
const { createValWaitingForReviewMessage } = require("../components/functions/createWaitingForReview");
const ValReviewHistory = require("../models/ValReviewHistory");

module.exports = {
    name: 'submitValReview',
    once: false,
    async execute(interaction, msg) { 
		console.log(msg)
    interaction = interaction;
    let trackerInput = interaction.fields.getTextInputValue("tracker");
    let improvement = interaction.fields.getTextInputValue("improvementinput");
	let link = decodeURI(trackerInput).replace("https://tracker.gg/valorant/profile/riot/", "").replace("%23", "#").replace("/overview/", "/").split("/");
	cLog([link[0].split("#")], {guild:interaction.guild, subProcess:"Decoding Link"});
	let [verifiedAccount, created] = await ValReviewHistory.findOrCreate({ 
        where:{ userID: interaction.user.id }, 
        defaults:{  status:"Available", 
        userEmail:interaction.fields.getTextInputValue("email"),
        userTag:interaction.user.tag,
        clipLink: interaction.fields.getTextInputValue("ytlink")}, 
        order: [['CreatedAt', 'DESC']]});
    
	createValWaitingForReviewMessage(interaction, await getValorantinteraction(link[0].split("#"), interaction), verifiedAccount, improvement, interaction.guildId, trackerInput, link[0].split("#")[0], "1084873371797434438");
	await msg.editReply({content:"Your submission has been created!", ephemeral:true})
}
}


async function getValorantinteraction(player, interaction) {
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
	//cLog([accountData.data.data], {oneLine:false})
	//cLog([MMRdata.data], {oneLine:false})
	return {accountData, MMRdata}
}


