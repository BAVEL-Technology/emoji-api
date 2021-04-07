const fs = require('fs')
const orderedEmojiData = fs.readFileSync('../emojis/emoji-order.txt', 'utf-8')
const groupedEmojiData = fs.readFileSync('../emojis/emoji-group.txt', 'utf-8')
const ORDERED_EMOJI_REGEX = /\.?(?<code>.*)\s;\s(?<version>[0-9.]+)\s#\s(?<emoji>\S+)\s(?<name>[^:]+)(?::\s)?(?<desc>.+)?/

let allEmojis = []

orderedEmojiData.split('\n').forEach((line) => {
  if (line.length === 0) return
  const match = line.match(ORDERED_EMOJI_REGEX)

  let obj = {
    ...match.groups,
  }
  allEmojis.push(obj)
})

fs.writeFileSync('emojis/data-by-emoji-base2.json', JSON.stringify(allEmojis, null, 2))
