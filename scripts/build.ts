import fs from 'fs'
import chalk from 'chalk'
import { AllEmojiData, EmojiData, FullEmojiMeta, Groups } from '../types'

const orderedEmojiData = fs.readFileSync('emojis/emoji-order.txt', 'utf-8')
const groupedEmojiData = fs.readFileSync('emojis/emoji-group.txt', 'utf-8')
const emojiListHtml = fs.readFileSync('emojis/emoji-list.html', 'utf-8')
const emojiImageList = fs.readFileSync('emojis/emoji-images.html', 'utf-8')
const emojiImageListSkinTones = fs.readFileSync('emojis/emoji-images-skin-tone.html', 'utf-8')
const VARIATION_16: string = String.fromCodePoint(0xfe0f)
const SKIN_TONE_VARIATION_DESC: RegExp = /\sskin\stone(?:,|$)/
const HAIR_STYLE_VARIATION_DESC: RegExp = /\shair(?:,|$)/

const orderedEmoji: string[] = []
const dataByEmoji: EmojiData<FullEmojiMeta<null>> = {}
const dataByGroup: Groups = {}
const emojiComponents: { [key: string ]: string } = {}
const keywords: { [key: string]: string[] } = {}
const keywordsByName: { [key: string]: string[] } = {}
const keywordMap: { [key: string]: string[] } = {}
const emojiCategories: { [key: string]: string[] } = {}
const emojiSubCategories: { [key: string]: string[] } = {}
const GROUP_REGEX: RegExp = /^#\sgroup:\s(?<name>.+)/
const SUB_GROUP_REGEX: RegExp = /^#\ssubgroup:\s(?<name>.+)/
const EMOJI_REGEX: RegExp = 
  /^[^#]+;\s(?<type>[\w-]+)\s+#\s(?<emoji>\S+)\sE(?<emojiversion>\d+\.\d)\s(?<desc>.+)/
const ORDERED_EMOJI_REGEX: RegExp = 
  /\.?(?<code>.*)\s;\s(?<version>[0-9.]+)\s#\s(?<emoji>\S+)\s(?<name>[^:]+)(?::\s)?(?<desc>.+)?/
const HTML_REGEX: RegExp = /img alt='(?<emoji>.+?)'/
const BASE64_REGEX: RegExp = /img alt='(?<emoji>.+?)'.+?src='(?<base64>.+?)'/

let currentGroup: string,
currentSubGroup: string = ''

const groupedEmojiDataByLine: string[] = groupedEmojiData.split('\n')
groupedEmojiDataByLine.forEach((line, i) => {
  const groupMatch: RegExpMatchArray = line.match(GROUP_REGEX)
  const subGroupMatch: RegExpMatchArray = line.match(SUB_GROUP_REGEX)
  if (groupMatch) {
    currentGroup = groupMatch.groups.name
    emojiCategories[currentGroup] = []
  } else if (subGroupMatch) {
    currentSubGroup = subGroupMatch.groups.name
    emojiSubCategories[currentSubGroup] = []
  } else {
    const emojiMatch: RegExpMatchArray = line.match(EMOJI_REGEX)
    if (emojiMatch) {
      const { groups: { type, emoji, desc, emojiversion } } = emojiMatch
      if (type === 'fully-qualified') {
        if (line.match(SKIN_TONE_VARIATION_DESC)) return
        dataByEmoji[emoji] = {
          name: null,
          slug: null,
          group: currentGroup,
          sub_group: currentSubGroup,
          emoji_version: emojiversion,
          unicode_version: null,
          skin_tone_support: null
        }
        emojiCategories[currentGroup].push(emoji)
        emojiSubCategories[currentSubGroup].push(emoji)
      } else if (type === 'component') {
        emojiComponents[slugify(desc)] = emoji
      }
    }
  }
})
// Returns machine readable emoji short code
function slugify(str: string): string {
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.+\)/g, '')
    .trim().replace(/[\W|_]+/g, '_')
    .toLowerCase()
}

