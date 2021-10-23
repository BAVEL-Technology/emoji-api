import { Handler } from "@netlify/functions"
import keywords from '../../emojis/data-emoji-keywords.json'
import emojis from '../../emojis/data-by-emoji.json'
import { EmojiData, FullEmojiMeta, KeywordMap } from "../../types"

const handler: Handler = async (event) => {
  try {
    const q = event.queryStringParameters.q
    const results = Array.from(
      new Set(
        Object.keys(keywords as KeywordMap).filter(key => key.startsWith(q))
        .map(keyword => (keywords as KeywordMap)[keyword]).flat()
        .map(emoji => {
          return {
            emoji,
            ...(emojis as EmojiData<FullEmojiMeta<null>>)[emoji]
          }
        })
      )
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        results,
        count: results.length
      }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
