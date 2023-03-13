const { DataTypes, Model } = require("sequelize");

module.exports = class ReviewHistory extends Model {
    static init(sequelize) {
        return super.init({
            userEmail: { 
                type: DataTypes.STRING,
         },
         userID: { type: DataTypes.STRING },
         reviewLink: { type: DataTypes.STRING },
         status: {type: DataTypes.STRING },
         completedAt: {type: DataTypes.DATE}
        }, {
            tableName: "ReviewHistory",
            timestamps:true,
            sequelize
        });
    }
}