const emojis = require('../emojis/data-by-emoji-base.json')
const components = require('../emojis/data-emoji-components.json')
const zwj = '‍'

module.exports = {
  find: async (req, res) => {
   try {
     let response = emojis.filter((emoji) => {
       if (emoji.keywords) {
         return emoji.keywords.includes(req.query.q) ||
         emoji.name.includes(req.query.q)
       }
     })
     if (req.query.skin_tone) {
       response = response.filter((emoji) => {
         if (emoji.desc) return emoji.desc.includes(req.query.skin_tone)
       })
     }

     if (req.query.hair_style) {
       response = response.filter((emoji) => {
         if (emoji.desc) return emoji.desc.includes(req.query.hair_style)
       })
     }

     if (req.query.gender) {
       response = response.filter((emoji) => {
         return emoji.name.includes(req.query.gender)
       })
     }

     res.status(200).json(response)

   } catch (err) {
     console.log(err)
   }
 },
}

//slug (name) XX
//keywords XX
//slug_desc
//skin_tone XX
//show skin tone variations
//default skin tone
//hair_style XX
//show hair style variations
//default hair style
//show gender options XX
//variations
  //sizing? w/ family
  //holding hands
