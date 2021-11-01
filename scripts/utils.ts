import * as jsdom from 'jsdom'
import fs from 'fs'
import https from 'https'
import { AllEmojiData, EmojiData, FullEmojiMeta } from '../types'
import chalk from 'chalk'
import { Ora } from 'ora'

export type GetImageParams = {
  dom: jsdom.JSDOM, 
  emoji: string, 
  name: string,
  index: number, 
  allEmojis: AllEmojiData[],
  dataByEmoji: EmojiData<FullEmojiMeta<null>>,
  spinner: Ora
}

// Returns machine readable emoji short code
export const slugify = (str: string, deliminator: string = '_'): string => {
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.+\)/g, '')
    .trim().replace(/[\W|_]+/g, deliminator)
    .toLowerCase()
}

export const getEmojiImagesModule = async ({
  dom, 
  emoji, 
  name,
  index, 
  allEmojis,
  dataByEmoji,
  spinner
}: GetImageParams) => {
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
          fs.writeFile(
            `images/${style}/${slugify(name)}.png`, 
            buffer.toString('base64'), 
            'base64', 
            function (err) {
              if (err)
                console.log(chalk.red(`\n👹 ${emoji}: ${dataByEmoji[emoji]?.name} ` + err.message))
            }
          )
        })
      })
    }
  }
}