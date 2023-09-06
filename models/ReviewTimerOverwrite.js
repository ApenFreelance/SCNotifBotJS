const { DataTypes, Model } = require("sequelize");

module.exports = class ReviewTimerOverwrite extends Model {
    static init(sequelize) {
        return super.init({
         userName: { type: DataTypes.STRING },
         userId: { type: DataTypes.STRING },
         timeBetween: { type: DataTypes.STRING },
         uses: {type: DataTypes.STRING },
         isRole: {type: DataTypes.BOOLEAN},
         server: {type: DataTypes.STRING}
        }, {
            tableName: "ReviewTimerOverwrite",
            updatedAt:true,
            createdAt:true,
            raw:true,
            sequelize
        });
    }
}