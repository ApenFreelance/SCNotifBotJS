const { DataTypes, Model } = require("sequelize");

module.exports = class ReviewHistory extends Model {
    static init(sequelize) {
        return super.init({
            userEmail: { 
                type: DataTypes.STRING,
         },
         userID: { type: DataTypes.STRING },
         status: {type: DataTypes.STRING },
         claimedBy: {type: DataTypes.STRING},
         claimedAt: {type: DataTypes.DATE},
         completedBy: {type: DataTypes.STRING},
         completedAt: {type: DataTypes.DATE},
         reviewLink: { type: DataTypes.STRING },
         reviewRating: {type:DataTypes.INTEGER},
         reviewRatingComment: {type: DataTypes.STRING}
        }, {
            tableName: "ReviewHistory",
            timestamps:true,
            sequelize
        });
    }
}