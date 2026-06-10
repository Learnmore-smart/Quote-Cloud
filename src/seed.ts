import type { Quote } from './types';

/** Initial dataset of quotes in English. */
export const SEED_QUOTES: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", weight: "hero" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche" },
  { text: "I think, therefore I am.", author: "René Descartes" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" }
];

/** "I Feel Lucky" deck in English. */
export const FAMOUS_QUOTES: Quote[] = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', weight: 'hero' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: 'Imagination is more important than knowledge.', author: 'Albert Einstein' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'That which does not kill us makes us stronger.', author: 'Friedrich Nietzsche' },
  { text: 'I think, therefore I am.', author: 'René Descartes' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.', author: 'Ralph Waldo Emerson' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'You must be the change you wish to see in the world.', author: 'Mahatma Gandhi' }
];

/** Initial dataset of quotes in Chinese. */
export const SEED_QUOTES_ZH: Quote[] = [
  { text: "成就伟业的唯一途径是热爱自己的工作。", author: "史蒂夫·乔布斯", weight: "hero" },
  { text: "求知若饥，虚心若愚。", author: "史蒂夫·乔布斯" },
  { text: "想象力比知识更重要。", author: "阿尔伯特·爱因斯坦" },
  { text: "未经审视的生活不值得过。", author: "苏格拉底" },
  { text: "那些没能毁灭我的，使我更强大。", author: "弗里德里希·尼采" },
  { text: "我思故我在。", author: "勒内·笛卡尔" },
  { text: "困难之中往往蕴含着机遇。", author: "阿尔伯特·爱因斯坦" },
  { text: "极简是终极的复杂。", author: "列奥纳多·达·芬奇" },
  { text: "在这个不断试图改变你的世界里坚持做自己，是最大的成就。", author: "拉尔夫·沃尔多·爱默生" },
  { text: "走得多慢都无所谓，只要你不停下脚步。", author: "孔子" },
  { text: "成功不是终点，失败也非末日：最重要的是继续前行的勇气。", author: "温斯顿·丘吉尔" },
  { text: "未来属于那些相信自己梦想之美的人。", author: "埃莉诺·罗斯福" },
  { text: "不要沿着前人的足迹前进，去开拓一条属于自己的路并留下足迹。", author: "拉尔夫·沃尔多·爱默生" },
  { text: "欲变世界，先变自身。", author: "马哈特马·甘地" },
  { text: "将爱播撒到你所去的每个角落。让来到你身边的每一个人在离开时都更加幸福。", author: "特蕾莎修女" },
  { text: "实现明天的唯一障碍，是对今天的怀疑。", author: "富兰克林·D·罗斯福" }
];

/** "I Feel Lucky" deck in Chinese. */
export const FAMOUS_QUOTES_ZH: Quote[] = [
  { text: "成就伟业的唯一途径是热爱自己的工作。", author: "史蒂夫·乔布斯", weight: "hero" },
  { text: "求知若饥，虚心若愚。", author: "史蒂夫·乔布斯" },
  { text: "想象力比知识更重要。", author: "阿尔伯特·爱因斯坦" },
  { text: "未经审视的生活不值得过。", author: "苏格拉底" },
  { text: "那些没能毁灭我的，使我更强大。", author: "弗里德里希·尼采" },
  { text: "我思故我在。", author: "勒内·笛卡尔" },
  { text: "困难之中往往蕴含着机遇。", author: "阿尔伯特·爱因斯坦" },
  { text: "极简是终极的复杂。", author: "列奥纳多·达·芬奇" },
  { text: "在这个不断试图改变你的世界里坚持做自己，是最大的成就。", author: "拉尔夫·沃尔多·爱默生" },
  { text: "成功不是终点，失败也非末日：最重要的是继续前行的勇气。", author: "温斯顿·丘吉尔" },
  { text: "未来属于那些相信自己梦想之美的人。", author: "埃莉诺·罗斯福" },
  { text: "欲变世界，先变自身。", author: "马哈特马·甘地" }
];
