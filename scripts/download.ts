import fs from 'fs';
import https from 'https';
import chalk from 'chalk';

// Default version to 14.0
let version = '14.0'

// Example call would be "npm run download 14.0"
if (process.argv[2]) {
  version = Number(process.argv[2]).toFixed(1).toString()
}

const files: { [key: string]: string } = {
  // Complete emoji list with version
  'emoji-order.txt': `https://unicode.org/emoji/charts-${version}/emoji-ordering.txt`,
  // Grouped emoji list with qualifier
  'emoji-group.txt': `https://unicode.org/Public/emoji/${version}/emoji-test.txt`,
  // Emoji count
  'emoji-counts.html': `https://unicode.org/emoji/charts-${version}/emoji-counts.html`,
  // Emoji list
  'emoji-list.html': `https://unicode.org/emoji/charts-${version}/emoji-list.html`,
  // Emoji images
  'emoji-images.html': `https://unicode.org/emoji/charts-${version}/full-emoji-list.html`,
  // Emoji images for skin tone
  'emoji-images-skin-tone.html': `https://unicode.org/emoji/charts-${version}/full-emoji-modifiers.html`
}

console.log(chalk.cyan(`😼 Fetching emoji data from unicode for version ${version}.`))
let completedFiles = 0

Object.keys(files).forEach(name => {
  fs.mkdir('emojis', { recursive: true }, (err) => {
    if (err) throw err;
  })
  
  console.log(chalk.cyan(`😼 Fetching ${name}...`))
  const file = fs.createWriteStream('emojis/' + name)
  https.get(files[name], function(response) {
    response.pipe(file)
    completedFiles++
    console.log(chalk.cyan(`😼 Downloaded ${name}, file ${completedFiles}/${Object.keys(files).length}.`))
    if (completedFiles === Object.keys(files).length) {
      console.log(chalk.green(`🎉 Done fetching emoji data.`))
    }
  })
})
