const emojis = require('../emojis/data-by-emoji-base.json')
const fs = require('fs')

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

let returnedEmojis;
let returnV;

const find = async (req, res) => {
  returnedEmojis = emojis.filter((emoji) => {
    if (emoji.keywords) return emoji.keywords.includes(':)')
  })

  return returnedEmojis
}

const used = process.memoryUsage();
for (let key in used) {
  console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
}

var start = new Date().getTime();
console.log(start)
find();
var end = new Date().getTime();
console.log(`Call to find took ${end - start} milliseconds.`);
console.log(returnedEmojis)