const rChars: string[] = emojiListHtml.split(`<td class='rchars'>`)
rChars.forEach((chars, i) => {
  const emojiRegExpResult: RegExpMatchArray = chars.match(HTML_REGEX)
  if (emojiRegExpResult) {
    const keywordRegExpResult: RegExpMatchArray = chars.match(/<td class='name'>(?<name>.+?)<\/td>/gm)
    let individualKeywords: string[] = []
    if (keywordRegExpResult) keywordRegExpResult.forEach(name => {
      const keywordLineRegExpResult: RegExpMatchArray = name.match(/<td class='name'>(?<name>.+?)<\/td>/)
      let keys: string[] = []
      if (keywordLineRegExpResult.groups.name.split(' | ').length) 
        keys = [...keywordLineRegExpResult.groups.name.split(' | ')]
      else keys = [keywordLineRegExpResult.groups.name]
      individualKeywords = [...individualKeywords, ...keys]
    })
    keywords[emojiRegExpResult.groups.emoji] = individualKeywords
    keywordsByName[slugify(individualKeywords[0])] = individualKeywords
    individualKeywords.forEach(keyword => {
      if (keywordMap[keyword]) keywordMap[keyword].push(emojiRegExpResult.groups.emoji)
      else keywordMap[keyword] = [emojiRegExpResult.groups.emoji]
    })
  }
})

let currentEmoji: string = ''
const baseEmojis: string[] = []

const allEmojis: AllEmojiData[] = []
const orderedEmojiDataLineByLine: string[] = orderedEmojiData.split('\n')
orderedEmojiDataLineByLine.forEach((line, i) => {
  if (line.length === 0) return
  const match: RegExpMatchArray = line.match(ORDERED_EMOJI_REGEX)
  if (!match) return
  const { groups: { code, version, emoji, name, desc } } = match
  currentEmoji = emoji
  let categories = Object.keys(emojiCategories)
  let findEmojiCategory: string[] = []
  categories.forEach((category, i) => {
    let filtered = emojiCategories[category].filter((e) => e == emoji)
    if (filtered?.length) findEmojiCategory.push(category)
  })
  const codes = code.split(' ')
  if(!baseEmojis.includes(String.fromCodePoint(parseInt(codes[0].split('+')[1], 16)))) 
    baseEmojis.push(String.fromCodePoint(parseInt(codes[0].split('+')[1], 16)))
  const isSkinToneVariation = desc && !!desc.match(SKIN_TONE_VARIATION_DESC) //Check if skin tone is in description
  const isHairStyleVariation = desc && !!desc.match(HAIR_STYLE_VARIATION_DESC) //Check if hair style is in description
  const fullName = desc && (!isSkinToneVariation || !isHairStyleVariation) ? [name, desc].join(' ') : name
  if (isSkinToneVariation || isHairStyleVariation) {
    if (dataByEmoji[currentEmoji]) {
      dataByEmoji[currentEmoji].hair_style_support = isHairStyleVariation //If it is, set the skin tone and version of the level 1 emoji
      if (isHairStyleVariation) dataByEmoji[currentEmoji].hair_style_support_unicode_version = version
      dataByEmoji[currentEmoji].skin_tone_support = isSkinToneVariation //If it is, set the skin tone and version of the level 1 emoji
      if (isSkinToneVariation) dataByEmoji[currentEmoji].skin_tone_support_unicode_version = version
      dataByEmoji[currentEmoji].unicode_version = version
      dataByEmoji[currentEmoji].name = fullName
      dataByEmoji[currentEmoji].slug = slugify(fullName)
      dataByEmoji[currentEmoji].keywords = keywords[emoji]?.length ? keywords[emoji] : []
    }
  } else {
    // Workaround for ordered data missing VARIATION_16 (smiling_face)
    const emojiWithOptionalVariation16 = dataByEmoji[emoji] ? emoji : emoji + VARIATION_16
    const emojiEntry = dataByEmoji[emojiWithOptionalVariation16]
    if (!emojiEntry) {
      if (Object.values(emojiComponents).includes(emoji)) return
      throw `${emoji} entry from emoji-order.txt match not found in emoji-group.txt`
    }
    currentEmoji = emojiWithOptionalVariation16
    orderedEmoji.push(currentEmoji)
    dataByEmoji[currentEmoji].name = fullName
    dataByEmoji[currentEmoji].slug = slugify(fullName)
    dataByEmoji[currentEmoji].unicode_version = version
    dataByEmoji[currentEmoji].skin_tone_support = false
    dataByEmoji[currentEmoji].hair_style_support = false
    dataByEmoji[currentEmoji].keywords = keywords[emoji].length ? keywords[emoji] : []
  }

  allEmojis.push({
    ...match.groups,
    slug: slugify(name),
    slug_desc: desc ? slugify(name + '_' + desc) : slugify(name),
    category: findEmojiCategory?.length ? findEmojiCategory[0] : '',
    keywords: (() => {
      if (keywords[emoji]?.length) return keywords[emoji]
      else if (isSkinToneVariation) return keywordsByName[slugify(name)]
    })(),
  })
})

