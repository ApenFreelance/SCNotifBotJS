const fs = require("fs")
const classes = require("../../classes.json");
const bot = require("../../src/botMain")
async function createTranscript(channel, ticket, charInfo = null) {
    let ticketMessages = await fetchTicketMessages(channel)
    const transcriptTemplate = ` 
<ticket-transcript id="markdown-content" class="markdown-body">
${addOverviewToTranscript(ticket, charInfo, ticketMessages.pop())}
${addMessagesToTranscript(ticketMessages)}
</ticket-transcript>



<html>
  <head>
    <meta charset="UTF-8">
    <title>Submission-${ticket.id}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.css">
  </head>
  <body>
        <div id="overview"></div>
        <div id="content"></div>
    <script src="
    https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js
"></script>
    <script>
        const md = window.markdownit();
       
        const result = md.render(document.getElementById('markdown-content').innerHTML);
        const r = md.render(document.getElementById('markdown-overview').innerHTML);
        document.getElementById('content').innerHTML = result;
        document.getElementById('overview').innerHTML = r;
        document.getElementById('markdown-content').innerHTML = "";
        document.getElementById('markdown-overview').innerHTML = "";
    </script>
    </body>
</html>
    `
    return transcriptTemplate
}

function addOverviewToTranscript(ticket, charInfo, firstMessage) {

    if(firstMessage.length !== 0){
        return firstMessage.embed[0].data.description
    }

    let WoWTranscriptOverview = `
    E-mail:**${ticket.userEmail}**
    Armory:**[${charInfo.characterName}](${charInfo.armoryLink})**
    Item level:**${charInfo.armorLevel}**
    Class:**${charInfo.characterClass}**
    Region:**${charInfo.characterRegion}**
`
if(charInfo.twoVtwoRating != null) {
    let n = `\n\n__2v2:${noBreakSpace.repeat()}**${charInfo.twoVtwoRating}**__`.length
    WoWTranscriptOverview+=`\n\n__2v2:${noBreakSpace.repeat(65-n)}**${charInfo.twoVtwoRating}**__`
  }
  if(charInfo.threeVthreeRating != null) {
    let n = `\n\n__3v3:${noBreakSpace.repeat()}**${charInfo.threeVthreeRating}**__`.length
    WoWTranscriptOverview+=`\n\n__3v3:${noBreakSpace.repeat(65-n)}**${charInfo.threeVthreeRating}**__`
  }
  if(charInfo.soloShuffleSpec1Rating != null&& charInfo.soloShuffleSpec1Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.characterClass][0]}:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec1Rating}**__`.length
    WoWTranscriptOverview+=`\n\n__Shuffle ${classes[charInfo.characterClass][0]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.soloShuffleSpec1Rating}**__`
  }
  if(charInfo.soloShuffleSpec2Rating != null&& charInfo.soloShuffleSpec2Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.characterClass][1]}:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec2Rating}**__`.length
    WoWTranscriptOverview+=`\n\n__Shuffle ${classes[charInfo.characterClass][1]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.soloShuffleSpec2Rating}**__`
  }
  if(charInfo.soloShuffleSpec3Rating != null&& charInfo.soloShuffleSpec3Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.characterClass][2]}:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec3Rating}**__`.length
    WoWTranscriptOverview+=`\n\n__Shuffle ${classes[charInfo.characterClass][2]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.soloShuffleSpec3Rating}**__`
  }
  if(charInfo.soloShuffleSpec4Rating != null && charInfo.soloShuffleSpec4Rating!= undefined) {
    let n = `\n\n__Shuffle ${classes[charInfo.characterClass][3]}:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec4Rating}**__`.length
    WoWTranscriptOverview+=`\n\n__Shuffle ${classes[charInfo.characterClass][3]}:${noBreakSpace.repeat(maxLengt-n)}**${charInfo.soloShuffleSpec4Rating}**__`
  }
    

  let ValTranscriptOverview = `
  E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${ticket.userEmail}**
  Tracker.gg:\u00A0\u00A0\u00A0\u00A0**[${charInfo.accountData.data.data.name}](${inputTrack})**
  Current Rank:\u00A0**${charInfo.MMRdata.data.data.current_data.currenttierpatched}**
  All-time Rank:\u00A0**${charInfo.MMRdata.data.data.highest_rank.patched_tier}**
  Elo:\u00A0\u00A0\u00A0\u00A0**${charInfo.MMRdata.data.data.current_data.elo}**
  `





    if(channel.guild == "1024961321768329246") return ValTranscriptOverview;
    if(channel.guild == "1024961321768329246") return WoWTranscriptOverview;

    return undefined
}


function addMessagesToTranscript(messages) {
    let transcriptText = ""
    messages.forEach(message => {
        transcriptText += `${message.username}  \n${message.content}  \n\n`
    }); 
    return transcriptText
}

async function fetchTicketMessages(channel) {
    const channelMessages = await channel.messages.fetch()
    return channelMessages.map(message => {
        return {
            content:message.content,
            username:message.author.username,
            avatar:message.author.avatar,
            embed:message.embeds
        }
    })
}

async function createHTMLfile(ticket, HTMLContent) {

    const filePath =`./tempHTML/ticket-${ticket.id}.html`
    fs.writeFile(filePath, HTMLContent, (err) => {
        if (err)
          console.log(err);
        })
    return filePath
    }
async function sendTranscript(filePath, transcriptChannel) {

    if(typeof transcriptChannel === "string") {
        transcriptChannel = await bot.channels.fetch(transcriptChannel)
    }
    await transcriptChannel.send({ files: [{
        attachment: filePath,
        name: filePath.replace("./tempHTML/", ""),
        description: 'Transcript file'
      }]})
}

module.exports = {createTranscript, createHTMLfile, sendTranscript}