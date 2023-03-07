const { DataTypes, Model } = require("sequelize");

module.exports = class SCverifV2 extends Model {
    static init(sequelize) {
        return super.init({
            userID: { type: DataTypes.STRING, unique:true },
            userEmail: { type: DataTypes.STRING, unique:true },
            userTag: { type: DataTypes.STRING },
        }, {
            tableName: "SCverifV2",
            timestamps:true,
            sequelize
        });
    }
}