const { DataTypes, Model } = require("sequelize");

module.exports = class WoWCharacters extends Model {
    static init(sequelize) {
        return super.init({
            userEmail: { 
                type: DataTypes.STRING,
         },
         characterName: {
            type: DataTypes.STRING
         },
         characterRegion: {
            type: DataTypes.STRING
         },
         characterRace: {
            type: DataTypes.STRING
         },
         characterClass: {
            type: DataTypes.STRING
         },
         slug: {
            type: DataTypes.STRING
         },
         characterImage:{type: DataTypes.STRING },
         honorableKills: { type: DataTypes.INTEGER },
         twoVtwoRating: { type: DataTypes.INTEGER, allowNull:true },
         threeVthreeRating: { type: DataTypes.INTEGER, allowNull:true },
         tenVtenRating: { type: DataTypes.INTEGER, allowNull:true },
         soloShuffleFuryRating: { type: DataTypes.INTEGER, allowNull:true }, 
         soloShuffleArmsRating: { type: DataTypes.INTEGER, allowNull:true }, 
         soloShuffleProtectionRating: { type: DataTypes.INTEGER, allowNull:true },
        }, {
            tableName: "WoWCharacters",
            timestamps:true,
            sequelize
        });
    }
}