import { useEffect, useState } from 'react';
import type { Quote } from '../types';
import { OPENROUTER_API_KEY } from '../config';
import { CustomSelect } from './CustomSelect';

interface QuoteManagerProps {
  open: boolean;
  quotes: Quote[];
  onClose: () => void;
  onAdd: (quote: Quote) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, quote: Quote) => void;
  onClearAll: () => void;
  onFeelLucky: () => void;
  onLoadPreset: (quotes: Quote[]) => void;
  t: any;
  currentLang: 'en' | 'zh';
}

type WeightChoice = NonNullable<Quote['weight']>;


interface SuggestionItem {
  id: string;
  text: string;
  author: string;
  weight: WeightChoice;
  added: boolean;
  checked: boolean;
}

// Preset Decks Data
const PRESET_DECKS = {
  en: {
    philosophical: [
      { text: "The unexamined life is not worth living.", author: "Socrates", weight: "hero" },
      { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", weight: "bold" },
      { text: "I think, therefore I am.", author: "René Descartes", weight: "bold" },
      { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", weight: "auto" },
      { text: "We suffer more often in imagination than in reality.", author: "Seneca", weight: "light" },
      { text: "Happiness is not an ideal of reason, but of imagination.", author: "Immanuel Kant", weight: "auto" },
      { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", weight: "auto" },
      { text: "Compassion is the basis of morality.", author: "Arthur Schopenhauer", weight: "bold" },
      { text: "Freedom is what we do with what is done to us.", author: "Jean-Paul Sartre", weight: "auto" },
      { text: "The heart has its reasons which reason knows nothing of.", author: "Blaise Pascal", weight: "light" },
      { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle", weight: "bold" }
    ] as Quote[],
    tech: [
      { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", weight: "hero" },
      { text: "Good design is as little design as possible.", author: "Dieter Rams", weight: "bold" },
      { text: "The best way to predict the future is to invent it.", author: "Alan Kay", weight: "bold" },
      { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", weight: "auto" },
      { text: "Make it simple, but significant.", author: "Don Draper", weight: "light" },
      { text: "Move fast and break things.", author: "Mark Zuckerberg", weight: "auto" },
      { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs", weight: "bold" },
      { text: "Design is the silent ambassador of your brand.", author: "Paul Rand", weight: "light" },
      { text: "Software is eating the world.", author: "Marc Andreessen", weight: "bold" },
      { text: "The most damaging phrase in the language is, 'It's always been done this way.'", author: "Grace Hopper", weight: "auto" },
      { text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry", weight: "hero" }
    ] as Quote[],
    minimalist: [
      { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu", weight: "hero" },
      { text: "Be here now.", author: "Ram Dass", weight: "bold" },
      { text: "This too shall pass.", author: "Persian Proverb", weight: "auto" },
      { text: "Simplicity, patience, compassion. These three are your greatest treasures.", author: "Lao Tzu", weight: "bold" },
      { text: "The present moment is filled with joy. If you are attentive, you will see it.", author: "Thich Nhat Hanh", weight: "light" },
      { text: "Do not seek to follow in the footsteps of the wise. Seek what they sought.", author: "Basho", weight: "auto" },
      { text: "Simplify, simplify.", author: "Henry David Thoreau", weight: "bold" },
      { text: "In the beginner's mind there are many possibilities, but in the expert's mind there are few.", author: "Shunryu Suzuki", weight: "auto" },
      { text: "Minimalism is the intentional promotion of the things we most value.", author: "Joshua Becker", weight: "bold" },
      { text: "Realize deeply that the present moment is all you have.", author: "Eckhart Tolle", weight: "light" },
      { text: "Very little is needed to make a happy life; it is all within yourself.", author: "Marcus Aurelius", weight: "auto" }
    ] as Quote[],
    chinese: [
      { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu", weight: "hero" },
      { text: "Knowing others is intelligence; knowing yourself is true wisdom.", author: "Lao Tzu", weight: "bold" },
      { text: "By three methods we may learn wisdom: First, by reflection, which is noblest; second, by imitation, which is easiest; and third by experience, which is the bitterest.", author: "Confucius", weight: "auto" },
      { text: "To know that you do not know is the best.", author: "Lao Tzu", weight: "bold" },
      { text: "Life is a dream. Live it.", author: "Zhuangzi", weight: "light" },
      { text: "He who conquers himself is the mightiest warrior.", author: "Lao Tzu", weight: "auto" },
      { text: "If you want to see a thousand miles further, ascend another story.", author: "Wang Zhihuan", weight: "bold" },
      { text: "May we all be blessed with longevity, and share the beauty of the moon together.", author: "Su Shi", weight: "hero" },
      { text: "Plucking chrysanthemums under the eastern hedge, I gaze leisurely upon the southern mountains.", author: "Tao Yuanming", weight: "light" },
      { text: "An old warhorse in the stable still aspires to run a thousand miles.", author: "Cao Cao", weight: "auto" },
      { text: "The way ahead is long and has no ending; yet I will seek high and low for my ideal.", author: "Qu Yuan", weight: "bold" }
    ] as Quote[]
  },
  zh: {
    philosophical: [
      { text: "未经审视的生活不值得过。", author: "苏格拉底", weight: "hero" },
      { text: "知晓生命意义的人，能承受任何生活方式。", author: "弗里德里希·尼采", weight: "bold" },
      { text: "我思故我在。", author: "勒内·笛卡尔", weight: "bold" },
      { text: "你控制的是你的心灵，而不是外界事件。明了这一点，你将获得力量。", author: "马可·奥勒留", weight: "auto" },
      { text: "我们在想象中受的苦，远多于在现实中。", author: "塞涅卡", weight: "light" },
      { text: "幸福不是理性的理想，而是想象力的理想。", author: "伊曼努尔·康德", weight: "auto" },
      { text: "困难之中往往蕴含着机遇。", author: "阿尔伯特·爱因斯坦", weight: "auto" },
      { text: "同情心是道德的真正基础。", author: "亚瑟·叔本华", weight: "bold" },
      { text: "自由是我们在面对已定境遇时做出的选择。", author: "让-保罗·萨特", weight: "auto" },
      { text: "心灵有其理性无法知晓的道理。", author: "布莱兹·帕斯卡", weight: "light" },
      { text: "认识自己是一切智慧的开端。", author: "亚里士多德", weight: "bold" }
    ] as Quote[],
    tech: [
      { text: "极简是终极的复杂。", author: "列奥纳多·达·芬奇", weight: "hero" },
      { text: "好的设计是尽可能少的设计。", author: "迪特·拉姆斯", weight: "bold" },
      { text: "预测未来的最好方法是去创造它。", author: "艾伦·凯", weight: "bold" },
      { text: "光说不练假把式，把代码秀出来。", author: "林纳斯·托瓦兹", weight: "auto" },
      { text: "简单却不凡。", author: "唐·德雷柏", weight: "light" },
      { text: "天下武功，唯快不破。", author: "网络格言", weight: "auto" },
      { text: "设计不仅是外表和感觉，设计是它如何工作。", author: "史蒂夫·乔布斯", weight: "bold" },
      { text: "设计是品牌无声的代言人。", author: "保罗·兰德", weight: "light" },
      { text: "软件正在吞噬世界。", author: "马克·安德森", weight: "bold" },
      { text: "语言中最具毁灭性的话是：‘我们一直都是这么做的。’", author: "葛丽丝·霍普", weight: "auto" },
      { text: "达到完美，并非在无以复加之时，而是在无以复减之日。", author: "安托万·德·圣-埃克苏佩里", weight: "hero" }
    ] as Quote[],
    minimalist: [
      { text: "大器晚成，大音希声。", author: "老子", weight: "hero" },
      { text: "活在当下。", author: "拉姆·达斯", weight: "bold" },
      { text: "这一切终将过去。", author: "波斯谚语", weight: "auto" },
      { text: "我有三宝，持而保之：一曰慈，二曰俭，三曰不敢为天下先。", author: "老子", weight: "bold" },
      { text: "当下充满喜悦。如果你足够专注，你就能看见它。", author: "一行禅师", weight: "light" },
      { text: "不求步贤良之后尘，唯求贤良之所求。", author: "松尾芭蕉", weight: "auto" },
      { text: "简朴，简朴，再简朴。", author: "亨利·戴维·梭罗", weight: "bold" },
      { text: "初学者的心充满无限可能，老手的心却饱受束缚。", author: "铃木俊隆", weight: "auto" },
      { text: "极简主义是刻意推广我们最珍视的事物。", author: "约书亚·贝克尔", weight: "bold" },
      { text: "深刻地认识到，当下是你所拥有的全部。", author: "埃克哈特·托利", weight: "light" },
      { text: "幸福生活所需甚少，一切皆在你自己心中。", author: "马可·奥勒留", weight: "auto" }
    ] as Quote[],
    chinese: [
      { text: "千里之行，始于足下。", author: "老子", weight: "hero" },
      { text: "己所不欲，勿施于人。", author: "孔子", weight: "bold" },
      { text: "天行健，君子以自强不息。", author: "《易经》", weight: "bold" },
      { text: "大直若屈，大巧若拙，大辩若讷。", author: "老子", weight: "auto" },
      { text: "天地有大美而不言，四时有明法而不议。", author: "庄子", weight: "light" },
      { text: "乘风破浪会有时，直挂云帆济沧海。", author: "李白", weight: "auto" },
      { text: "欲穷千里目，更上一层楼。", author: "王之涣", weight: "bold" },
      { text: "但愿人长久，千里共婵娟。", author: "苏轼", weight: "hero" },
      { text: "采菊东篱下，悠然见南山。", author: "陶渊明", weight: "light" },
      { text: "老骥伏枥，志在千里。烈士暮年，壮心不已。", author: "曹操", weight: "auto" },
      { text: "路漫漫其修远兮，吾将上下而求索。", author: "屈原", weight: "bold" }
    ] as Quote[]
  }
};

/* =============================================================================
 * Helper: call OpenRouter Chat Completion API (using Gemma-4-31B-it:free and fallbacks)
 * ============================================================================= */
async function fetchFromOpenRouter(messages: { role: string; content: string }[]) {
  const apiKey = OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('API Key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.');
  }

  const models = [
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openrouter/free'
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://github.com',
          'X-Title': 'Quote Cloud Layout Studio',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter Error (${response.status}) [Model: ${model}]: ${errorText}`);
      }

      const result = await response.json();
      return result.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next fallback... Error:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All models failed to respond.');
}


/* =============================================================================
 * Helper: parse JSON array from AI output with fallbacks
 * ============================================================================= */
function parseJsonArray(text: string): { text: string; author: string }[] {
  let cleanText = text.trim();
  
  if (cleanText.includes('```')) {
    const matches = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (matches && matches[1]) {
      cleanText = matches[1].trim();
    }
  }
  
  const startIdx = cleanText.indexOf('[');
  const endIdx = cleanText.lastIndexOf(']');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleanText = cleanText.substring(startIdx, endIdx + 1);
  }
  
  try {
    const parsed = JSON.parse(cleanText);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        text: typeof item.text === 'string' ? item.text : String(item || ''),
        author: typeof item.author === 'string' ? item.author : 'Unknown',
      }));
    }
  } catch (e) {
    console.error('Failed to parse quote JSON:', e, 'Raw text:', text);
  }
  
  const quotes: { text: string; author: string }[] = [];
  const regex = /\{\s*"text"\s*:\s*"([^"]+)"\s*,\s*"author"\s*:\s*"([^"]+)"\s*\}/g;
  let match;
  while ((match = regex.exec(cleanText)) !== null) {
    quotes.push({ text: match[1], author: match[2] });
  }
  
  if (quotes.length > 0) return quotes;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const fallbackQuotes = lines.map(line => {
    const parts = line.split(/[-——]/);
    if (parts.length > 1) {
      const quoteText = parts.slice(0, -1).join('-').replace(/^["'“「]|["'”占]$/g, '').trim();
      const authorText = parts[parts.length - 1].replace(/^["'“「]|["'”占]$/g, '').trim();
      return { text: quoteText, author: authorText };
    }
    return { text: line.replace(/^["'“「]|["'”占]$/g, ''), author: 'Unknown' };
  });

  return fallbackQuotes;
}

/* =============================================================================
 * <QuoteManager> — sleek drawer supporting presets, manual adding & AI
 * ============================================================================= */
export function QuoteManager({
  open,
  quotes,
  onClose,
  onAdd,
  onDelete,
  onUpdate,
  onClearAll,
  onFeelLucky,
  onLoadPreset,
  t,
  currentLang,
}: QuoteManagerProps) {
  // Tabs & Modes
  const [tab, setTab] = useState<'manual' | 'import' | 'ai'>('manual');
  const [aiMode, setAiMode] = useState<'generate' | 'extract'>('generate');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Manual form state
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [weight, setWeight] = useState<WeightChoice>('auto');

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLang, setAiLang] = useState<'auto' | 'zh' | 'en'>('auto');
  const [aiCount, setAiCount] = useState<number>(10);
  const [aiStyle, setAiStyle] = useState<string>('minimalist');
  const [genLoading, setGenLoading] = useState(false);

  // AI Extractor state
  const [extractText, setExtractText] = useState('');
  const [extractLoading, setExtractLoading] = useState(false);

  // Batch Import state
  const [importText, setImportText] = useState('');

  // AI Polish state
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishedText, setPolishedText] = useState('');
  const [showPolishResult, setShowPolishResult] = useState(false);
  const [polishStyle, setPolishStyle] = useState<string>('philosophical');

  // AI Suggestions
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editWeight, setEditWeight] = useState<WeightChoice>('auto');

  // Close drawer on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Load Presets Helper
  const loadPreset = (presetKey: 'philosophical' | 'tech' | 'minimalist' | 'chinese') => {
    const list = PRESET_DECKS[currentLang][presetKey];
    onLoadPreset(list);
  };

  // Handle manual submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd({
      text: trimmed,
      author: author.trim() || (currentLang === 'zh' ? '无名氏' : 'Unknown'),
      weight,
    });
    setText('');
    setAuthor('');
    setWeight('auto');
    setShowPolishResult(false);
  };

  // AI Generate logic
  const handleAiGenerate = async () => {
    setGenLoading(true);
    try {
      const activeLang = aiLang === 'auto'
        ? (currentLang === 'zh' ? 'Chinese' : 'English')
        : (aiLang === 'zh' ? 'Chinese' : 'English');

      const systemMessage = `You are a professional quote curator. Generate inspiring, layout-friendly, and deep quotes matching the requested theme and style.
Requirements:
1. Output MUST be a valid JSON array of objects. No markdown wrapper (like \`\`\`json), no trailing text, just raw JSON.
2. Structure: [{"text": "Quote here", "author": "Author name"}]
3. Make quotes concise (under 80 characters), impactful, and layout-friendly.
4. DO NOT attribute quotes to "Anonymous", "Unknown", or "无名氏". Try to attribute each quote to a famous historical or contemporary figure (thinker, philosopher, scientist, writer, technologist, artist, etc.) whose ideas or styles align with the quote. If it is a traditional proverb or cultural saying, attribute it to its specific origin (e.g., "African Proverb", "Zen Saying", "Chinese Proverb", "Greek Proverb").
5. The language MUST be ${activeLang}.
6. Vibe/style: ${aiStyle}.`;

      const userMessage = `Generate ${aiCount} quotes about "${aiPrompt || 'life and philosophy'}".`;

      const rawResult = await fetchFromOpenRouter([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]);

      const parsedQuotes = parseJsonArray(rawResult);
      const items: SuggestionItem[] = parsedQuotes.map((q, idx) => ({
        id: `gen-${idx}-${Date.now()}`,
        text: q.text,
        author: q.author,
        weight: 'auto',
        added: false,
        checked: true,
      }));
      setSuggestions(items);
    } catch (err) {
      console.error('AI Generation error:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate quotes');
    } finally {
      setGenLoading(false);
    }
  };

  // AI Extract logic
  const handleAiExtract = async () => {
    if (!extractText.trim()) return;
    setExtractLoading(true);
    try {
      const systemMessage = `You are an expert quote extractor. Scan the text provided by the user and extract the most punchy, meaningful, and layout-friendly quotes/sentences.
Requirements:
1. Output MUST be a valid JSON array of objects. No markdown wrapper, no trailing text, just raw JSON.
2. Structure: [{"text": "Quote here", "author": "Author name"}]
3. Infer the author from the context. If the author is unknown or not mentioned, try to specify a descriptive origin or source (e.g., "Internet Saying", "Traditional Proverb", "Book Excerpt") rather than defaulting to generic "Anonymous" or "Unknown".
4. Keep the quotes concise and powerful.
5. The extracted quotes should be in their original language.`;

      const userMessage = `Extract quotes from the following text:\n\n${extractText}`;

      const rawResult = await fetchFromOpenRouter([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]);

      const parsedQuotes = parseJsonArray(rawResult);
      const items: SuggestionItem[] = parsedQuotes.map((q, idx) => ({
        id: `ext-${idx}-${Date.now()}`,
        text: q.text,
        author: q.author,
        weight: 'auto',
        added: false,
        checked: true,
      }));
      setSuggestions(items);
    } catch (err) {
      console.error('AI Extraction error:', err);
      alert(err instanceof Error ? err.message : 'Failed to extract quotes');
    } finally {
      setExtractLoading(false);
    }
  };

  // Local list parser
  const parseLocalList = (rawText: string) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const items: SuggestionItem[] = lines.map((line, idx) => {
      const parts = line.split(/[-——~～]/);
      let quoteText = line;
      let authorText = currentLang === 'zh' ? '无名氏' : 'Unknown';
      
      if (parts.length > 1) {
        authorText = parts[parts.length - 1].trim();
        quoteText = parts.slice(0, -1).join('-').trim();
      }
      
      // Clean quotes
      quoteText = quoteText.replace(/^["'“「]|["'”占]$/g, '').trim();
      authorText = authorText.replace(/^["'“「]|["'”占]$/g, '').trim();

      return {
        id: `import-${idx}-${Date.now()}`,
        text: quoteText,
        author: authorText || (currentLang === 'zh' ? '无名氏' : 'Unknown'),
        weight: 'auto',
        added: false,
        checked: true,
      };
    });
    setSuggestions(items);
  };

  // Clipboard list import helper
  const handleImportClipboard = async () => {
    try {
      const textFromClipboard = await navigator.clipboard.readText();
      if (!textFromClipboard.trim()) {
        alert(t.quoteManager.clipboardEmpty || 'Clipboard is empty');
        return;
      }
      setImportText(textFromClipboard);
      parseLocalList(textFromClipboard);
    } catch (err) {
      console.error('Clipboard access denied or failed:', err);
      alert(t.quoteManager.clipboardDenied || 'Failed to read clipboard. Please make sure clipboard permissions are granted.');
    }
  };

  // AI Polish logic
  const handleAiPolish = async () => {
    if (!text.trim()) return;
    setPolishLoading(true);
    try {
      const langPrompt = text.match(/[\u4e00-\u9fa5]/) ? 'Chinese' : 'English';
      const systemMessage = `You are a master copywriter. Polish the user's quote to make it more elegant, poetic, and layout-friendly, keeping its original core meaning.
Requirements:
1. Output ONLY the polished quote text itself.
2. Do NOT add quotation marks, explanations, or any other formatting.
3. The language MUST be ${langPrompt}.
4. Style/vibe: ${polishStyle}.`;

      const userMessage = `Polish this quote: "${text}"`;

      const rawResult = await fetchFromOpenRouter([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]);

      const cleanedResult = rawResult.replace(/^["'“「]|["'”占]$/g, '').trim();
      setPolishedText(cleanedResult);
      setShowPolishResult(true);
    } catch (err) {
      console.error('AI Polish error:', err);
      alert(err instanceof Error ? err.message : 'Failed to polish quote');
    } finally {
      setPolishLoading(false);
    }
  };

  // Add individual suggestion card
  const handleAddSuggestion = (index: number) => {
    const item = suggestions[index];
    if (item.added) return;

    onAdd({
      text: item.text.trim(),
      author: item.author.trim() || 'Unknown',
      weight: item.weight,
    });

    setSuggestions(prev =>
      prev.map((s, i) => (i === index ? { ...s, added: true, checked: false } : s))
    );
  };

  // Batch actions
  const handleAddSelected = () => {
    suggestions.forEach(s => {
      if (s.checked && !s.added) {
        onAdd({
          text: s.text.trim(),
          author: s.author.trim() || 'Unknown',
          weight: s.weight,
        });
      }
    });
    setSuggestions(prev =>
      prev.map(s => (s.checked ? { ...s, added: true, checked: false } : s))
    );
  };

  const handleAddAll = () => {
    suggestions.forEach(s => {
      if (!s.added) {
        onAdd({
          text: s.text.trim(),
          author: s.author.trim() || 'Unknown',
          weight: s.weight,
        });
      }
    });
    setSuggestions(prev => prev.map(s => ({ ...s, added: true, checked: false })));
  };

  // Toggle checks
  const handleToggleChecked = (index: number) => {
    setSuggestions(prev =>
      prev.map((s, i) => (i === index ? { ...s, checked: !s.checked } : s))
    );
  };

  // Inline inputs edit
  const handleUpdateSuggestion = (index: number, fields: Partial<SuggestionItem>) => {
    setSuggestions(prev =>
      prev.map((s, i) => (i === index ? { ...s, ...fields } : s))
    );
  };

  const weightOptions = [
    { value: 'auto' as const, label: t.quoteManager.weightOptions.auto },
    { value: 'hero' as const, label: t.quoteManager.weightOptions.hero },
    { value: 'bold' as const, label: t.quoteManager.weightOptions.bold },
    { value: 'light' as const, label: t.quoteManager.weightOptions.light },
  ];

  const aiStyleOptions = [
    { value: 'minimalist', label: t.quoteManager.aiStyles.minimalist },
    { value: 'poetic', label: t.quoteManager.aiStyles.poetic },
    { value: 'tech', label: t.quoteManager.aiStyles.tech },
    { value: 'philosophical', label: t.quoteManager.aiStyles.philosophical },
    { value: 'humorous', label: t.quoteManager.aiStyles.humorous },
  ];

  return (
    <div
      className={[
        'fixed inset-0 z-[60] print:hidden [font-family:Inter,ui-sans-serif,system-ui,sans-serif]',
        open ? '' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={[
          'absolute inset-0 transition-opacity duration-300 theme-modal-backdrop',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.quoteManager.title}
        className={[
          'absolute right-0 top-0 flex h-full w-full max-w-lg flex-col',
          'border-l transition-transform duration-300 ease-out theme-drawer-window',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5 theme-modal-border-light">
          <div className="leading-tight">
            <h2 className="m-0 text-base font-extrabold flex items-center gap-1.5 theme-modal-text-title">
              {t.quoteManager.title}
              {OPENROUTER_API_KEY && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold border"
                  style={{
                    backgroundColor: 'rgba(var(--accent-color-rgb), 0.1)',
                    borderColor: 'rgba(var(--accent-color-rgb), 0.2)',
                    color: 'var(--accent-color)'
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }} />
                  {t.quoteManager.aiStatusActive}
                </span>
              )}
            </h2>
            <p className="m-0 text-[11px] font-semibold mt-0.5 theme-modal-text-muted">
              {quotes.length === 1
                ? t.quoteManager.subtitleSingular.replace('{count}', String(quotes.length))
                : t.quoteManager.subtitlePlural.replace('{count}', String(quotes.length))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl transition cursor-pointer theme-modal-close-btn"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="border-b px-4 py-2 theme-modal-border-light">
          <div className={`slider-switcher-3 ${tab === 'import' ? 'active-middle' : tab === 'ai' ? 'active-right' : ''}`}>
            <div className="slider-indicator" />
            <button
              type="button"
              onClick={() => {
                setTab('manual');
                setSuggestions([]);
              }}
              className={`slider-btn ${tab === 'manual' ? 'active' : ''}`}
            >
              {t.quoteManager.tabManual}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('import');
                setSuggestions([]);
              }}
              className={`slider-btn ${tab === 'import' ? 'active' : ''}`}
            >
              {t.quoteManager.tabImport}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('ai');
                setSuggestions([]);
              }}
              className={`slider-btn ${tab === 'ai' ? 'active' : ''}`}
            >
              {t.quoteManager.tabAI}
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 theme-modal-scrollbar">
          {tab === 'manual' && (
            <>
              {/* Preset Decks / Curated Library */}
              <div className="mb-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] theme-modal-text-section">
                  {t.quoteManager.presetLabel}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loadPreset('philosophical')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition theme-modal-reset-btn"
                  >
                    📜 {t.quoteManager.presets.philosophical}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('tech')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition theme-modal-reset-btn"
                  >
                    💻 {t.quoteManager.presets.tech}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('minimalist')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition theme-modal-reset-btn"
                  >
                    🍃 {t.quoteManager.presets.minimalist}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('chinese')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition theme-modal-reset-btn"
                  >
                    🏯 {t.quoteManager.presets.chinese}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onFeelLucky}
                  className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-neutral-900 shadow transition hover:bg-amber-300 active:scale-[0.98]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l2.09 4.26L19 8l-3.5 3.4.83 4.85L12 14l-4.33 2.25L8.5 11.4 5 8l4.91-.74z" />
                  </svg>
                  ✨ {t.quoteManager.feelLucky}
                </button>
              </div>

              {/* Add form */}
              <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 border-t pt-5 theme-modal-border-light">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] theme-modal-text-section">
                  {t.quoteManager.addQuoteLabel}
                </span>
                
                {/* Textarea with AI Polish button */}
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.quoteManager.quotePlaceholder}
                    rows={2}
                    className="w-full resize-none rounded-xl border pl-3.5 pr-12 py-2.5 text-sm shadow-inner outline-none transition placeholder:text-neutral-500 theme-modal-select"
                  />
                  {text.trim() && OPENROUTER_API_KEY && (
                    <button
                      type="button"
                      onClick={handleAiPolish}
                      disabled={polishLoading}
                      title={t.quoteManager.aiPolishTooltip}
                      className="absolute right-3 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed qm-ai-polish-btn"
                    >
                      {polishLoading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {/* AI Polish results */}
                {showPolishResult && (
                  <div className="rounded-xl border p-4 mb-2 animate-fadeIn flex flex-col gap-2 qm-polish-result-box">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 qm-accent-text">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        </svg>
                        {t.quoteManager.aiPolishTitle}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setText(polishedText);
                            setShowPolishResult(false);
                          }}
                          className="rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow transition cursor-pointer qm-accent-btn"
                        >
                          {t.quoteManager.btnApply}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPolishResult(false)}
                          className="rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer qm-secondary-btn"
                        >
                          {t.quoteManager.btnCancel}
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-[10px] italic theme-modal-text-muted">
                      {t.quoteManager.aiPolishOriginal} : "{text}"
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <textarea
                        value={polishedText}
                        onChange={(e) => setPolishedText(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg border px-2 py-1.5 text-xs shadow-inner outline-none qm-polish-textarea"
                      />
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[10px] theme-modal-text-muted">{t.quoteManager.aiPolishSelectStyle}</span>
                        <CustomSelect
                          options={[
                            { value: 'philosophical', label: currentLang === 'zh' ? '哲学思辨' : 'Philosophical' },
                            { value: 'minimalist', label: currentLang === 'zh' ? '极简现代' : 'Minimalist' },
                            { value: 'poetic', label: currentLang === 'zh' ? '深邃诗意' : 'Poetic' },
                            { value: 'tech', label: currentLang === 'zh' ? '硬核科技' : 'Tech' },
                          ]}
                          value={polishStyle}
                          onChange={setPolishStyle}
                          triggerClassName="py-1 px-2 text-[10px] rounded-lg"
                          align="right"
                          className="w-32"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={t.quoteManager.authorPlaceholder}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-inner outline-none transition placeholder:text-neutral-500 theme-modal-select"
                  />
                  <CustomSelect
                    options={weightOptions}
                    value={weight}
                    onChange={(val) => setWeight(val as WeightChoice)}
                    triggerClassName="py-2.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-100 py-2.5 text-sm font-bold text-neutral-900 shadow-md transition hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  {t.quoteManager.addQuoteBtn}
                </button>
              </form>
            </>
          )}

          {/* Batch Import Tab */}
          {tab === 'import' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] theme-modal-text-section">
                  {t.quoteManager.importLabel}
                </span>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={t.quoteManager.importPlaceholder}
                  rows={6}
                  className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm shadow-inner outline-none transition placeholder:text-neutral-500 theme-modal-select"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => parseLocalList(importText)}
                  disabled={!importText.trim()}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold text-white shadow transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 qm-accent-btn"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  {t.quoteManager.btnParseList}
                </button>

                <button
                  type="button"
                  onClick={handleImportClipboard}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold text-white shadow transition active:scale-[0.98] qm-accent-btn"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {t.quoteManager.btnImportClipboard}
                </button>
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {tab === 'ai' && (
            <div className="flex flex-col gap-4">
              {/* Missing API Key Warning */}
              {!OPENROUTER_API_KEY && (
                <div className="rounded-xl border p-4 shadow-sm qm-warning-box">
                  <h3 className="m-0 text-xs font-bold flex items-center gap-1.5 qm-warning-title">
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t.quoteManager.missingApiKeyTitle}
                  </h3>
                  <p className="mt-1.5 mb-0 text-[10px] leading-relaxed font-medium qm-warning-desc">
                    {t.quoteManager.missingApiKeyDesc}
                  </p>
                </div>
              )}

              {/* Mode switch */}
              <div className={`slider-switcher ${aiMode === 'extract' ? 'active-right' : ''}`}>
                <div className="slider-indicator" />
                <button
                  type="button"
                  onClick={() => setAiMode('generate')}
                  className={`slider-btn ${aiMode === 'generate' ? 'active' : ''}`}
                >
                  {t.quoteManager.aiModeGenerate}
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode('extract')}
                  className={`slider-btn ${aiMode === 'extract' ? 'active' : ''}`}
                >
                  {t.quoteManager.aiModeExtract}
                </button>
              </div>

              {aiMode === 'generate' ? (
                /* Generator Form */
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] theme-modal-text-section">
                      {t.quoteManager.aiPromptLabel}
                    </span>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={t.quoteManager.aiPromptPlaceholder}
                      rows={2}
                      disabled={!OPENROUTER_API_KEY}
                      className="w-full resize-none rounded-xl border px-3.5 py-2 text-sm shadow-inner outline-none transition placeholder:text-neutral-500 theme-modal-select disabled:opacity-30 disabled:bg-neutral-900"
                    />
                  </div>

                  {/* Recommendation tags */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold theme-modal-text-section">{t.quoteManager.aiTagsLabel}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.quoteManager.aiTags.map((tItem: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!OPENROUTER_API_KEY}
                          onClick={() => setAiPrompt(tItem.prompt)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition cursor-pointer ${
                            aiPrompt === tItem.prompt
                              ? 'qm-tag-active shadow'
                              : 'theme-modal-reset-btn'
                          } disabled:opacity-30`}
                        >
                          {tItem.tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold theme-modal-text-section">{t.quoteManager.aiStyleLabel}</span>
                      <CustomSelect
                        options={aiStyleOptions}
                        value={aiStyle}
                        onChange={setAiStyle}
                        disabled={!OPENROUTER_API_KEY}
                        triggerClassName="py-1.5 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold theme-modal-text-section">{t.quoteManager.aiLanguageLabel}</span>
                      <CustomSelect
                        options={[
                          { value: 'auto', label: t.quoteManager.aiLanguageAuto },
                          { value: 'zh', label: t.quoteManager.aiLanguageZh },
                          { value: 'en', label: t.quoteManager.aiLanguageEn },
                        ]}
                        value={aiLang}
                        onChange={(val) => setAiLang(val as any)}
                        disabled={!OPENROUTER_API_KEY}
                        triggerClassName="py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold theme-modal-text-section">{t.quoteManager.aiCountLabel}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!OPENROUTER_API_KEY || aiCount <= 1}
                        onClick={() => setAiCount(Math.max(1, aiCount - 1))}
                        className="h-7 w-7 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center theme-modal-reset-btn disabled:opacity-30"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={aiCount || ''}
                        disabled={!OPENROUTER_API_KEY}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setAiCount(isNaN(val) ? 10 : val);
                        }}
                        className="h-7 w-12 rounded-lg text-center text-xs font-bold border outline-none theme-modal-select"
                      />
                      <button
                        type="button"
                        disabled={!OPENROUTER_API_KEY || aiCount >= 50}
                        onClick={() => setAiCount(Math.min(50, aiCount + 1))}
                        className="h-7 w-7 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center theme-modal-reset-btn disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={genLoading || !OPENROUTER_API_KEY}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 qm-accent-btn"
                  >
                    {genLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t.quoteManager.btnGenerateLoading}
                      </>
                    ) : (
                      <>
                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        </svg>
                        {t.quoteManager.btnGenerate}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Extractor Form */
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] theme-modal-text-section">
                      {t.quoteManager.aiExtractLabel}
                    </span>
                    <textarea
                      value={extractText}
                      onChange={(e) => setExtractText(e.target.value)}
                      placeholder={t.quoteManager.aiExtractPlaceholder}
                      rows={5}
                      disabled={!OPENROUTER_API_KEY}
                      className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm shadow-inner outline-none transition placeholder:text-neutral-500 theme-modal-select disabled:opacity-30 disabled:bg-neutral-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAiExtract()}
                    disabled={extractLoading || !extractText.trim() || !OPENROUTER_API_KEY}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 qm-accent-btn"
                  >
                    {extractLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t.quoteManager.btnExtractLoading}
                      </>
                    ) : (
                      <>
                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        {t.quoteManager.btnExtract}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Suggestions results List */}
          {suggestions.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 animate-fadeIn border-t pt-4 theme-modal-border-light">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] theme-modal-text-section">
                  {tab === 'import'
                    ? t.quoteManager.importTitle
                    : aiMode === 'generate'
                    ? t.quoteManager.aiGeneratedTitle
                    : t.quoteManager.aiExtractedTitle}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddSelected}
                    disabled={suggestions.every(s => s.added || !s.checked)}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed"
                    style={{
                      color: 'var(--accent-color)',
                      backgroundColor: 'rgba(var(--accent-color-rgb), 0.1)',
                      borderColor: 'rgba(var(--accent-color-rgb), 0.2)'
                    }}
                  >
                    {t.quoteManager.btnAddToDeck}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAll}
                    disabled={suggestions.every(s => s.added)}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all duration-200 cursor-pointer theme-modal-reset-btn disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t.quoteManager.btnAddAllToDeck}
                  </button>
                </div>
              </div>

              <ul className="flex flex-col gap-3">
                {suggestions.map((s, index) => (
                  <li
                    key={s.id}
                    className={`group relative flex flex-col gap-2.5 rounded-2xl border p-4 shadow transition-all duration-300 quote-manager-card ${
                      s.added
                        ? 'opacity-40'
                        : s.checked
                        ? 'checked'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={s.checked}
                        disabled={s.added}
                        onChange={() => handleToggleChecked(index)}
                        className="mt-1 h-4 w-4 cursor-pointer disabled:opacity-30 theme-modal-checkbox"
                      />
                      
                      {/* Inline editable quote text */}
                      <textarea
                        value={s.text}
                        disabled={s.added}
                        onChange={(e) => handleUpdateSuggestion(index, { text: e.target.value })}
                        rows={2}
                        className="flex-1 resize-none bg-transparent text-sm font-medium leading-relaxed outline-none border border-transparent rounded p-1.5 disabled:bg-transparent qm-inline-edit"
                      />
                    </div>

                    {/* Metadata row */}
                    <div className="flex items-center justify-between pl-7 mt-0.5">
                      {/* Inline editable author */}
                      <input
                        type="text"
                        value={s.author}
                        disabled={s.added}
                        onChange={(e) => handleUpdateSuggestion(index, { author: e.target.value })}
                        className="w-1/3 bg-transparent text-xs font-bold outline-none border border-transparent rounded px-1.5 py-0.5 disabled:bg-transparent qm-inline-edit theme-modal-text-muted"
                      />

                      {/* Controls: Weight choices & Add */}
                      <div className="flex items-center gap-2">
                        <CustomSelect
                          options={weightOptions}
                          value={s.weight}
                          disabled={s.added}
                          onChange={(val) => handleUpdateSuggestion(index, { weight: val as WeightChoice })}
                          triggerClassName="py-1 px-2 text-[10px] rounded-lg border-white/10"
                          align="right"
                          className="w-32"
                        />

                        <button
                          type="button"
                          disabled={s.added}
                          onClick={() => handleAddSuggestion(index)}
                          style={s.added ? {
                            backgroundColor: 'rgba(var(--accent-color-rgb), 0.1)',
                            borderColor: 'rgba(var(--accent-color-rgb), 0.15)',
                            color: 'var(--accent-color)'
                          } : {
                            backgroundColor: 'var(--accent-color)',
                            color: 'var(--theme-paper-bg)',
                            borderColor: 'var(--accent-color)'
                          }}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-sm border transition-all duration-200 cursor-pointer active:scale-90 hover:brightness-110`}
                        >
                          {s.added ? (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          <hr className="my-6 theme-modal-border-light" />

          {/* Quote list */}
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] theme-modal-text-section">
              {t.quoteManager.currentDeckLabel}
            </span>
            {quotes.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="rounded-lg px-2.5 py-1 text-[11px] font-bold border transition duration-200 cursor-pointer text-red-500 border-red-500/20 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/30 active:scale-95 disabled:opacity-30"
              >
                {t.quoteManager.btnClearAll}
              </button>
            )}
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {quotes.length === 0 && (
              <li className="rounded-2xl border border-dashed px-3.5 py-8 text-center text-sm theme-modal-border-light theme-modal-text-muted">
                {t.quoteManager.emptyState}
              </li>
            )}
            {quotes.map((q, index) => {
              const isEditing = editingIndex === index;

              if (isEditing) {
                return (
                  <li
                    key={`edit-${index}`}
                    className="group flex flex-col gap-3 rounded-2xl border p-4 shadow animate-fadeIn quote-manager-card editing"
                  >
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-xl border px-3 py-2 text-xs shadow-inner outline-none transition theme-modal-select focus:border-purple-500/40"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full rounded-xl border px-3 py-1.5 text-xs shadow-inner outline-none transition theme-modal-select focus:border-purple-500/40"
                      />
                      <CustomSelect
                        options={weightOptions}
                        value={editWeight}
                        onChange={(val) => setEditWeight(val as WeightChoice)}
                        triggerClassName="py-1.5 text-xs focus:border-purple-500/40"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (editText.trim()) {
                            onUpdate(index, {
                              text: editText.trim(),
                              author: editAuthor.trim() || (currentLang === 'zh' ? '无名氏' : 'Unknown'),
                              weight: editWeight,
                            });
                          }
                          setEditingIndex(null);
                        }}
                        style={{ backgroundColor: 'var(--accent-color)' }}
                        className="flex h-8 px-3 items-center justify-center rounded-lg text-white text-xs font-bold transition cursor-pointer active:scale-[0.98] hover:brightness-110"
                      >
                        {t.quoteManager.btnSave}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="flex h-8 px-3 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-bold transition cursor-pointer active:scale-[0.98]"
                      >
                        {t.quoteManager.btnCancel}
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={`${q.author}-${index}`}
                  className="group flex items-start gap-3 rounded-2xl border p-4 shadow transition quote-manager-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 line-clamp-3 text-sm font-medium leading-relaxed">{q.text}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="truncate text-xs font-bold">
                        {q.author}
                      </span>
                      <span className={`weight-badge ${q.weight ?? 'auto'}`}>
                        {t.quoteManager.weightOptions[q.weight ?? 'auto']}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIndex(index);
                        setEditText(q.text);
                        setEditAuthor(q.author);
                        setEditWeight(q.weight ?? 'auto');
                      }}
                      aria-label="Edit quote"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
                    >
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(index)}
                      aria-label="Delete quote"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-950/60 hover:text-red-400 cursor-pointer"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6l-.84 12.06A2 2 0 0 1 16.16 20H7.84a2 2 0 0 1-2-1.94L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Clear All Confirmation Modal */}
      {showConfirmClear && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fadeIn">
          <div className="flex w-full max-w-[340px] flex-col overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-2xl theme-modal-window">
            <h3 className="text-sm font-bold theme-modal-text-title">
              {t.quoteManager.clearAllConfirmTitle}
            </h3>
            <p className="text-[11px] mt-1.5 leading-relaxed theme-modal-text-muted">
              {t.quoteManager.clearAllConfirmDesc}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer qm-secondary-btn"
              >
                {t.quoteManager.clearAllCancelBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow transition cursor-pointer bg-red-500 hover:bg-red-600 hover:scale-[1.01] active:scale-[0.98]"
              >
                {t.quoteManager.clearAllConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
