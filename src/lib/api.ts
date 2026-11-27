import type { CardsRequest, CardsResponse } from './types';

/** 调用自己的服务端接口（src/app/api/cards+api.ts），由它再去请求 DeepSeek */
export async function fetchCards(req: CardsRequest): Promise<CardsResponse> {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = (await res.json()) as CardsResponse;
  if (!res.ok) throw new Error(data.error ?? `请求失败（${res.status}）`);
  return data;
}

/** 按偏好权重从感兴趣的领域里抽几个，让每批内容既贴合口味又有变化 */
export function pickTopics(interests: string[], weights: Record<string, number>, n = 3) {
  const pool = interests.map((t) => ({ t, w: Math.max(0.2, 1 + (weights[t] ?? 0)) }));
  const picked: string[] = [];
  while (picked.length < n && pool.length > 0) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    const i = pool.findIndex((p) => (r -= p.w) <= 0);
    picked.push(pool.splice(i === -1 ? pool.length - 1 : i, 1)[0].t);
  }
  return picked;
}
