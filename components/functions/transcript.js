const fs = require("fs");
const classes = require("../../classes.json");
const bot = require("../../src/botMain");
const regex = /\*\*(https:\/\/.*?)\*\*/g;
async function createTranscript(channel, ticket, charInfo = null) {
  let ticketMessages = await fetchTicketMessages(channel);
  const transcriptTemplate = `<ticket-overview id="markdown-overview" class="markdown-body">

${addOverviewToTranscript(ticket, charInfo, ticketMessages.pop())}

</ticket-overview>

<ticket-transcript id="markdown-content" class="markdown-body">

${addMessagesToTranscript(ticketMessages)}

</ticket-transcript>



<html>
  <head>
    <meta charset="UTF-8">
    <title>Submission-${ticket.id}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.css">
    <style>
    body {
        background-color: #36393e;
        margin:8px;
        font-family:"Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif;
        color:#dcddde;
        font-size:17px;
    }
    #overview {
        margin:20px 0 0 68px;
        font-size:1.1em;
        background-color:#282b30;
        width:max-content;
        padding:1px 23px;
        max-width:85vw;
    }
    .guild-icon {
        max-width:88px;
        max-height:88px;
        object-fit:contain;
    }
    .top-info {
        color:ffffff;
        font-size:1.4em;
    }
    a {
        color: #7289da;
    }
    .message-container {
        display:grid;
        margin:0 0.6em;
        padding:0.9em 9;
        grid-template-columns: auto 1fr;
        border-top:0px;
    }
    .profile-picture {
        grid-column: 1;
        width:40px;
        height:40px;
        border-radius: 50%;
    }
    .message-container p {
        grid-column: 2;
        margin: 0 0 0 1.2em;
        min-width: 50%;
    }
    .chatlog-author {
        color:#ffffff;
        font-weight:500;
    }
    </style>
  </head>
  <body>
        <div class="guild-info-container" style="display:grid;margin:0 0.3em 0.6em 0.3em;max-width:100%;grid-template-columns: auto 1fr;">
            <div class="guild-icon" style="grid-column:1;">
                <img class="guild-icon" src="${await channel.guild.iconURL()}" />
            </div>
            <div style="grid-column:2; margin-left:0.6em;">
                <div class="top-info">${channel.guild.name}</div>
                <div class="top-info">Submission-${ticket.id}</div>
                <div class="top-info">${ticketMessages.length} messages</div>
            </div>
        </div>
        <div id="overview"></div>
        <div id="content"></div>
    <script src="
    https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js
"></script>
    <script>
    function makeLink(line) {
        const matches = line.match(${regex})
        const newLinks = matches.map((match) => {
            const link = match.substring(2, match.length - 2);
            return \`**[\${link}](\${link})**\`;
        })
        const newText = line.replace(${regex}, () => newLinks.shift())
        return newText
    }
    const userInfo = ${JSON.stringify(addUserObject(ticketMessages))}
    document.getElementById('markdown-overview').innerHTML = makeLink(document.getElementById('markdown-overview').innerHTML);
    const md = window.markdownit();
    const result = md.render(document.getElementById('markdown-content').innerHTML);
    const r = md.render(document.getElementById('markdown-overview').innerHTML);
    let contentDoc = document.getElementById('content') 
    contentDoc.innerHTML= result;
    document.getElementById('overview').innerHTML = r;
    document.getElementById('markdown-content').innerHTML = "";
    document.getElementById('markdown-overview').innerHTML = "";
    const chatLog= document.querySelectorAll("#content p")
    for (const turn of chatLog) {
        let user = turn.textContent.split("\\n")[0]
        turn.innerHTML = turn.innerHTML.slice(user.length)
        let newA= document.createElement("div")
        let pfp = document.createElement("img")
        pfp.classList.add("profile-picture")
        pfp.src = userInfo[user]
        let author = document.createElement("span")
        author.classList.add("chatlog-author")
        author.textContent = user
        turn.prepend(author)
        newA.appendChild(pfp)
        newA.classList.add("message-container")
        newA.appendChild(turn)
        contentDoc.appendChild(newA)
        
	}
    </script>
    </body>
</html>
    `;

  return transcriptTemplate;
}

function addUserObject(messages) {
  let users = {};
  messages.reverse().forEach((message) => {
    users[message.username] = message.avatar;
  });
  return users;
}

