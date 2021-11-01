import { FullEmojiMeta } from "../types";
import { get, search, SearchOptions } from "./search";
import stats from '../stats/stats.json'
 
class Emojiify {
  private query: string;
  private filterResolver: (emoji: string, query: string, options?: SearchOptions) => boolean;
  private scoreResolver: (emoji: string, query: string, options?: SearchOptions) => FullEmojiMeta<string>;
  private missingEmojiResolver: (emoji: string) => string;
  private version: string;
  private group: string;
  private subGroup: string;
  private offset: number;
  private limit: number;
  private skinTone: string;
  private hairStyle: string;

  constructor(
    query?: string,
    filterResolver?: (emoji: string, query: string, options?: SearchOptions) => boolean,
    scoreResolver?: (emoji: string, query: string, options?: SearchOptions) => FullEmojiMeta<string>,
    missingEmojiResolver?: (emoji: string) => string,
    version?: string,
    group?: string,
    subGroup?: string,
    limit?: number,
    offset?: number,
    skinTone?: string,
    hairStyle?: string
  ) {
    this.query = query;
    this.filterResolver = filterResolver;
    this.scoreResolver = scoreResolver;
    this.missingEmojiResolver = missingEmojiResolver;
    this.version = version;
    this.group = group;
    this.subGroup = subGroup;
    this.offset = offset;
    this.limit = limit; 
    this.skinTone = skinTone;
    this.hairStyle = hairStyle;
  }

  find(input: SearchOptions | string): FullEmojiMeta<string>[] {
    return search(typeof input === 'string' ? {
      query: input,
      filterResolver: this.filterResolver,
      scoreResolver: this.scoreResolver,
      version: this.version,
      group: this.group,
      subGroup: this.subGroup,
      offset: this.offset,
      limit: this.limit,
      skinTone: this.skinTone,
      hairStyle: this.hairStyle
    } : {
      query: this.query,
      filterResolver: this.filterResolver,
      scoreResolver: this.scoreResolver,
      version: this.version,
      group: this.group,
      subGroup: this.subGroup,
      offset: this.offset,
      limit: this.limit,
      skinTone: this.skinTone,
      hairStyle: this.hairStyle,
      ...input
    })
  }

  get(emoji: string) {
    // Base by a version
    // Base by a group
    // Base by a subgroup
    return get(emoji);
  }

  emojify(input: string) {
    // also allow github, slack, emojipedia, slug
    // also resolver for missing emojis
    // also allow user to format the emoji
    return input.replace(/:([a-z0-9_\-]+):/g, (match, emoji) => {
      const emojiMeta = this.get(emoji);
      if (emojiMeta) {
        return emojiMeta.emoji;
      }
      return match;
    });
  }

  parse(html: string) {
    return html.replace(/<(.+)>/g, (_, emoji) => {
      const emojiMeta = this.get(emoji);
      if (emojiMeta) {
        return `<img class="emojify" src="https://emojiapi.bavel.sh/${emojiMeta.emoji}" />`;
      }
      return '<img class="emojify" src="https://emojiapi.bavel.sh/❓" />'
    });
  }

  unemojify(input: string) {
    // also allow github, slack, emojipedia, slug
    return input.replace(/<(.+)>/g, (match, emoji) => {
      const emojiMeta = this.get(emoji);
      if (emojiMeta) {
        return `:${emojiMeta.name}:`;
      }
      return match;
    });
  }

  stats(category?: string) {
    return category ? 
      stats['category'] ? stats['category'] : 'Category not found.'
      : stats
  }
}

export default Emojiify;