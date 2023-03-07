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
         },honorableKills: { type: DataTypes.INTEGER },
         twoVtwoRating: { type: DataTypes.INTEGER },
         threeVthreeRating: { type: DataTypes.INTEGER },
         tenVtenRating: { type: DataTypes.INTEGER },
         soloShuffleFuryRating: { type: DataTypes.INTEGER }, 
         soloShuffleArmsRating: { type: DataTypes.INTEGER }, 
         soloShuffleProtectionRating: { type: DataTypes.INTEGER },
        }, {
            tableName: "WoWCharacters",
            timestamps:true,
            sequelize
        });
    }
}