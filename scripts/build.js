const fs = require('fs')
const orderedEmojiData = fs.readFileSync('../emojis/emoji-order.txt', 'utf-8')
const groupedEmojiData = fs.readFileSync('../emojis/emoji-group.txt', 'utf-8')
const VARIATION_16 = String.fromCodePoint(0xfe0f)
const SKIN_TONE_VARIATION_DESC = /\sskin\stone(?:,|$)/
const HAIR_STYLE_VARIATION_DESC = /\shair(?:,|$)/

// Final data holder
const orderedEmoji = []
const dataByEmoji = {}
const dataByGroup = {}
const emojiComponents = {}

// The group data tells if the emoji is one of the following:
//   component
//   fully-qualified
//   minimally-qualified
//   unqualified
//
// We only want fully-qualified emoji in the output data

// # group: Smileys & Emotion
//          |1--------------|
//
const GROUP_REGEX = /^#\sgroup:\s(?<name>.+)/

// 1F646 200D 2640 FE0F                       ; fully-qualified     # 🙆‍♀️ E4.0 woman gesturing OK
//                                              |1------------|      |2--||3-| |4---------------|
// 1F469 200D 1F469 200D 1F467 200D 1F467     ; fully-qualified     # 👩‍👩‍👧‍👧 E2.0 family: woman, woman, girl, girl
//                                              |1------------|      |2-| |3| |4-----------------------------|
//
const EMOJI_REGEX = /^[^#]+;\s(?<type>[\w-]+)\s+#\s(?<emoji>\S+)\sE(?<emojiversion>\d+\.\d)\s(?<desc>.+)/
let currentGroup = null
groupedEmojiData.split('\n').forEach((line, i) => {
  const groupMatch = line.match(GROUP_REGEX)
  if (groupMatch) {
    // [
    //   '# group: Flags',
    //   'Flags',
    //   index: 0,
    //   input: '# group: Flags',
    //   groups: [Object: null prototype] { name: 'Flags' }
    // ]
    currentGroup = groupMatch.groups.name
  } else {
    const emojiMatch = line.match(EMOJI_REGEX)
    // [
    //   '1F1F8 1F1EE                                ; ' +
    //     'fully-qualified     # 🇸🇮 E2.0 flag: Slovenia',
    //   'fully-qualified',
    //   '🇸🇮',
    //   '2.0',
    //   'flag: Slovenia',
    //   index: 0,
    //   input: '1F1F8 1F1EE                                ; ' +
    //     'fully-qualified     # 🇸🇮 E2.0 flag: Slovenia',
    //   groups: [Object: null prototype] {
    //     type: 'fully-qualified',
    //     emoji: '🇸🇮',
    //     emojiversion: '2.0',
    //     desc: 'flag: Slovenia'
    //   }
    // ]
    if (emojiMatch) {
      const {groups: {type, emoji, desc, emojiversion}} = emojiMatch
      if (type === 'fully-qualified') {
        if (line.match(SKIN_TONE_VARIATION_DESC)) return
        dataByEmoji[emoji] = {
          name: null,
          slug: null,
          group: currentGroup,
          emoji_version: emojiversion,
          unicode_version: null,
          skin_tone_support: null
        }
      } else if (type === 'component') {
        emojiComponents[slugify(desc)] = emoji
      }
    }
  }
})

// Currently at:
// "😀": {
//   "name": null,
//   "slug": null,
//   "group": "Smileys & Emotion",
//   "emoji_version": "1.0",
//   "unicode_version": null,
//   "skin_tone_support": null
// },

// 'flag: St. Kitts & Nevis' -> 'flag_st_kitts_nevis'
// 'family: woman, woman, boy, boy' -> 'family_woman_woman_boy_boy'
// 'A button (blood type)' -> 'a_button'
// 'Cocos (Keeling) Islands' -> 'cocos_islands'
//
// Returns machine readable emoji short code
function slugify(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\(.+\)/g, '').trim().replace(/[\W|_]+/g, '_').toLowerCase()
}

// U+1F44B ; 6.0 # 👋 waving hand
//          |1--| |2-|3----------|
//
// U+1F442 U+1F3FB ; 8.0 # 👂🏻 ear: light skin tone
//                  |1--| |2-|3--||4--------------|
//
// U+1F469 U+200D U+1F467 U+200D U+1F467 ; 6.0 # 👩‍👧‍👧 family: woman, girl, girl
//                                        |1--| |2-|3-----||4----------------|
//
const ORDERED_EMOJI_REGEX = /\.?(?<code>.*)\s;\s(?<version>[0-9.]+)\s#\s(?<emoji>\S+)\s(?<name>[^:]+)(?::\s)?(?<desc>.+)?/

