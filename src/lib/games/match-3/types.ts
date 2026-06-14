export const BOARD_SIZE = 8
export const FRUIT_COUNT = 6
export const INITIAL_STEPS = 30

export const CAT_NAMES = ['橘貓', '黑貓', '白貓', '虎斑', '灰貓', '三花']
export const CAT_IMAGES = [
  '/assets/match3-cats/cat-orange.svg',
  '/assets/match3-cats/cat-black.svg',
  '/assets/match3-cats/cat-white.svg',
  '/assets/match3-cats/cat-tabby.svg',
  '/assets/match3-cats/cat-gray.svg',
  '/assets/match3-cats/cat-calico.svg',
]

export const SPECIAL_IMAGES: Record<string, string> = {
  lineH: '/assets/match3-cats/special-line-horizontal-cat.svg',
  lineV: '/assets/match3-cats/special-line-vertical-cat.svg',
  bomb: '/assets/match3-cats/special-bomb-cat.svg',
  colorBomb: '/assets/match3-cats/special-color-bomb-cat.svg',
  wrapped: '/assets/match3-cats/special-wrapped-cat.svg',
}

export const BLOCKER_IMAGES: Record<string, string> = {
  ice: '/assets/match3-cats/blocker-ice.svg',
  chain: '/assets/match3-cats/blocker-chain.svg',
  honey: '/assets/match3-cats/blocker-honey.svg',
  stone: '/assets/match3-cats/blocker-stone.svg',
}

export type Board = number[][]
export type Position = { row: number; col: number }
export type SpecialPiece = 'lineH' | 'lineV' | 'bomb' | 'colorBomb' | 'wrapped'
export type BlockerType = 'ice' | 'chain' | 'honey' | 'stone'
export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameOver' | 'animating'

export interface CellData {
  fruit: number
  special: SpecialPiece | null
  blocker: BlockerType | null
  blockerHits: number
}

export interface MatchResult {
  positions: Position[]
  count: number
  shape: 'row' | 'col' | 'L' | 'T' | 'other'
  center?: Position
}

export interface AnimatingCell {
  row: number
  col: number
  fruit: number
  type: 'remove' | 'fall' | 'new' | 'special'
}

export type SpecialsBoard = (SpecialPiece | null)[][]
export type BlockersBoard = (BlockerType | null)[][]

export function createEmptySpecials(): SpecialsBoard {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
}

export function createEmptyBlockers(): BlockersBoard {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
}

export function isSpecialValue(value: number): boolean {
  return value >= 100
}

export function getFruitFromValue(value: number): number {
  return value >= 100 ? value % 10 : value
}

export function getSpecialFromValue(value: number): SpecialPiece | null {
  if (value < 100) return null
  const specialIdx = Math.floor((value - 100) / 10)
  const types: SpecialPiece[] = ['lineH', 'lineV', 'bomb', 'colorBomb', 'wrapped']
  return types[specialIdx] ?? null
}

export function makeSpecialValue(fruit: number, special: SpecialPiece): number {
  const types: SpecialPiece[] = ['lineH', 'lineV', 'bomb', 'colorBomb', 'wrapped']
  const idx = types.indexOf(special)
  return 100 + idx * 10 + fruit
}
