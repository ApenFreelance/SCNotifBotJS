const {
    updateGoogleSheet,
    createSheetBody,
} = require("../components/functions/googleApi");
const { cLog } = require("../components/functions/cLog");
const { createSubmissionModal } = require("../components/modals");
const { getCorrectTable } = require("../src/db");
const { selectServer } = require("../components/functions/selectServer");

const regexWoWLink =
    /(https):\/\/((worldofwarcraft\.blizzard\.com||worldofwarcraft\.com)\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/.+)/;
const regexValLink = /(https):\/\/(tracker\.gg\/valorant\/profile\/riot)\/.+/;
module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction) {
        let bot = interaction.client;
        try {
            if (interaction.isCommand()) {
                await slashCommandHandler(interaction);
                return;
            }
            // End of slash command handler
            //await interaction.reply({content:"Processing...", ephemeral:true}) // This is to show something is happening and to prevent timeout. EDIT IT ALONG THE WAY
            // Line above causes issues with modals
            const server = selectServer(interaction.guildId); //
            /*
            Contains:
            serverName
            serverId
            reviewCategoryId
            */
            if (interaction.customId == "deletemessage") {
                await interaction.message.delete();
                cLog(["Deleted refund message"], {
                    guild: server.serverId,
                    subProcess: "Refund Message",
                });
            }

            if (interaction.customId.split("-")[0] == "submitreview") {
                if (await blockIfLacksRole(interaction, server.serverName)) {
                    return;
                }
                await createSubmissionModal(
                    interaction,
                    server,
                    interaction.customId.split("-")[1]
                );
            }
            if (interaction.customId.split("-")[0] == "submissionmodal") {
                // Handles response from the submitted submission through modal
                if (validLink(interaction, server.serverName)) {
                    // Begin submission creation handling
                    bot.emit(
                        "submitReview",
                        interaction,
                        server,
                        interaction.customId.split("-")[1]
                    );
                } else {
                    await interaction.reply({
                        content:
                            "This link is not valid.\n\nThink this is a mistake? Let us know",
                        ephemeral: true,
                    });
                }
            }
            if (interaction.customId.split("-")[0] == "claimsubmission") {
                // Begin claim handling
                bot.emit("claimReview", interaction, server, interaction.customId.split("-")[1]);
            }
            if (interaction.customId.split("-")[0] == "rejectsubmission") {
                // Begin rejection handling
                bot.emit("rejectReview", interaction, server, interaction.customId.split("-")[1]);
            }
            if (interaction.customId.startsWith("closesubmission-")) {
                // Close. NOT FINAL STEP. THIS IS WHEN REVIEW STATUS IS SET TO CLOSED. COMPLETE IS LAST
                bot.emit("closeSubmission", interaction, server);
            }
            if (interaction.customId.startsWith("delete-")) {
                // THIS IS WHAT DELETES CHANNEL AND SO ON
                bot.emit("completeReview", interaction, server);
            }
            if (interaction.customId.startsWith("completesubmission")) {
                let reviewlink =
                    interaction.fields.getTextInputValue("reviewlink");
                cLog(
                    [
                        "Review nr: ",
                        interaction.customId.replace("completesubmission-", ""),
                    ],
                    { guild: interaction.guild, subProcess: "setReviewLink" }
                );

                const reviewHistory = await getCorrectTable(
                    server.serverId,
                    "reviewHistory"
                ).then((table) => {
                    return table.findOne({
                        // Gets the correct table for server
                        where: {
                            id: interaction.customId.replace(
                                "completesubmission-",
                                ""
                            ),
                        },
                    });
                });
                await reviewHistory.update({
                    reviewLink: reviewlink,
                });
                // WoW logs to sheet as well
                if (server.serverName == "WoW") {
                    await updateGoogleSheet(
                        createSheetBody(
                            mode,
                            interaction.customId.replace(
                                "completesubmission-",
                                ""
                            ),
                            { reviewLink: reviewlink }
                        )
                    );
                }
                await interaction.reply({
                    content: "Updated the review link to " + reviewlink,
                    ephemeral: true,
                });
            }
            if (interaction.customId.includes("reviewrating")) {
                // Handle user submitted reviews to their review
                bot.emit("rateReview", interaction);
            }
            if (interaction.customId.startsWith("clip-")) {
                // THIS MIGHT BE DEPRECATED
                bot.emit("mediaCollection", interaction, server);
            }
        } catch (err) {
            console.log(
                "Failed somewhere during interaction : ",
                err,
                interaction.user.username
            );
            await interaction.reply({
                content: "Something went wrong, please contact staff",
                ephemeral: true,
            });
        }
    },
};

async function slashCommandHandler(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
            return;
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `${error}`, ephemeral: true });
            return;
        }
    }
}

async function blockIfLacksRole(interaction, game) {
    if (game == "WoW") {
        if (
            !interaction.member.roles.cache.some(
                (role) =>
                    role.name === "🧨 Infinity Member" ||
                    role.name === "💙Premium Member"
            )
        ) {
            await interaction.reply({
                content:
                    "You need to be 🧨 Infinity Member or 💙Premium Member",
                ephemeral: true,
            });
            return true;
        }
    }
    if (game == "Valorant") {
        if (
            !interaction.member.roles.cache.some(
                (role) =>
                    role.name === "💎・Infinity+" ||
                    role.name === "🌸・Server Booster"
            )
        ) {
            await interaction.reply({
                content: "You need to be 💎・Infinity+ or 🌸・Server Booster",
                ephemeral: true,
            });
            return true;
        }
        if (game == "Dev") {
            return false;
        }
    }
}

function validLink(interaction, game) {
    if (game == "WoW") {
        return regexWoWLink.test(
            interaction.fields.getTextInputValue("armory")
        );
    } else if (game == "Valorant") {
        return regexValLink.test(
            interaction.fields.getTextInputValue("tracker")
        );
    } else {
        cLog(["Unknown server for regexCheck"], {
            guild: interaction.guildId,
            subProcess: "RegexCheck",
        });
        return true;
    }
}
