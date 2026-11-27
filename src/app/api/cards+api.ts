import { SAMPLE_CARDS } from '@/lib/sample-cards';
import type { CardsRequest, CardsResponse, KnowledgeCard } from '@/lib/types';

// 这个文件只在服务端运行，DEEPSEEK_API_KEY 不会发到浏览器或手机上。
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-flash';

const SYSTEM_PROMPT = `你是"知豆"App 的内容编辑，专门写让人忍不住想往下滑的冷知识卡片。
要求：
- hook：一句话标题，20 字以内，用提问或反常识的说法勾起好奇心。
- body：3 到 5 句，口语化、具体，有数字或例子，像朋友聊天一样讲清楚原因。总长不超过 150 字。
- 内容必须准确。有争议或只是流行说法的，要在 body 里点明。
- related：2 个可以继续深挖的相关话题，每个 12 字以内。
- emoji：1 个贴合内容的 emoji。
- topic：必须是用户给出的领域之一。
只输出 JSON，格式：{"cards":[{"topic":"","emoji":"","hook":"","body":"","related":["",""]}]}`;

function clampStrings(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sampleResponse(): CardsResponse {
  const cards = [...SAMPLE_CARDS]
    .sort(() => Math.random() - 0.5)
    .map((c) => ({ ...c, id: crypto.randomUUID() }));
  return { cards, demo: true };
}

function toCard(raw: unknown, allowedTopics: string[]): KnowledgeCard | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const hook = typeof r.hook === 'string' ? r.hook.trim() : '';
  const body = typeof r.body === 'string' ? r.body.trim() : '';
  if (!hook || !body) return null;
  const topic =
    typeof r.topic === 'string' && allowedTopics.includes(r.topic) ? r.topic : allowedTopics[0];
  return {
    id: crypto.randomUUID(),
    topic,
    emoji: typeof r.emoji === 'string' && r.emoji ? r.emoji.slice(0, 4) : '💡',
    hook: hook.slice(0, 60),
    body: body.slice(0, 400),
    related: clampStrings(r.related, 3, 20),
  };
}

export async function POST(request: Request) {
  let input: CardsRequest;
  try {
    input = (await request.json()) as CardsRequest;
  } catch {
    return Response.json({ cards: [], error: '请求格式不对' } satisfies CardsResponse, {
      status: 400,
    });
  }

  const topics = clampStrings(input.topics, 10, 20);
  if (topics.length === 0) topics.push('生活常识');
  const focus = typeof input.focus === 'string' ? input.focus.trim().slice(0, 30) : '';
  const exclude = clampStrings(input.exclude, 40, 60);
  const count = Math.min(Math.max(Number(input.count) || 5, 1), 8);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return Response.json(sampleResponse());

  const userPrompt = [
    focus
      ? `围绕话题「${focus}」写 ${count} 张卡片，从不同角度切入。可选领域：${topics.join('、')}。`
      : `写 ${count} 张卡片，尽量分散在这些领域：${topics.join('、')}。`,
    exclude.length ? `不要和这些标题重复：${exclude.join('；')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        // 关闭思考模式：生成更快，也能用 temperature 增加多样性
        thinking: { type: 'disabled' },
        temperature: 1.2,
        stream: false,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[api/cards] DeepSeek error', res.status, detail.slice(0, 300));
      return Response.json(
        { cards: [], error: `AI 服务返回错误（${res.status}）` } satisfies CardsResponse,
        { status: 502 },
      );
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(content) as { cards?: unknown[] };
    const cards = (parsed.cards ?? [])
      .map((c) => toCard(c, topics))
      .filter((c): c is KnowledgeCard => c !== null);

    return Response.json({ cards } satisfies CardsResponse);
  } catch (err) {
    console.error('[api/cards] failed', err);
    return Response.json({ cards: [], error: 'AI 生成失败，请稍后再试' } satisfies CardsResponse, {
      status: 502,
    });
  }
}
