/** 一张知识卡片 */
export type KnowledgeCard = {
  id: string;
  /** 所属领域，对应 TOPICS 里的 name */
  topic: string;
  emoji: string;
  /** 标题钩子：一个问题或反常识的说法 */
  hook: string;
  /** 3-5 句通俗解释 */
  body: string;
  /** 可以"顺藤摸瓜"继续看的相关话题 */
  related: string[];
};

/** POST /api/cards 的请求体 */
export type CardsRequest = {
  /** 本批要覆盖的领域 */
  topics: string[];
  /** 指定一个具体话题深挖（点击"相关话题"时使用） */
  focus?: string;
  /** 已经看过的标题，避免重复 */
  exclude?: string[];
  count?: number;
};

export type CardsResponse = {
  cards: KnowledgeCard[];
  /** true 表示没配置 AI，返回的是内置示例卡片 */
  demo?: boolean;
  error?: string;
};
