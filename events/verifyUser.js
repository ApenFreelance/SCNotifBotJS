const { cLog } = require("../components/functions/cLog");
const { updateGoogleSheet, createVerifSheetBody } = require("../components/functions/googleApi");
const VerificationLogs = require("../models/VerificationLogs");
const VerifiedUsers = require("../models/VerifiedUsers");
const { Op } = require("sequelize")

module.exports = {
    name: "verifyUser",
    once: false,
    async execute(interaction, server) {
        const email = interaction.fields.getTextInputValue("email")
        const logEntry = await VerificationLogs.create({
            userName: interaction.user.username,
            userId: interaction.user.id,
            email,
            server: interaction.guild.id
        })
        
        cLog(["Attempting to verify  : ", interaction.user.username, email],{ guild: interaction.guild, subProcess: "VerifyUser" });
        const [userExists, error] = await verifyUserOnWebsite(email)
        if (error) {
            cLog(["Website did not respond  : ", interaction.user.name ],{ guild: interaction.guild, subProcess: "VerifyUser" });
            await interaction.reply({content: "Something went wrong handling your request. Please let Staff know about this error!", ephemeral: true})
            logEntry.update({
                wasSuccessful: false,
                rejectionReason: "Error connecting to website"
            })
            return
        }

        cLog(["Attempting to verify  : ", userExists],{ guild: interaction.guild, subProcess: "VerifyUser" });
        if (!userExists) {
            await interaction.reply({content:`We could not find this account. Please make sure you have entered the correct email.\n\n# Believe this is a mistake?\n- [Submit Verification Request Here](${server.verifForm})\n\nPlease be aware that it may take a few days to confirm your member status on Discord and we apologize for any delays and inconvenience.\n\nAdditionally, confirmations will not be accepted for YouTube screenshots. Screenshots will need to be unedited from your account page and include your email.\n\nPlease make sure your **DISCORD USERNAME IS CORRECT**, otherwise we will be unable to give you access or respond to your form.\n\n*Example screenshot, email hidden for privacy purposes. Screenshots **will need** to include your email to be verified.*`, files: ["./extra/images/verify_example.png"], ephemeral:true})
            logEntry.update({
                wasSuccessful: false,
                rejectionReason: "User not found"
            })
            return
        }

        if (!await checkIfAccountAlreadyLinked(interaction, email)){
            cLog(["Account already linked : ", interaction.user.username],{ guild: interaction.guild, subProcess: "VerifyUser" });
            if(interaction.member.roles.cache.has(roleId)) {
                await interaction.reply({content:`You already have <@&${server.premiumRoleId}>`, ephemeral:true})
                logEntry.update({
                    wasSuccessful: false,
                    rejectionReason: "Account already linked, but user had role already"
                })
                return    
            }
            await interaction.reply({content:`This account is already linked.\n\n# Believe this is a mistake?\nContact staff to resolve this issue`, ephemeral:true})
            logEntry.update({
                wasSuccessful: false,
                rejectionReason: "Account already linked"
            })
            return
        }

        cLog(["Attempting to give user premium  : ", interaction.user.username],{ guild: interaction.guild, subProcess: "VerifyUser" });
  
        await grantUserPremium(interaction)
        logEntry.update({wasSuccessful: true})
        const verifEntry = await VerifiedUsers.create({
            userName:interaction.user.username,
            userId: interaction.user.id,
            email,
            server:interaction.guild.id
        })
        if (server.serverName === "WoW" || server.specialPass) {
            try {
                cLog(["Attempting to update sheet  : ", interaction.user.username],{ guild: interaction.guild, subProcess: "VerifyUserSheet" });
                await updateGoogleSheet(createVerifSheetBody(verifEntry.id, {userName:verifEntry.userName, userId:verifEntry.userId, email:verifEntry.email, createdAt:verifEntry.createdAt}))
            } catch (err) {
                cLog([": ", err],{ guild: interaction.guild, subProcess: "VerifyUserSheet" });
            }
        }
    },
};

async function checkIfAccountAlreadyLinked(interaction, email) {
    const linkedAccounts = await VerifiedUsers.findOne({
        where: {
            [Op.and]: [
                { server:interaction.guild.id },
                {
                    [Op.or]: [
                        {userId: interaction.user.id}, 
                        {email}
                    ]
                }
            ]
        }
    })
    if(!linkedAccounts) return true
    return false
}



/* {
    "success": true,
    "data": {
        "emailExistsFirebase": true,
        "emailExistsMongo": false,
        "userImported": false
    },
    "errorMsgUser": null
} */

async function verifyUserOnWebsite(email) {
    let response = await fetch("https://www.skill-capped.com/api/user/importaccount", {
        method:"POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email
        })
    })
    response = await response.json()
    console.log("response : ", response)
    if (!response.success) { // This is if website handled request. Returns success even if no user found
        return [null, true]
    }
    if(response.data.emailExistsFirebase) return [true, null]
    return [false, null]
    
}

async function grantUserPremium(interaction, server) {
    const role = await interaction.guild.roles.fetch(server.premiumRoleId)
    cLog(["Found role  : ", role.name],{ guild: interaction.guild, subProcess: "VerifyUser" });
    
    await interaction.member.roles.add(role)
    await interaction.reply({content:"Your account has been succesfully linked!\nCheck out <channel> for more information about your new premium access", ephemeral: true })
    cLog(["User granted premium  : ", interaction.user.username],{ guild: interaction.guild, subProcess: "VerifyUser" });
}