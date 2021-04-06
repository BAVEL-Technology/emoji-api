const emojis = require('../emojis/data-by-emoji.json')
const components = require('../emojis/data-emoji-components.json')
const zwj = '‍'

module.exports = {
  find: async (req, res) => {
   try {
     const keys = Object.keys(emojis)
     const emoji = keys.filter((e) => {
       return emojis[e].name === decodeURI(req.params.emoji) || emojis[e].slug === req.params.emoji
     })

     if (emoji.length != 1) res.status(404).json({ error: 'Emoji was not found!' })

     let response

     if (req.query.skin_tone && emojis[emoji].skin_tone_support) {
       response = {
         [emoji + components[req.query.skin_tone]]: {
           ...emojis[emoji],
           skin_tone: req.query.skin_tone
         }
       }
     } else {
       response = { [emoji]: emojis[emoji] }
     }

     res.status(200).json(response)

   } catch (err) {
     console.log(err)
   }
 },
}
