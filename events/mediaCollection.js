const ReviewHistory = require("../models/ReviewHistory");

module.exports = {
  name: 'mediaCollection',
  once: false,
  async execute(interaction) {    
    let button = interaction.customId
      // do your stuff
      if(interaction.customId.includes("review")) {
        button = parseInt(button.replace("clip-", "").replace("-review", ""))
        ReviewHistory.findOne({where: {
          id:button
        }}).then(db => {
          db.update({
            reviewLink:"WIP"
          })
        })
        return
      }
      button = parseInt(button.replace("clip-", ""))
      ReviewHistory.findOne({where: {
        id:button
      }}).then(db => {
        db.update({
          reviewLink:"WIP"
        })
      })
  },
};
