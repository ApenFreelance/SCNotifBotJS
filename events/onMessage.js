const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { createTranscript } = require("../components/functions/transcript");
const { cLog } = require("../components/functions/cLog");
const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('submitreview')
					.setLabel('Submit review')
					.setStyle("Success"),
			);
const refundEmbed = new EmbedBuilder()
.setColor("#3ba55d")
.setTitle("How to get a refund")
.setDescription("Please write an email to `support@skill-capped.com`, they should get back to you in a couple of business days")

const refundRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId("deletemessage")
            .setLabel("Delete")
            .setStyle("Danger")
    )

const uiTriggers = ["UI errors", "UI error", "addon error", "addon errors", "UI crashing", "UI crashes", "OmniBar error", "OmniBar crashing", "BigDebuffs error", "BigDebuffs crashing"]
const uiEmbed = new EmbedBuilder()
.setColor("#3ba55d")
.setTitle("UI error")
.setDescription("UI errors are common with the rework to the Blizzard UI in Dragonflight. The most common triggers for UI errors are:\n\n1) Changing talents\n2) Interacting with the spellbook\n\nTo minimize the risk of a UI error mid game, be sure to /reload UI in the starting room, especially after changing talents.")


module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if(message.author.bot) return;

        if(message.content.toLowerCase().includes("refund") && (message.guildId == "1024961321768329246" || message.guildId == "855206452771684382"))  {
            await message.reply({embeds:[refundEmbed], components:[refundRow]})
            cLog(["Creating Refund Message"], {guild:message.guildId, subProcess:"Refund Message"})
        }
        if(uiTriggers.some(substring=>message.content.toLowerCase().includes(substring.toLowerCase()))){
            await message.reply({embeds: [uiEmbed], components: [refundRow]})
        }
        
}}
