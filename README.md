# emoji-api
😏 Easy api for up to date unicode emojis...
:rage1:

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

We should just store base emojis, and we can manipulate them when needed. This will decrease the size of the emoji file in memory
