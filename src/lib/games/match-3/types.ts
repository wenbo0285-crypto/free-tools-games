export const BOARD_SIZE = 8
export const FRUIT_COUNT = 6
export const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝']
export const INITIAL_STEPS = 30

export type Board = number[][]
export type Position = { row: number; col: number }

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameOver' | 'animating'

export interface MatchResult {
  positions: Position[]
  count: number
}

export interface AnimatingCell {
  row: number
  col: number
  fruit: number
  type: 'remove' | 'fall' | 'new'
}
