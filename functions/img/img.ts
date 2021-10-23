import { Handler } from "@netlify/functions"
import keywords from '../../emojis/data-emoji-keywords.json'
import emojis from '../../emojis/data-by-emoji.json'
import https from 'https'
import { EmojiData, FullEmojiMeta, KeywordMap } from "../../types"
import path from 'path'
import fs from 'fs'
const handler: Handler = async (event) => {
  try {
    const style = event.queryStringParameters?.style || 'Twitter'
    const emoji = decodeURI(event.path.replace('/', ''))
    console.log(emoji)
    console.log((emojis as EmojiData<FullEmojiMeta<null>>)[emoji])

    const path2 = path.join(process.cwd(), './images/Apple/alien.png')
    const pngBuffer = fs.readFileSync(path2)
    // let response;
    // await (() => {
    //   return new Promise((resolve, reject) => {
    //       https.get('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/man-vampire-light-skin-tone_1f9db-1f3fb-200d-2642-fe0f.png', function(res) {
    //       var data = [];

    //       res.on('data', function(chunk) {
    //           data.push(chunk);
    //       }).on('end', function() {
    //           //at this point data is an array of Buffers
    //           //so Buffer.concat() can make us a new Buffer
    //           //of all of them together
    //           var buffer = Buffer.concat(data);
    //           console.log(buffer.toString('base64'));
    //           response = buffer.toString('base64')
    //           resolve(response)
    //       });
    //     });
    //   })
    // })()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
      },
      isBase64Encoded: true,
      body: pngBuffer.toString('base64'),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
