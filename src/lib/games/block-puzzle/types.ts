export const BOARD_SIZE = 8

export type CellState = 0 | 1
export type Board = CellState[][]

export interface Position {
  row: number
  col: number
}

export interface Shape {
  id: number
  cells: number[][]
  color: string
}

export interface PlacedBlock {
  shape: Shape
  position: Position
}

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameOver'

export interface GameState {
  board: Board
  currentPieces: Shape[]
  score: number
  highScore: number
  combo: number
  status: GameStatus
  soundOn: boolean
}

export interface DragState {
  isDragging: boolean
  pieceIndex: number
  offset: Position
  previewPos: Position | null
  isValid: boolean
}
