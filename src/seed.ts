import type { Quote } from './types';

/** Initial dataset of quotes. */
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