for (const emoji of orderedEmoji) {
  const { group, sub_group } = dataByEmoji[emoji]
  let existingGroup = dataByGroup[group]
  if (!existingGroup) dataByGroup[group] = {}
  let existingSubGroup = dataByGroup[group][sub_group]
  if (!existingGroup || !existingSubGroup) dataByGroup[group][sub_group] = []
  dataByGroup[group][sub_group].push({
    emoji,
    ...dataByEmoji[emoji]
  })
}

const imageOrder = ['Apple', 'Google', 'Facebook', 'Windows', 'Twitter', 'JoyPixels', 'Samsung']
const emojiBlocks: string[] = emojiImageList.split(`<tr><td class='rchars'>`)
fs.mkdirSync('images', { recursive: true })
emojiBlocks.forEach((emoji, i) => {
  const imageChars: string[] = emoji.split(`<td class='andr`)
  imageChars.forEach((chars, charIndex) => {
    charIndex = charIndex - 1
    if (imageOrder[charIndex]) {
      fs.mkdirSync(`images/${imageOrder[charIndex]}`, { recursive: true })
      const emojiBase64: RegExpMatchArray = chars.match(BASE64_REGEX)
      if (emojiBase64?.groups?.base64 && emojiBase64?.groups?.emoji && dataByEmoji[emojiBase64?.groups?.emoji]) {
        const base64Data = emojiBase64?.groups?.base64.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(`images/${imageOrder[charIndex]}/${dataByEmoji[emojiBase64?.groups?.emoji].slug}.png`, base64Data, 'base64')
      }
    }
  })
})

const emojiSkinToneBlocks: string[] = emojiImageListSkinTones.split(`<tr><td class='rchars'>`)
emojiSkinToneBlocks.forEach((emoji, i) => {
  const nameRegExp = emoji.match(/class='name'>(?<name>.+?)</)
  if (nameRegExp?.groups?.name) {
    const imageChars: string[] = emoji.split(`<td class='andr`)
    imageChars.forEach((chars, charIndex) => {
      charIndex = charIndex - 1
      if (imageOrder[charIndex]) {
        fs.mkdirSync(`images/${imageOrder[charIndex]}`, { recursive: true })
        const emojiBase64: RegExpMatchArray = chars.match(BASE64_REGEX)
        if (emojiBase64?.groups?.base64 && emojiBase64?.groups?.emoji && dataByEmoji[emojiBase64?.groups?.emoji]) {
          const base64Data = emojiBase64?.groups?.base64.replace(/^data:image\/png;base64,/, "");
          fs.writeFileSync(`images/${imageOrder[charIndex]}/${slugify(nameRegExp?.groups?.name)}.png`, base64Data, 'base64')
        }
      }
    })
  }
})

fs.writeFileSync('emojis/data-by-emoji.json', JSON.stringify(dataByEmoji, null, 2))
fs.writeFileSync('emojis/data-by-emoji-base.json', JSON.stringify(allEmojis, null, 2))
fs.writeFileSync('emojis/data-by-group.json', JSON.stringify(dataByGroup, null, 2))
fs.writeFileSync('emojis/data-ordered-emoji.json', JSON.stringify(orderedEmoji, null, 2))
fs.writeFileSync('emojis/data-emoji-components.json', JSON.stringify(emojiComponents, null, 2))
fs.writeFileSync('emojis/data-emoji-keywords.json', JSON.stringify(keywordMap, null, 2))
