import { Handler } from "@netlify/functions"
import keywords from '../../emojis/data-emoji-keywords.json'
import emojis from '../../emojis/data-by-emoji.json'
import { EmojiData, FullEmojiMeta, KeywordMap } from "../../types"
import Emojiify from "../../lib"
import { EventQueryStringParameters } from "@netlify/functions/src/function/event"
const e = new Emojiify()

const returnEmojiSearchResults = (queryString: EventQueryStringParameters) => {
  return {
    statusCode: 200,
    body: JSON.stringify(e.find({
      query: queryString.q,
      limit: parseInt(queryString.limit) || 5,
      offset: parseInt(queryString.offset) || 0,
      ...(queryString.skinTone) && { skinTone: queryString.skinTone },
      ...(queryString.subGroup) && { subGroup: queryString.subGroup },
      ...(queryString.group) && { group: queryString.group },
      ...(queryString.version) && { version: queryString.version }
    }))
  }
}

const returnEmojiImage = (emoji: string) => {
  return {
    body: 'hi',
    statusCode: 200
  }
}

const returnEmojiStatistics = (queryString: EventQueryStringParameters) => {
  
}

const handler: Handler = async (event) => {
  const params = event.path.split('/').map(p => decodeURI(p))
  console.log(params)
  const query = event.queryStringParameters
  switch (params[1]) {
    case '🔎': // search
      if (!query || query?.style) return returnEmojiImage(params[1])
      else return returnEmojiSearchResults(query)
    case '🔍': // search
      if (!query || query?.style) return returnEmojiImage(params[1])
      else return returnEmojiSearchResults(query.q)
    case 'search': // search
      return returnEmojiSearchResults(query.q)
    // case '📊': // statistics
    //   if (!query || query?.style) return returnEmojiImage(params[0])
    //   else return returnEmojiStatistics(query)
    // case '📈': // statistics
    //   if (!query || query?.style) return returnEmojiImage(params[0])
    //   else return returnEmojiStatistics(query)
    // case '📉': // statistics
    //   if (!query || query?.style) return returnEmojiImage(params[0])
    //   else return returnEmojiStatistics(query)
    // case 'statistics': // statistics
    //   return returnEmojiStatistics(query)
    // case '🐌': // search by slug specifically
    //   if (!query || query?.style) return returnEmojiImage(params[0])
    //   else return returnEmojiBySlug(query)
    // case 'slug': // search by slug specifically
    //   return returnEmojiBySlug(query)
    // case 'shortcode': // search by slug specifically
    //   return returnEmojiBySlug(query)
    // case '🐪🐫': // special bavel message
    //   return { }
    default: // image
      return returnEmojiImage(params[0])
  }
}

module.exports = { handler }
