import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateLayout, intersect, type QuoteNode, type Rectangle } from '../src/layoutCore.js';

function paddedBox(node: QuoteNode, padding = 12): Rectangle {
  assert.equal(typeof node.x, 'number');
  assert.equal(typeof node.y, 'number');
  const x = node.x as number;
  const y = node.y as number;

  return {
    left: x - node.width / 2 - padding,
    right: x + node.width / 2 + padding,
    top: y - node.height / 2 - padding,
    bottom: y + node.height / 2 + padding,
  };
}

test('intersect treats touching AABB edges as overlap', () => {
  const first: Rectangle = { left: 0, right: 10, top: 0, bottom: 10 };
  const touching: Rectangle = { left: 10, right: 20, top: 0, bottom: 10 };
  const separated: Rectangle = { left: 10.001, right: 20, top: 0, bottom: 10 };

  assert.equal(intersect(first, touching), true);
  assert.equal(intersect(first, separated), false);
});

test('calculateLayout sorts by descending weight and places the largest at the origin', () => {
  const quotes: QuoteNode[] = [
    { text: 'small', author: 'a', weight: 1, width: 40, height: 18 },
    { text: 'large', author: 'b', weight: 3, width: 90, height: 36 },
    { text: 'medium', author: 'c', weight: 2, width: 60, height: 24 },
  ];

  const placed = calculateLayout(quotes);

  assert.deepEqual(placed.map((node) => node.weight), [3, 2, 1]);
  assert.equal(placed[0].text, 'large');
  assert.equal(placed[0].x, 0);
  assert.equal(placed[0].y, 0);
});

test('calculateLayout does not overlap padded quote boxes', () => {
  const quotes: QuoteNode[] = Array.from({ length: 10 }, (_, index) => ({
    text: `quote-${index}`,
    author: 'author',
    weight: index % 3 === 0 ? 3 : index % 3 === 1 ? 2 : 1,
    width: 110 - index * 4,
    height: 38 + (index % 2) * 12,
  }));

  const placed = calculateLayout(quotes, 12);
  const boxes = placed.map((node) => paddedBox(node, 12));

  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      assert.equal(intersect(boxes[i], boxes[j]), false, `boxes ${i} and ${j} overlap`);
    }
  }
});
