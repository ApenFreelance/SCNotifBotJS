const { DataTypes, Model } = require("sequelize");

module.exports = class WoWCharacters extends Model {
    static init(sequelize) {
        return super.init({
            userEmail: { 
                type: DataTypes.STRING,
         },
         armoryLink: {
            type: DataTypes.STRING
         },
         characterName: {
            type: DataTypes.STRING
         },
         characterRegion: {
            type: DataTypes.STRING
         },
         armorLevel: {
            type: DataTypes.INTEGER
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
         soloShuffleSpec1Rating: { type: DataTypes.INTEGER, allowNull:true }, 
         soloShuffleSpec2Rating: { type: DataTypes.INTEGER, allowNull:true }, 
         soloShuffleSpec3Rating: { type: DataTypes.INTEGER, allowNull:true },
         soloShuffleSpec4Rating: { type: DataTypes.INTEGER, allowNull:true },
        }, {
            tableName: "WoWCharacters",
            timestamps:true,
            sequelize
        });
    }
}