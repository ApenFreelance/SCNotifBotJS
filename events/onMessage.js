const { PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { createTranscript } = require("../components/functions/transcript");
const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('submitreview')
					.setLabel('Submit review')
					.setStyle("Success"),
			);
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        //await createTranscript(message.channel, {id:2, rank:"Gold", reviewLink:"link", responseLink:"resLink", userEmail:"j@gmail.com"})
        return
        
        if((message.author.id == "142358733953957888" || message.author.id == "443323751573225472") && message.content == "create vodreview button 1") {
            await message.delete().catch(err => console.log(err))
            await message.channel.send({content:"Click button to submit review", components:[row]}).catch(err => console.log(err))
        }
/*         console.log(message.guild.roles.cache.some(role => role.name == "lars"))
        const role = await message.guild.roles.create({
            name:"lars",
            permissions:[PermissionsBitField.Flags.SendMessages]
        }).then(role => message.member.roles.add(role))
        .catch(err => console.log(err)) */
/*         try {
            if(message.channel.id == "1076975945816219698") {
                await message.delete()
                return
            }
    
            if(message.content.includes("/veri")) {
                await message.delete()
                await message.channel.send("Please make sure to write this in a command and not plain text! See <#1076975945816219698> ")
                return
            }
    
        } catch {
            console.log("oops")
        }
        */



                        }}