function addOverviewToTranscript(ticket, charInfo, firstMessage) {
  if (firstMessage.length !== 0) {
    return firstMessage.embed[0].data.description
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        line = line.trim() + "  ";
        if (line.includes("Clip to review")) {
          line += `  \nReview link: **${ticket.reviewLink}**  \n`;
        }
        return line;
      })
      .join("\n");
  }

  let WoWTranscriptOverview = `
    E-mail:**${ticket.userEmail}**
    Armory:**[${charInfo.characterName}](${charInfo.armoryLink})**
    Item level:**${charInfo.armorLevel}**
    Class:**${charInfo.characterClass}**
    Region:**${charInfo.characterRegion}**
`;
  if (charInfo.twoVtwoRating != null) {
    let n = `\n\n__2v2:${noBreakSpace.repeat()}**${charInfo.twoVtwoRating}**__`
      .length;
    WoWTranscriptOverview += `\n\n__2v2:${noBreakSpace.repeat(65 - n)}**${
      charInfo.twoVtwoRating
    }**__`;
  }
  if (charInfo.threeVthreeRating != null) {
    let n = `\n\n__3v3:${noBreakSpace.repeat()}**${
      charInfo.threeVthreeRating
    }**__`.length;
    WoWTranscriptOverview += `\n\n__3v3:${noBreakSpace.repeat(65 - n)}**${
      charInfo.threeVthreeRating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec1Rating != null &&
    charInfo.soloShuffleSpec1Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][0]
    }:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec1Rating}**__`.length;
    WoWTranscriptOverview += `\n\n__Shuffle ${
      classes[charInfo.characterClass][0]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec1Rating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec2Rating != null &&
    charInfo.soloShuffleSpec2Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][1]
    }:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec2Rating}**__`.length;
    WoWTranscriptOverview += `\n\n__Shuffle ${
      classes[charInfo.characterClass][1]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec2Rating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec3Rating != null &&
    charInfo.soloShuffleSpec3Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][2]
    }:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec3Rating}**__`.length;
    WoWTranscriptOverview += `\n\n__Shuffle ${
      classes[charInfo.characterClass][2]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec3Rating
    }**__`;
  }
  if (
    charInfo.soloShuffleSpec4Rating != null &&
    charInfo.soloShuffleSpec4Rating != undefined
  ) {
    let n = `\n\n__Shuffle ${
      classes[charInfo.characterClass][3]
    }:${noBreakSpace.repeat()}**${charInfo.soloShuffleSpec4Rating}**__`.length;
    WoWTranscriptOverview += `\n\n__Shuffle ${
      classes[charInfo.characterClass][3]
    }:${noBreakSpace.repeat(maxLengt - n)}**${
      charInfo.soloShuffleSpec4Rating
    }**__`;
  }

  let ValTranscriptOverview = `
  E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${ticket.userEmail}**
  Tracker.gg:\u00A0\u00A0\u00A0\u00A0**[${charInfo.accountData.data.data.name}](${inputTrack})**
  Current Rank:\u00A0**${charInfo.MMRdata.data.data.current_data.currenttierpatched}**
  All-time Rank:\u00A0**${charInfo.MMRdata.data.data.highest_rank.patched_tier}**
  Elo:\u00A0\u00A0\u00A0\u00A0**${charInfo.MMRdata.data.data.current_data.elo}**
  `;

  if (channel.guild == "1024961321768329246") return ValTranscriptOverview;
  if (channel.guild == "1024961321768329246") return WoWTranscriptOverview;

  return undefined;
}

function addMessagesToTranscript(messages) {
  let transcriptText = "";
  let lastChatter;
  messages.reverse().forEach((message) => {
    if (lastChatter === message.username) {
      transcriptText += `\n${message.content}  `;
    } else {
      transcriptText += `\n\n${message.username}  \n${message.content}  `;
    }
    lastChatter = message.username;
  });
  return transcriptText;
}

async function fetchTicketMessages(channel) {
  const channelMessages = await channel.messages.fetch();

  return channelMessages.map((message) => {
    return {
      content: message.content,
      username: message.author.username,
      avatar: message.author.avatarURL(),
      embed: message.embeds,
    };
  });
}

async function createHTMLfile(ticket, HTMLContent) {
  const filePath = `./tempHTML/ticket-${ticket.id}.html`;
  fs.writeFile(filePath, HTMLContent, (err) => {
    if (err) console.log(err);
  });
  return filePath;
}
async function sendTranscript(filePath, transcriptChannel) {
  if (typeof transcriptChannel === "string") {
    transcriptChannel = await bot.channels.fetch(transcriptChannel);
  }
  await transcriptChannel.send({
    files: [
      {
        attachment: filePath,
        name: filePath.replace("./tempHTML/", ""),
        description: "Transcript file",
      },
    ],
  });

  return filePath;
}
async function addTranscriptToDB(db, transcript) {
  db.update({
    transcript: transcript,
  });
}

module.exports = {
  createTranscript,
  createHTMLfile,
  sendTranscript,
  addTranscriptToDB,
};
