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

export function getRandomPieces(count: number): Shape[] {
  return Array.from({ length: count }, () => getRandomShape())
}

export function rotateShape(shape: Shape): Shape {
  const n = shape.cells.length
  const m = shape.cells[0].length
  const rotated: number[][] = Array.from({ length: m }, () => Array(n).fill(0))
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < m; c++) {
      rotated[c][n - 1 - r] = shape.cells[r][c]
    }
  }
  return { ...shape, cells: rotated }
}
