const { DataTypes, Model } = require("sequelize");

module.exports = class SCverifiedAccountDB extends Model {
    static init(sequelize) {
        return super.init({
            userID: { type: DataTypes.STRING },
            userEmail: { type: DataTypes.STRING },
        }, {
            tableName: "SCverifiedAccountDB",
            timestamps:true,
            sequelize
        });
    }
}