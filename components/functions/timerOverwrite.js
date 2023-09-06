const ReviewTimerOverwrite = require("../../models/ReviewTimerOverwrite");
const { cLog } = require("./cLog");

async function getTimeBetweenRoles(server) {
    const roles = await ReviewTimerOverwrite.findAll({
        where: {
            isRole:true,
            server:server.serverName
        }
    })
    return roles
}
async function getOrCreateTimeBetweenEntry(userId, userName, days, uses, server, isRole) {
    const [entry, created] = await ReviewTimerOverwrite.findOrCreate({
        where: {
            userId: userId,
            server: server.serverName,
            isRole: isRole
        },
        defaults: {
            userName: userName,
            timeBetween: days,
            uses: uses,
            isRole: isRole,
            server:server.serverName
        }})
    if(created) {
        return formatGetOrCreateTimeBetweenReply(server, isRole,userName, userId, entry.timeBetween, entry.uses)
    }
    let entrySeconds = entry.timeBetween
    let entryUses = entry.uses
    const updated = await entry.update({
        userId: userId,
        server: server.serverName,
        isRole: isRole,
        userName: userName,
        timeBetween: days,
        uses: uses,
    })

    return formatGetOrCreateTimeBetweenReply(server, isRole,userName, userId, updated.timeBetween, updated.uses, entrySeconds,entryUses)
}

function formatGetOrCreateTimeBetweenReply(server, isRole,userName, userId, primarySeconds, primaryUses, updatedSeconds = null, updatedUses = null) {
    let name
    let fullText = ""
    if(isRole) {
        name = `<@&${userId}>`
    } else {
        name = `<@${userId}>`
    }

    if(updatedSeconds != null) {
        fullText += `${name} existed before with ${parseInt(updatedSeconds)/86400} days with ${updatedUses} use(s) left\n`
        cLog([`${userName} existed before with ${parseInt(updatedSeconds)/86400} days with ${updatedUses} use(s) left`], {guild:server, subProcess:"ReviewTimeOverwrite"})

    }
    fullText += `${name} now set to ${parseInt(primarySeconds)/86400} days for ${primaryUses} use(s)\n`
    cLog([`${userName} now set to ${parseInt(primarySeconds)/86400} days for ${primaryUses} use(s)`], {guild:server, subProcess:"ReviewTimeOverwrite"})
    return fullText
    
}


async function getTimeBetweenByUserId(userId, server) {
    return await ReviewTimerOverwrite.findOne({where: {
        userId: userId,
        server: server.serverName
    }})
}

async function createNewTimerOverwrite(username, userId, timeBetween, uses, isRole) {
    await ReviewTimerOverwrite.create({
        userName: username,
        userId: userId,
        timeBetween:timeBetween,
        uses:uses,
        isRole:isRole
    })
}
async function getTimeBetweenUserApplicableRoles(userRoles, server) {
    const userApplicableRoles = []
    for(entry of await getTimeBetweenRoles(server)) {
        if(userRoles.has(entry.userId)) {
            userApplicableRoles.push(entry)
        }
    }
    if(userApplicableRoles.length == 0){ 
        return null
    } 
    return userApplicableRoles
}


async function getOverwrites(userId, userRoles, server) {
    const userTimeBetween = await getTimeBetweenByUserId(userId, server)
    const timeBetweenRoles = await getTimeBetweenUserApplicableRoles(userRoles, server)
    return{userTimeBetween, timeBetweenRoles}
}
async function getShortestOverwrite(userTimeBetween, timeBetweenRoles, guildId = null) {
    let times = []
    if(userTimeBetween != null) {
        times.push(userTimeBetween)
    }
    if(timeBetweenRoles != null) {
        times = times.concat(timeBetweenRoles)
    }
    const smallest = times.reduce(function(prev, curr) {
        return parseInt(prev.timeBetween) < parseInt(curr.timeBetween) ? prev : curr;
    });
    cLog(["Found shortest entery as: " + smallest.userName], { guild:guildId, subProcess:"TimeBetween" })
    return smallest
}

async function reduceTimeBetweenUses(userId, guildId) {
    const object = await ReviewTimerOverwrite.findOne({
        where: {
            userId: userId
        }})
    object.update({
        uses:object.uses - 1
    })
    if(object.uses == 0) {
        object.destroy()
        cLog([`No uses left for ${object.userName}.     - Deleted `], {guild:guildId, subProcess:"TimeBetween"})
        return
    }
    cLog([`Uses left for ${object.userName}: ` + object.uses], {guild:guildId, subProcess:"TimeBetween"})
}
module.exports = { getTimeBetweenByUserId, getTimeBetweenRoles, createNewTimerOverwrite, getTimeBetweenUserApplicableRoles, getOverwrites, getShortestOverwrite, reduceTimeBetweenUses, getOrCreateTimeBetweenEntry };