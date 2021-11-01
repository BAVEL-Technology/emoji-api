export interface EmojiData<M> {
  [key: string]: M
}

export type Groups = {
  [key: string]: {
    [key: string]: FullEmojiMeta<string>[]
  }
}

export type KeywordMap = {
  [key: string]: string[]
}

export type SearchResultOptions = {
  query?: string,
  fuzziness?: number,
  version?: number,
  group?: string,
  subGroup?: string,
  limit?: number,
  offset?: number,
  skinTone?: string,
  hairStyle?: string
}

export type FullEmojiMeta<E> = {
  score?: number,
  emoji?: E | null,
  name?: string,
  slug?: string,
  group?: string,
  sub_group?: string,
  emoji_version?: string,
  unicode_version?: string,
  skin_tone_support?: boolean,
  skin_tone_support_unicode_version?: string,
  hair_style_support?: boolean,
  hair_style_support_unicode_version?: string,
  keywords?: string[],
  shortcodes?: {
    [key: string]: string
  }
}

export type AllEmojiData = {
  code?: string,
  emoji?: string,
  name?: string,
  version?: string,
  desc?: string,
  slug?: string,
  slug_desc?: string,
  category?: string,
  keywords?: string[],
}