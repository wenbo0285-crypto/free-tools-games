import type { Shape } from './types'

const COLORS = [
  '#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED',
  '#0891B2', '#DB2777', '#65A30D', '#C026D3', '#EA580C',
  '#2563EB', '#16A34A', '#F59E0B', '#EC4899', '#14B8A6',
]

export const SHAPE_NAMES: string[] = [
  '單格', '兩格直線', '三格直線', '四格直線', '五格直線',
  '2x2 方塊', '3x3 方塊', 'L 型', '反 L 型', 'T 型',
  'Z 型', '斜角', '十字型', '小 L 型', '2x3 矩形',
]

const SHAPE_DEFS: number[][][] = [
  [[1]],
  [[1, 1]],
  [[1, 1, 1]],
  [[1, 1, 1, 1]],
  [[1, 1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  [[1, 0], [1, 1]],
  [[1, 1], [1, 1], [1, 1]],
]

const LARGE_INDICES = new Set([4, 6, 14])

const WEIGHTS = [8, 6, 5, 3, 1, 4, 1, 4, 4, 3, 3, 3, 2, 5, 1]

function weightedIndex(): number {
  const total = WEIGHTS.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < WEIGHTS.length; i++) {
    r -= WEIGHTS[i]
    if (r <= 0) return i
  }
  return WEIGHTS.length - 1
}

export function getAllShapes(): Shape[] {
  return SHAPE_DEFS.map((cells, i) => ({
    id: i,
    cells,
    color: COLORS[i % COLORS.length],
  }))
}

export function getRandomShape(): Shape {
  const all = getAllShapes()
  return { ...all[Math.floor(Math.random() * all.length)] }
}

export function getWeightedRandomPieces(count: number): Shape[] {
  const all = getAllShapes()
  const pieces: Shape[] = []
  const usedLarge = new Set<number>()
  for (let i = 0; i < count; i++) {
    let idx: number
    let attempts = 0
    do {
      idx = weightedIndex()
      attempts++
    } while (
      LARGE_INDICES.has(idx) && usedLarge.size >= 1 && attempts < 20
    )
    if (LARGE_INDICES.has(idx)) usedLarge.add(idx)
    pieces.push({ ...all[idx] })
  }
  return pieces
}
