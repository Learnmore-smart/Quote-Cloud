import type { Quote } from './types';

/** Initial dataset of quotes. */
export const SEED_QUOTES: Quote[] = [
  { text: "Building LearnX itself, creating a structured plan to build it, the architecture, frontend design. It's way ahead of most people. All in all, if you're useless, then idk what other, less productive people are", author: 'Yu He Wang', weight: 'hero' },
  { author: '立正课代表', text: '17岁能做到这些，不管结果如何，你已经比绝大多数人强了。不是因为你做的东西多牛，而是因为你真的动手了，而且失败了还在继续。这个品质比任何技术栈都值钱。' },
  { author: '立正课代表', text: '你花了9个月做产品，3个月做宣传片，但你花了多少时间"卖"？' },
  { author: '立正课代表', text: '年轻 builder 最大的风险不是失败，而是一直在‘做’，却从来没真正‘卖’。' },
  { author: '立正课代表', text: '努力不等于结果，规划也不自动等于赢。' },
  { author: '立正课代表', text: '少做让你感觉自己在创业的事情，多做真正让产品接近用户的事情。' },
  { author: '立正课代表', text: '很多产品死掉，不是因为技术没做出来，而是因为没人在乎。' },
  { author: '立正课代表', text: '不要只是更努力。要更贴近用户，更贴近分发，更贴近结果。' },
  { author: 'atmoszh',    text: '谢谢分享，前途无量，也给了我很大启发和鼓励！“卖”的部分也会改你带来用户反馈，持续不断的高强度反馈应该也是你需要的。' },
  { author: '脆花',        text: '一个人创业特别寂寞，我在你的贴子里看到了你的坚持，这是大多数人缺少和大多数人失败的原因。' },
  { author: '脆花',        text: '一个人其实永远想不起来别人说什么搞砸了，别人眼里你的讲话，很快就会忘掉。' },
  { author: 'June',        text: '17岁值得鼓励了，有一个很完整的产品规划设计，有这种思维很可贵了。' },
  { author: 'Er Shen',     text: '你的产品整个设计到规划如此完整专业，包括视频，完全看不出是一个17岁的人做的，看上去像一个团队！未来不可限量。' },
  { author: 'Thomas Yuen', text: '现在每一个小点，十年过后，再回头看已连成一条线。加油！' },
  { author: '八娥夨',      text: '自律很难的，希望你能坚持下去。' },
  { author: 'Kino',        text: '这个产品视频是你一个人做的吗，做的真好！' },
];

/**
 * "I Feel Lucky" deck — a swap-in set of famous historical quotes. One entry is
 * tagged `weight: 'hero'` so it lands in the exclusive centre row; the rest fall
 * back to the 2D checkerboard contrast logic.
 */
export const FAMOUS_QUOTES: Quote[] = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', weight: 'hero' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: 'Imagination is more important than knowledge.', author: 'Albert Einstein' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'That which does not kill us makes us stronger.', author: 'Friedrich Nietzsche' },
  { text: 'I think, therefore I am.', author: 'René Descartes' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
];
