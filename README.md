# 😃 Emojify 
Easy, opinionated, custimizable, emoji search and data api, cdn, and html parser. 

## Emoji search api
The emoji search api comes as a cdn, npm package, or can be accessed through https.

```html
<script src="https://emojify.bavel.sh/cdn"></script>
```

```bash
npm i @bavel/emojify
```

### REST API for Emoji Search and Data

The base api endpoint is here:
```curl
https://emojify.bavel.sh
```

You can search emojis, meaning, proivde a search query and return an array of emojis and some of their metadata that fit the search query. There are several API endpoints for this:

* `\🔎`
* `\🔍`
* `\search`

Query parameter options for the search are:
* `q`: __string__: A query to search by
* `limit`: __number__: A max number of returned emojis
       * _defaults to 5_
* `offset`: __number__: If using a limit, the starting point for the results
       * _defaults to 0_
* `version`: __string__: The highest unicode version that should be used
       * _If not set all versions will be returned_
       * _defaults to *null*_
* `group`: __string__: A certain [emoji group]() that should be exclusivly used to search inside
       * _If not set all groups will be retusrned_
       * _defaults to *null*_
* `subgroup`: __string__: A certain [emoji subgroup]() that should be exclusivly used to search inside
       * _If not set all subgroups will be returned_
       * _defaults to *null*_
* `skinTone`: __string__: An [emoji skintone]() that should be used, if avaliable
       * _If not set only the emoji (yellow) skin tone will be returned_
       * _defaults to *null*_
* `hairStyle`: __string__: An [emoji hairstyle]() that should be used, if avaliable
       * _If not set, all hair colors will be returned_
       * _defaults to *null*_
* `gender`: __string__:  An [emoji gender]() that should be use, if avaliable 
       * _If not set, male, female, and gender neutral results will be returned_
       * _defaults to *null*_
* `strict`: __boolean__: Determine weather or not to use
