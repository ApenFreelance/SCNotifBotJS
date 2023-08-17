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
.setDescription("Please write an email to `support@scill-capped.com, they should get back to you in a couple of business days`")

const refundRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId("delete-message")
            .setLabel("Delete")
            .setStyle("Danger")
    )


module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if(message.author.bot) return;

        if(message.content.includes("refund") && (message.guildId == "1024961321768329246" || message.guildId == "855206452771684382"))  {
            await message.reply({embeds:[refundEmbed], components:[refundRow]})
            cLog(["Creating Refund Message"], {guild:message.guildId, subProcess:"Refund Message"})
        }
}}
