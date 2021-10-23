import { Handler } from "@netlify/functions"
import keywords from '../../emojis/data-emoji-keywords.json'
import emojis from '../../emojis/data-by-emoji.json'
import { EmojiData, FullEmojiMeta, KeywordMap } from "../../types"
let gm = require('gm').subClass({
  imageMagick: true
})
require('gm-base64')

const handler: Handler = async (event) => {
  try {
    const style = event.queryStringParameters?.style || 'Twitter'
    const emoji = decodeURI(event.path.replace('/', ''))
    console.log(emoji)
    console.log((emojis as EmojiData<FullEmojiMeta<null>>)[emoji])
    // const imgPath = `/images/${style}${(emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug}.png`
    // let data = `../../images/${style}${(emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug}.png`;
    // Buffer.from("Hello World").toString('base64')
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
      },
      isBase64Encoded: true,
      body: JSON.stringify(`data:image/png;base64,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`),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
