import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KnowledgeCard } from './types';

// 第一版数据只存在本机（网页存在浏览器里）。第三步接入云同步后再迁到数据库。
const KEYS = {
  interests: 'zhidouma:interests',
  weights: 'zhidouma:weights',
  saved: 'zhidouma:saved',
  seen: 'zhidouma:seen',
} as const;

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** 用户选的感兴趣领域 */
export const getInterests = () => readJSON<string[]>(KEYS.interests, []);
export const setInterests = (topics: string[]) => writeJSON(KEYS.interests, topics);

/** 每个领域的偏好权重：点"有意思"加分，点"没兴趣"减分 */
export type TopicWeights = Record<string, number>;
export const getWeights = () => readJSON<TopicWeights>(KEYS.weights, {});
export const setWeights = (w: TopicWeights) => writeJSON(KEYS.weights, w);

/** 收藏的卡片，最新的在前 */
export const getSaved = () => readJSON<KnowledgeCard[]>(KEYS.saved, []);
export const setSaved = (cards: KnowledgeCard[]) => writeJSON(KEYS.saved, cards);

/** 看过的标题，用来告诉 AI 别重复 */
const SEEN_LIMIT = 200;
export const getSeen = () => readJSON<string[]>(KEYS.seen, []);
export async function addSeen(hooks: string[]) {
  const seen = await getSeen();
  const next = [...hooks, ...seen.filter((h) => !hooks.includes(h))].slice(0, SEEN_LIMIT);
  await writeJSON(KEYS.seen, next);
}
