const ReviewHistory = require("../../../models/ReviewHistory");
const ValReviewHistory = require("../../../models/ValReviewHistory");
const { cLog } = require("../cLog");
require("dotenv").config();

async function updateClosedReviewDB({
  database,
  completedByID,
  completedByTag,
  guild = "System",
  submissionNr = "unspecified",
}) {
  const review = await database.update({
    status: "Closed",
    completedByID: completedByID,
    completedByTag: completedByTag,
  });
  cLog(["Closing: ", submissionNr], { guild: guild, subProcess: "Updated DB" });
  return review;
}



async function updatePlayerStats(reviewInDB, { guild, MMRdata = null }) {
  await reviewInDB.update({
    AllTimeTier: MMRdata.data.data.current_data.currenttierpatched,
    CurrentTier: MMRdata.data.data.highest_rank.patched_tier,
  });
  cLog(["Updated player stats for: ", reviewInDB.id], {
    guild: guild,
    subProcess: "Updated DB",
  });
}

module.exports = { updateClosedReviewDB, updatePlayerStats };
