import { OPENROUTER_API_KEY } from './config';
import type { Quote } from './types';

const SYSTEM_PROMPT = [
  'You are a concise text analysis engine.',
  'For each input quote object, add one integer field named weight.',
  'Use weight 3 for the sharpest, most central, poster-worthy quotes.',
  'Use weight 2 for useful supporting insights.',
  'Use weight 1 for lighter encouragement or context.',
  'Return only a valid JSON array in the same order as the input.',
].join(' ');

export function localHeuristicWeights(quotes: Quote[]): Quote[] {
  const scored = quotes.map((quote) => {
    const text = quote.text;
    let score = 0;

    if (text.length > 40) score += 1;
    if (text.length > 80) score += 1;
    if (text.length > 130) score += 1;
    if (/[!?？！]/.test(text)) score += 1;
    if (/[“”"'‘’]/.test(text)) score += 1;
    if (/(风险|失败|结果|用户|分发|卖|在乎|坚持|品质|规划|努力|真正)/.test(text)) {
      score += 2;
    }
    if (quote.author === '立正课代表') {
      score += 1;
    }

    return { quote, score };
  });
  const ordered = [...scored].sort((a, b) => b.score - a.score);
  const w3Cut = Math.max(2, Math.round(ordered.length * 0.3));
  const w2Cut = Math.max(w3Cut + 1, Math.round(ordered.length * 0.7));
  const weightByQuote = new Map<Quote, 1 | 2 | 3>();

  ordered.forEach(({ quote }, index) => {
    if (index < w3Cut) {
      weightByQuote.set(quote, 3);
    } else if (index < w2Cut) {
      weightByQuote.set(quote, 2);
    } else {
      weightByQuote.set(quote, 1);
    }
  });

  return scored.map(({ quote }) => ({
    ...quote,
    weight: weightByQuote.get(quote) ?? 2,
  }));
}

export function extractJsonArray(s: string | null | undefined): unknown[] | null {
  if (!s) {
    return null;
  }

  let str = String(s).trim();
  str = str.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const first = str.indexOf('[');
  const last = str.lastIndexOf(']');

  if (first === -1 || last === -1 || last <= first) {
    return null;
  }

  try {
    const parsed = JSON.parse(str.slice(first, last + 1));
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
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': globalThis.location?.origin ?? 'http://localhost',
        'X-Title': 'Printable Quote Cloud Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPayload },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    const arr = extractJsonArray(typeof content === 'string' ? content : '');

    if (!arr || arr.length !== quotes.length) {
      throw new Error('OpenRouter returned an invalid weight payload.');
    }

    return {
      data: quotes.map((quote, index) => {
        const weight = Number((arr[index] as { weight?: unknown })?.weight);
        const safeWeight: 1 | 2 | 3 = weight === 1 || weight === 2 || weight === 3
          ? weight
          : 2;
        return { ...quote, weight: safeWeight };
      }),
      source: 'ai',
    };
  } catch (err) {
    console.warn('[QuoteCloud] AI weight fetch failed; using local weights.', err);
    return { data: localHeuristicWeights(quotes), source: 'local' };
  }
}
