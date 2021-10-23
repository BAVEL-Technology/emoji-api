import * as fs from 'fs'
import * as https from 'https'
import axios from 'axios'
import * as jsdom from 'jsdom'
import chalk from 'chalk'
import ora from 'ora'
import { AllEmojiData, EmojiData, FullEmojiMeta, Groups } from '../types'

const orderedEmojiData = fs.readFileSync('emojis/emoji-order.txt', 'utf-8')
const groupedEmojiData = fs.readFileSync('emojis/emoji-group.txt', 'utf-8')
const emojiListHtml = fs.readFileSync('emojis/emoji-list.html', 'utf-8')
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

const build = async () => {
  let currentGroup: string,
  currentSubGroup: string = ''

  const spinner = ora('🤓 Starting Emoji ETL Pipeline...')
  spinner.color = 'cyan'
  spinner.start()
  const groupedEmojiDataByLine: string[] = groupedEmojiData.split('\n')
  groupedEmojiDataByLine.forEach((line, i) => {
    spinner.text = `🤓 Processing line ${i + 1} of ${groupedEmojiDataByLine.length}`
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
  function slugify(str: string, deliminator: string = '_'): string {
    return str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\(.+\)/g, '')
      .trim().replace(/[\W|_]+/g, deliminator)
      .toLowerCase()
  }

  spinner.text = '🤓 Processing emoji keywords'
  const rChars: string[] = emojiListHtml.split(`<td class='rchars'>`)
  rChars.forEach((chars, i) => {
    spinner.text = `🤓 Processing line ${i + 1} of ${rChars.length}`
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
  spinner.text = '🤓 Processing ordered emoji list'
  orderedEmojiDataLineByLine.forEach((line, i) => {
    spinner.text = `🤓 Processing line ${i + 1} of ${orderedEmojiDataLineByLine.length}`
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

  const getEmojiImages = async (slug: string, emoji:string, index: number) => {
    try {
      const res: { data: any } = await axios.get(`https://emojipedia.org/${encodeURI(slug)}`)
      spinner.text = `🤓 Processing emoji ${emoji} image ${index + 1} of ${allEmojis.length}`
      if (!res?.data) {
        spinner.text = `🤓 Couldn't get html for ${emoji} image ${index + 1} of ${allEmojis.length}`
      } else {
        const dom = new jsdom.JSDOM(res.data)
        const listItems = dom.window.document
          .querySelector('.vendor-list')
          .querySelectorAll('ul')[0]
          .querySelectorAll('li')
        for (let i = 0; i < listItems.length; i++) {
          const node = listItems[i]
          const style = node.querySelector('.vendor-container')
            .querySelector('.vendor-info')
            ?.querySelector('h2')
            ?.querySelector('a')?.textContent
          if (style) {
            spinner.text = `🤓 Processing emoji style ${style} for ${emoji} image ${index + 1} of ${allEmojis.length}`
            const image = node.querySelector('.vendor-container')
              .querySelector('.vendor-image')
              .querySelector('img').getAttribute('srcset').split(' ')[0]
            fs.mkdirSync(`images/${style}`, { recursive: true })
            https.get(image, (res_1) => {
              const data: any = []
              res_1.on('data', function (chunk) {
                data.push(chunk)
              }).on('end', function () {
                var buffer = Buffer.concat(data)
                fs.writeFile(`images/${style}/${dataByEmoji[emoji].slug}.png`, buffer.toString('base64'), 'base64', function (err) {
                  if (err)
                    console.log(chalk.red(`\n👹 ${emoji}: ${dataByEmoji[emoji].name} ` + err.message))
                })
              })
            })
          }
        }
      }
    } catch (err) {
      if (err.message.includes('404')) {
        await getEmojiImages(emoji, emoji, index)
      } else {
        console.log(chalk.red(`\n👹 ${emoji}: ${dataByEmoji[emoji].name} ` + err.message))
      }
    }
  }

  spinner.text = '🤓 Processing emoji images'
  fs.mkdirSync('images', { recursive: true })
  const perChunk = 10 // items per chunk    
  const chunkedEmojijs = allEmojis.reduce((resultArray, item, index) => { 
  const chunkIndex = Math.floor(index/perChunk)
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  const promiseToGetEmojiImages = async () => {
    for (let i = 0; i < chunkedEmojijs.length; i++) {
      if (i > 5) return
      spinner.text = `🤓 Working on chunk ${i + 1} / ${chunkedEmojijs.length}`
      let chunkIndex = i * 100
      await Promise.all(chunkedEmojijs[i]
        .map((emoji: FullEmojiMeta<string>, index: number) => 
          getEmojiImages(slugify(emoji.name, '-'), emoji.emoji, chunkIndex + index)
        )
      )
    }
  }

  await promiseToGetEmojiImages()

  spinner.text = '🤓 Writing JSON files...'
  fs.writeFileSync('emojis/data-by-emoji.json', JSON.stringify(dataByEmoji, null, 2))
  fs.writeFileSync('emojis/data-by-emoji-base.json', JSON.stringify(allEmojis, null, 2))
  fs.writeFileSync('emojis/data-by-group.json', JSON.stringify(dataByGroup, null, 2))
  fs.writeFileSync('emojis/data-ordered-emoji.json', JSON.stringify(orderedEmoji, null, 2))
  fs.writeFileSync('emojis/data-emoji-components.json', JSON.stringify(emojiComponents, null, 2))
  fs.writeFileSync('emojis/data-emoji-keywords.json', JSON.stringify(keywordMap, null, 2))
  spinner.succeed('🤓 Done!')
}

build()