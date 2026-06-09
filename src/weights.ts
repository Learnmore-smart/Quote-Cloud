import { OPENROUTER_API_KEY } from './config';
import type { Quote } from './types';

const SYSTEM_PROMPT =
  '你是一个文本分析专家。请分析以下 JSON 数组中的每一句 quote。根据其‘内容的深刻度、警醒程度和核心价值’，为每个对象新增一个 weight 字段。值为 3（最犀利、直击灵魂的金句）、2（有价值的洞察/建议）或 1（普通的鼓励）。请只返回合法的 JSON 数组，不要包含任何 markdown 标记或其他多余文本。';

/** Deterministic scoring fallback so the page always renders. */
export function localHeuristicWeights(quotes: Quote[]): Quote[] {
  // We aim for a balanced distribution (roughly 30% w3, 40% w2, 30% w1)
  // by ranking raw scores and binning them.
  const scored = quotes.map((q) => {
    const t = q.text;
    let s = 0;
    // Length-based: longer quotes tend to carry more insight
    if (t.length > 40) s += 1;
    if (t.length > 80) s += 1;
    if (t.length > 130) s += 1;
    // Punctuation intensity: ?！. signals "sharp" or "declarative"
    const qmarks = (t.match(/[!?？！]/g) || []).length;
    if (qmarks >= 1) s += 1;
    if (qmarks >= 2) s += 1;
    // Rhetorical dashes
    if (/[——…]/.test(t)) s += 1;
    // "Sharp" keywords: insight / risk / action / truth
    if (/(做|卖|死|输|赢|风险|坚持|在乎|结果|核心|价值|灵魂|规划|努力)/.test(t)) s += 1;
    // Author reputation (lightweight prior)
    if (q.author === '立正课代表') s += 1;
    if (q.author === 'Er Shen' || q.author === 'Thomas Yuen') s += 1;
    return { q, s };
  });

  // Sort by score desc and bin into 1/2/3
  const order = scored.slice().sort((a, b) => b.s - a.s);
  const n = order.length;
  // Top ~30% -> 3, next ~40% -> 2, rest -> 1
  const w3Cut = Math.max(2, Math.round(n * 0.3));
  const w2Cut = Math.max(w3Cut + 1, Math.round(n * 0.7));
  const weightByIndex = new Map<Quote, 1 | 2 | 3>();
  order.forEach((row, i) => {
    let w: 1 | 2 | 3;
    if (i < w3Cut) w = 3;
    else if (i < w2Cut) w = 2;
    else w = 1;
    weightByIndex.set(row.q, w);
  });
  return scored.map(({ q }) => ({ ...q, weight: weightByIndex.get(q)! }));
}

export function extractJsonArray(s: string | null | undefined): unknown[] | null {
  if (!s) return null;
  let str = String(s).trim();
  // strip ```json ... ``` fences
  str = str.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // Find first [ and last ]
  const first = str.indexOf('[');
  const last = str.lastIndexOf(']');
  if (first === -1 || last === -1 || last <= first) return null;
  const candidate = str.slice(first, last + 1);
  try {
    const parsed = JSON.parse(candidate);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export interface WeightResult {
  data: Quote[];
  source: 'ai' | 'local';
}

export async function fetchWeights(quotes: Quote[]): Promise<WeightResult> {
  if (!OPENROUTER_API_KEY) {
    return { data: localHeuristicWeights(quotes), source: 'local' };
  }
  const userPayload = JSON.stringify(
    quotes.map(({ author, text }) => ({ author, text })),
  );
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
        'HTTP-Referer': location.origin || 'http://localhost',
        'X-Title': 'Quote Cloud Poster Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        temperature: 0.4,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPayload },
        ],
      }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? '';
    const arr = extractJsonArray(text);
    if (!Array.isArray(arr) || arr.length !== quotes.length) {
      throw new Error('Bad payload shape');
    }
    // Merge weight back
    const merged: Quote[] = quotes.map((q, i) => {
      const w = Number((arr[i] as { weight?: unknown })?.weight);
      const weight: 1 | 2 | 3 = w === 1 || w === 2 || w === 3 ? w : 2;
      return { ...q, weight };
    });
    return { data: merged, source: 'ai' };
  } catch (err) {
    console.warn('[QuoteCloud] AI weight fetch failed, using local heuristic:', err);
    return { data: localHeuristicWeights(quotes), source: 'local' };
  }
}
