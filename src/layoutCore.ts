export interface Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// 1. Exact AABB Overlap Check
export function intersect(r1: Rectangle, r2: Rectangle): boolean {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

// 2. Anisotropic Archimedean Spiral Placement
export interface QuoteNode {
  text: string;
  author: string;
  weight: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

/**
 * Place quote boxes around the origin using a collision-free Archimedean
 * spiral. The spiral can be stretched along X/Y via `aspectRatio` so the
 * resulting cluster matches the proportions of the target canvas instead of
 * always forming a centred circle. This is what lets the cloud actually fill
 * a wide (landscape) or tall (portrait) page edge to edge.
 *
 * @param aspectRatio  availableWidth / availableHeight of the target canvas.
 *                     1 (default) keeps the spiral perfectly circular.
 */
export function calculateLayout(
  quotes: QuoteNode[],
  padding: number = 12,
  aspectRatio: number = 1,
): QuoteNode[] {
  const placed: { box: Rectangle; node: QuoteNode }[] = [];

  // Stretch the spiral so its bounding box trends toward the canvas aspect.
  // sqrt keeps the overall growth balanced (area-preserving stretch).
  const safeAspect = aspectRatio > 0 && Number.isFinite(aspectRatio)
    ? aspectRatio
    : 1;
  const aspectX = Math.sqrt(safeAspect);
  const aspectY = Math.sqrt(1 / safeAspect);

  // Sort by weight descending so largest quotes occupy the center first
  const sorted = [...quotes].sort((a, b) => b.weight - a.weight);

  for (const node of sorted) {
    let theta = 0;
    let r = 0;
    let found = false;
    const step = 0.05;          // Tiny theta step for high-precision placement
    const spiralFactor = 1.2;   // Distance between spiral arms

    // Try to place the node along the (stretched) spiral
    while (!found && r < 5000) {
      const x = Math.cos(theta) * r * aspectX;
      const y = Math.sin(theta) * r * aspectY;

      // Define the bounding box for the current position, centered on (x,y)
      const currentBox: Rectangle = {
        left: x - node.width / 2 - padding,
        right: x + node.width / 2 + padding,
        top: y - node.height / 2 - padding,
        bottom: y + node.height / 2 + padding,
      };

      // Check collision against all already placed nodes
      let collision = false;
      for (const p of placed) {
        if (intersect(currentBox, p.box)) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        node.x = x;
        node.y = y;
        placed.push({ box: currentBox, node });
        found = true;
      }

      theta += step;
      r = spiralFactor * theta;
    }
  }
  return sorted;
}
