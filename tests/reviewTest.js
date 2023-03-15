
require("dotenv").config();
const fs = require("fs");
const { Collection, Client, GatewayIntentBits,SlashCommandBuilder } = require('discord.js');
const ReviewHistory = require("../models/ReviewHistory");
const db = require("../src/db");
const WoWCharacters = require("../models/WoWCharacters");

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});


const eventFiles = ["foundVideo.js", "submitReview.js"]
for (const file of eventFiles) {
    console.log("registering: ", file)
    const event = require(`../events/${file}`);
    if (event.once) {
        
        bot.once(event.name, (...args) => event.execute(...args));
    } else {
        bot.on(event.name, (...args) => event.execute(...args));
    }
}

const interaction = {
    type: 5,
    id: '1084881541886386277',
    applicationId: '1020404504430133269',
    channelId: '1084873371797434438',
    guildId: '1024961321768329246',
    user: {
      id: '443323751573225472',
      bot: false,
      system: false,
      flags: { bitfield: 4194432 },
      username: 'apen_julius',
      discriminator: '1431',
      avatar: '575c204aee9158cb5f007c626275e140',
      banner: undefined,
      accentColor: undefined
    },
    member: {
      guild:  {
        id: '1024961321768329246',
        name: 'SC Testing server',
        icon: null,
        features: [ 'APPLICATION_COMMAND_PERMISSIONS_V2' ],
        
        available: true,
        shardId: 0,
        splash: null,
        banner: null,
        description: null,
        verificationLevel: 0,
        vanityURLCode: null,
        nsfwLevel: 0,
        premiumSubscriptionCount: 0,
        discoverySplash: null,
        memberCount: 4,
        large: false,
        premiumProgressBarEnabled: false,
        applicationId: null,
        afkTimeout: 300,
        afkChannelId: null,
        systemChannelId: '1024961321768329249',
        premiumTier: 0,
        widgetEnabled: null,
        widgetChannelId: null,
        explicitContentFilter: 0,
        mfaLevel: 0,
        joinedTimestamp: 1666549253083,
        defaultMessageNotifications: 1,
        systemChannelFlags: { bitfield: 0 },
        
      },
      joinedTimestamp: 1664440221979,
      premiumSinceTimestamp: null,
      nickname: null,
      pending: false,
      communicationDisabledUntilTimestamp: null,
      roles: [ '🧨 Skill Capped Member' ],
      user: {
        id: '443323751573225472',
        bot: false,
        system: false,
        flags: { bitfield: 4194432 },
        username: 'apen_julius',
        discriminator: '1431',
        avatar: '575c204aee9158cb5f007c626275e140',
        banner: undefined,
        accentColor: undefined
      },
      avatar: null
    },
    version: 1,
    appPermissions: { bitfield: 1071698660929n },
    memberPermissions: { bitfield: 4398046511103n },
    locale: 'en-GB',
    guildLocale: 'en-US',
    customId: 'submissionmodal',
    message: {
      channelId: '1084873371797434438',
      guildId: '1024961321768329246',
      id: '1084874983169339474',
      createdTimestamp: 1678724751990,
      type: 20,
      system: false,
      content: 'Sheeehs',
      author: {
        id: '1020404504430133269',
        bot: true,
        system: false,
        flags:  { bitfield: 0 },
        username: 'Skill-Capped',
        discriminator: '8076',
        avatar: '7b22c361be67c2b9dcf670d4202f8e85',
        banner: undefined,
        accentColor: undefined,
        verified: true,
        mfaEnabled: true
      },
      pinned: false,
      tts: false,
      nonce: null,
      embeds: [],
      components: [
         {
          data: { type: 1 },
          components: [
             {
              data: {
                type: 2,
                style: 3,
                label: 'Submit review',
                custom_id: 'submitreview'
              }
            }
          ]
        }
      ],
     
      position: null,
      editedTimestamp: null,
      

      webhookId: '1020404504430133269',
      groupActivityApplication: null,
      applicationId: '1020404504430133269',
      activity: null,
      flags:{ bitfield: 0 },
      reference: null,
      interaction: {
        id: '1084874981772644523',
        type: 2,
        commandName: 'vodreview',
        user:  {
          id: '443323751573225472',
          bot: false,
          system: false,
          flags: { bitfield: 4194432 },
          username: 'apen_julius',
          discriminator: '1431',
          avatar: '575c204aee9158cb5f007c626275e140',
          banner: undefined,
          accentColor: undefined
        }
      }
    },
    components: [
      {
        value: undefined,
        type: 1,
        customId: undefined,
        components: [
          {
            value: 'https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/blizo',
            type: 4,
            customId: 'armory',
            components: undefined
          }
        ]
      }
    ],
    fields:  {
      components: [
        {
          value: undefined,
          type: 1,
          customId: undefined,
          components: [
            {
              value: 'https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/blizo',
              type: 4,
              customId: 'armory',
              components: undefined
            }
          ]
        }
      ],
      fields:  {
        armory: {
          value: 'https://worldofwarcraft.blizzard.com/en-gb/character/eu/tarren-mill/blizo',
          type: 4,
          customId: 'armory',
          components: undefined
        }
      }
    },
    deferred: false,
    replied: false,
    ephemeral: null,
    webhook:  { id: '1020404504430133269' }
  }
bot.on("ready", async () => {
    console.log(`>>>>${bot.user.username} has logged in during test`)
    try {
        WoWCharacters.init(db)
        WoWCharacters.sync(db)

        ReviewHistory.init(db)
        ReviewHistory.sync(db)
        bot.emit("submitReview", interaction)
        
    } catch(err) {
        console.log(err)
        console.log("Passed test: ",false)
    }
})


bot.login(process.env.BOT_TOKEN);