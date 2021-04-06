# emoji-api
😏 Easy api for up to date unicode emojis...

```
$ npm run download
$ npm run build
$ node index.js
```

### Babel team notes
* How should we handle change in hair style and change in gender?
* Currently we handle skin tone by showing a skin_tone when queried

### Notes
```
|--Top Level Emoji --||-- Skin Tone --||--ZWJ --||--Hair Style --| || |--Hair Style --| |--Connector--|
       U+1F3FB            U+1F3FB        U+200D       U+1F9B3
```
