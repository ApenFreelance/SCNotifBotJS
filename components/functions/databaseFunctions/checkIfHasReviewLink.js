const ReviewHistory = require("../../../models/ReviewHistory");

async function checkIfHasReviewLink(submissionNumber) {
    const history = await ReviewHistory.findOne({
        where:{
            id: submissionNumber
        }
    })
    if(history.dataValues.rewieLink == null) { return false }

    return true
}

module.exports = { checkIfHasReviewLink }