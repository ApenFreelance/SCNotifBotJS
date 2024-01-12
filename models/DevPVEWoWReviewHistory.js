const { DataTypes, Model } = require("sequelize");

module.exports = class DevPVEWoWReviewHistory extends Model {
    static init(sequelize) {
        return super.init({
         status: {type: DataTypes.STRING },
         userEmail: { type: DataTypes.STRING},
         userID: { type: DataTypes.STRING },
         userTag: { type: DataTypes.STRING },
         charIdOnSubmission: {type: DataTypes.INTEGER},
         clipLink: {type: DataTypes.STRING },
         claimedByID: {type: DataTypes.STRING},
         claimedByTag: {type: DataTypes.STRING},
         claimedAt: {type: DataTypes.DATE},
         closedByTag: {type: DataTypes.STRING},
         completedByID: {type: DataTypes.STRING},
         completedByTag: {type: DataTypes.STRING},
         completedAt: {type: DataTypes.DATE},
         reviewLink: { type: DataTypes.STRING },
         reviewRating: {type:DataTypes.INTEGER},
         reviewRatingComment: {type: DataTypes.TEXT}
        }, {
            tableName: "DevPVEWoWReviewHistory",
            updatedAt:false,
            createdAt:true,
            raw:true,
            sequelize
        });
    }
}