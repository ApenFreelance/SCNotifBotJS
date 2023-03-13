const { DataTypes, Model } = require("sequelize");

module.exports = class CharacterHistory extends Model {
    static init(sequelize) {
        return super.init({
            characterName: { type: DataTypes.STRING },
            honorableKills: { type: DataTypes.INTEGER },
            twoVtwoRating: { type: DataTypes.INTEGER },
            threeVthreeRating: { type: DataTypes.INTEGER },
            tenVtenRating: { type: DataTypes.INTEGER },
            soloShuffleFuryRating: { type: DataTypes.INTEGER }, 
            soloShuffleArmsRating: { type: DataTypes.INTEGER }, 
            soloShuffleProtectionRating: { type: DataTypes.INTEGER }, 
            
        }, {
            tableName: "characterHistory",
            timestamps:true,
            sequelize
        });
    }
}