let currentEmoji = null

const baseEmojis = []
const allEmojis = []
orderedEmojiData.split('\n').forEach((line, i) => {
  if (line.length === 0) return
  const match = line.match(ORDERED_EMOJI_REGEX)
  if (!match) return
  // [
  //   'U+1F3F4 U+E0067 U+E0062 U+E0077 U+E006C ' +
  //     'U+E0073 U+E007F ; 5.0 # 🏴󠁧󠁢󠁷󠁬󠁳󠁿 flag: ' +
  //     'Wales',
  //   '5.0',
  //   '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  //   'flag',
  //   'Wales',
  //   index: 0,
  //   input: 'U+1F3F4 U+E0067 U+E0062 U+E0077 U+E006C ' +
  //     'U+E0073 U+E007F ; 5.0 # 🏴󠁧󠁢󠁷󠁬󠁳󠁿 flag: ' +
  //     'Wales',
  //   groups: [Object: null prototype] {
  //     version: '5.0',
  //     emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  //     name: 'flag',
  //     desc: 'Wales'
  //   }
  // ]
  const {groups: {code, version, emoji, name, desc}} = match
  allEmojis.push(match.groups)
  const codes = code.split(' ')
  if(!baseEmojis.includes(String.fromCodePoint(parseInt(codes[0].split('+')[1], 16)))) baseEmojis.push(String.fromCodePoint(parseInt(codes[0].split('+')[1], 16)))
  const isSkinToneVariation = desc && !!desc.match(SKIN_TONE_VARIATION_DESC) //Check if skin tone is in description
  const isHairStyleVariation = desc && !!desc.match(HAIR_STYLE_VARIATION_DESC) //Check if hair style is in description
  const fullName = desc && (!isSkinToneVariation || !isHairStyleVariation) ? [name, desc].join(' ') : name
  if (isSkinToneVariation || isHairStyleVariation) {
    dataByEmoji[currentEmoji].hair_style_support = isHairStyleVariation //If it is, set the skin tone and version of the level 1 emoji
    dataByEmoji[currentEmoji].hair_style_support_unicode_version = isHairStyleVariation ? version : false
    dataByEmoji[currentEmoji].skin_tone_support = isSkinToneVariation //If it is, set the skin tone and version of the level 1 emoji
    dataByEmoji[currentEmoji].skin_tone_support_unicode_version = isSkinToneVariation ? version : false
  } else {
    // Workaround for ordered data missing VARIATION_16 (smiling_face)
    emojiWithOptionalVariation16 = dataByEmoji[emoji] ? emoji : emoji + VARIATION_16
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
  }
})

for (const emoji of orderedEmoji) {
  const {group, skin_tone_support, skin_tone_support_unicode_version, name, slug, emoji_version, unicode_version} = dataByEmoji[emoji]
  const existingGroup = dataByGroup[group]
  if (!existingGroup) dataByGroup[group] = []
  dataByGroup[group].push({
    emoji,
    skin_tone_support,
    skin_tone_support_unicode_version,
    name,
    slug,
    unicode_version,
    emoji_version
  })
}

// {
//   "😀": {
//     "group": "Smileys & Emotion",
//     "sub_group": "Whatever",
//     "name": "grinning face",
//     "slug": "grinning_face",
//     "version": "6.1",
//     "skin_tone_support": false,
//   },
//   ...
// }
fs.writeFileSync('emojis/data-by-emoji.json', JSON.stringify(dataByEmoji, null, 2))

fs.writeFileSync('emojis/data-by-emoji-base.json', JSON.stringify(allEmojis, null, 2))

// {
//   "Smileys & Emotion": [
//     {
//       "emoji": "😀",
//       "skin_tone_support": false,
//       "name": "grinning face",
//       "slug": "grinning_face",
//       "version": "6.1"
//     },
//   ],
//   ...
// }
fs.writeFileSync('emojis/data-by-group.json', JSON.stringify(dataByGroup, null, 2))

// [
//   "😀",
//   "😃",
//   ...
// ]
fs.writeFileSync('emojis/data-ordered-emoji.json', JSON.stringify(orderedEmoji, null, 2))

// {
//   "light_skin_tone": "🏻",
//   "medium_light_skin_tone": "🏼",
//   ...
// }
fs.writeFileSync('emojis/data-emoji-components.json', JSON.stringify(emojiComponents, null, 2))
