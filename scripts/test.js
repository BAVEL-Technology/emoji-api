const fs = require('fs')
const orderedEmojiData = fs.readFileSync('../emojis/emoji-order.txt', 'utf-8')

const string = 'U+1F600 ; 1.0 # 😀 grinning face'
const returnV =   {
    "code": "U+1F448 U+1F3FB",
    "version": "1.0",
    "emoji": "👈🏻",
    "name": "backhand index pointing left",
    "desc": "light skin tone",
    "slug": "backhand_index_pointing_left",
    "images": [
      {
        "type": 
      }
    ],
    "keywords": [
      "backhand_index_pointing_left",
      "direction",
      "fingers",
      "hand",
      "left"
    ]
  },

//splitting
//regex
const ORDERED_EMOJI_REGEX = /\.?(?<code>.*)\s;\s(?<version>[0-9.]+)\s#\s(?<emoji>\S+)\s(?<name>[^:]+)(?::\s)?(?<desc>.+)?/


function build () {
  orderedEmojiData.split('\n').forEach((line) => {
    if (line.length === 0) return
    const match = line.match(ORDERED_EMOJI_REGEX)
    console.log(match[groups])
  })
  return 'not yet'
}
var start = new Date().getTime()
console.log(build())
var end = new Date().getTime();
console.log(`Call to find took ${end - start} milliseconds.`);

const used = process.memoryUsage();
for (let key in used) {
  console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
}
