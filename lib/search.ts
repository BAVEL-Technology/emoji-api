import emojis from '../emojis/data-by-emoji.json'
import { EmojiData, FullEmojiMeta } from '../types'

const IS_EMOJI_REGEX = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu

export type SearchOptions = {
  query?: string
  filterResolver?: (emoji: string, query: string, options?: SearchOptions) => boolean
  scoreResolver?: (emoji: string, query: string, options?: SearchOptions) => FullEmojiMeta<string>
  version?: string
  group?: string
  subGroup?: string
  limit?: number
  offset?: number
  skinTone?: number
  hairStyle?: number
}

const _filterEmojis = (emoji: string, query: string, options?: SearchOptions): boolean => {
  let conditions = []
  if (query) {
    conditions.push((emojis as EmojiData<FullEmojiMeta<null>>)[emoji].keywords && 
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].keywords.filter(
      keyword => query.split(' ').filter(word => keyword.includes(word)).length
    ).length || (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug && 
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug.includes(query)
    || (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].name && 
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].name.includes(query))
  }

  if (options.group) conditions.push(
      (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].group === options.group
    )
  if (options.subGroup) 
    conditions.push(
      (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].sub_group === options.subGroup
    )
  if (options.version) 
    conditions.push(
      (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].emoji_version <= options.version
    )
  let bool = false

  conditions.forEach(condition => {
    if (condition) bool = true
  })

  return bool
}

const _scoreEmojis = (emoji: string, query: string, options?: SearchOptions): FullEmojiMeta<string> => {
  let score = 0;
  const words = query.split(' ')
  if (
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].name.startsWith(query) || 
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug.startsWith(query)
  ) score = score + 1
  else if (
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].name === query ||
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug === query
  ) score = score + 2
  if ((emojis as EmojiData<FullEmojiMeta<null>>)[emoji].keywords) 
    (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].keywords
    .forEach(keyword => {
      if (keyword.startsWith(query)) score = score + 0.5
      else if (keyword === query) score = score + 0.75
    })
  words.forEach(word => { 
    if ((emojis as EmojiData<FullEmojiMeta<null>>)[emoji].name.includes(word)) score = score + 0.1
    if ((emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug.includes(word)) score = score + 0.1
    if ((emojis as EmojiData<FullEmojiMeta<null>>)[emoji].keywords) 
      (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].keywords
      .forEach(keyword => {
        if (keyword.startsWith(word)) score = score + 0.1
        else if (keyword === word) score = score + 0.3
      })
  })
  if (
    words.every(word => 
      (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].keywords.includes(word)
    )
  ) score = score + 1
  return {
    score,
    emoji,
    ...(emojis as EmojiData<FullEmojiMeta<null>>)[emoji]
  }
}

export const search = (input: SearchOptions | string): FullEmojiMeta<string>[] => {
  let options: SearchOptions = {}
  if (typeof input === 'string') options.query = input
  else options = input

  return (
    Array.from(
      new Set<string>(
        Object.keys(emojis)
        .filter(emoji => options.filterResolver ?
          options.filterResolver(emoji, options.query, options) :
          _filterEmojis(emoji, options.query, options)
        )
      )
    )
  ).map(emoji => options.scoreResolver ?
    options.scoreResolver(emoji, options.query, options) :
    _scoreEmojis(emoji, options.query, options)
  )
  .sort((a, b) => b.score - a.score)
  .splice(options.offset || 0, options.limit || Infinity)
}

const _stripColons = (emoji: string): string => {
  return emoji.replace(/:/g, '')
}

const _addColons = (emoji: string): string => {
  return `:${emoji}:`
}

const _findEmojiByShortCode = (shortCode: string): string => {
  return Object.keys((emojis as EmojiData<FullEmojiMeta<null>>))
    .find(emoji => (emojis as EmojiData<FullEmojiMeta<null>>)[emoji].slug === _stripColons(emoji) ||
      Object.values((emojis as EmojiData<FullEmojiMeta<null>>)[emoji].shortcodes).includes(
        _addColons(_stripColons(emoji))
      )
    )
}

export const get = (emoji: string): FullEmojiMeta<string> => {
  if (emoji.match(IS_EMOJI_REGEX)) return {
    ...(emojis as EmojiData<FullEmojiMeta<null>>)[emoji],
    emoji
  } 
  
  return {
    emoji: _findEmojiByShortCode(emoji),
    ...(emojis as EmojiData<FullEmojiMeta<null>>)[_findEmojiByShortCode(emoji)]
  }
}