const { PermissionsBitField } = require("discord.js")

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
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
