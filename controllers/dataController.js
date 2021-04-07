const emojis = require('../emojis/data-by-emoji-base.json')
const components = require('../emojis/data-emoji-components.json')
const zwj = '‍'

module.exports = {
  find: async (req, res) => {
   try {
     let response = emojis.filter((emoji) => emoji.name === req.params.emoji)

     res.status(200).json(response)

   } catch (err) {
     console.log(err)
   }
 },
}
