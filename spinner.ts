import process from 'process'
import fs from 'fs'
import rdl from 'readline'
const l = console.log
const std = process.stdout
const spinners = JSON.parse(fs.readFileSync('./spinner.json', 'utf8').toString())

export class Spinner {
  private timer: NodeJS.Timer

  constructor() { }
  
  spin() {
    std.write('\x1b[?25l')
    const spin = spinners.dots
    const spinnerFrames = spin.frames
    const spinnerTimeInterval = spin.interval
    let index = 0
    this.timer = setInterval(() => {
      let now = spinnerFrames[index]
      if (now === undefined) {
        index = 0
        now = spinnerFrames[index]
      }
      std.write(now)
      rdl.cursorTo(std, 0, 0)
      index = index >= spinnerFrames.length ? 0 : index + 1
    }, spinnerTimeInterval)
  }
}