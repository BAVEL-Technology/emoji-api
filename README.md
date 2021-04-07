# emoji-api
😏 Easy api for up to date unicode emojis...
:rage1:


## The Goal:
Provide an eloquent way to store emoji data and recall inside Node and Deno. Publish an npm package and a online repository for deno.

Provide an easy to use API for searching for emojis through names, skin tones, hair style, gender, variations, categories, et all. And to provide this at lightening fast speeds with low costs associated. 

With these two goals achieved, provide components for Vue, Angular, React, Svelte, and Vanilla JS to search for and select emojis. Publish an npm package for these components.
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
