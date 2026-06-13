import type { Board, Shape, Position } from './types'
import { BOARD_SIZE } from './types'

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
}

export function canPlace(board: Board, shape: Shape, pos: Position): boolean {
  const { row, col } = pos
  for (let r = 0; r < shape.cells.length; r++) {
    for (let c = 0; c < shape.cells[r].length; c++) {
      if (!shape.cells[r][c]) continue
      const br = row + r
      const bc = col + c
      if (br >= BOARD_SIZE || bc >= BOARD_SIZE || br < 0 || bc < 0) return false
      if (board[br][bc]) return false
    }
  }
  return true
}

export function placeShape(board: Board, shape: Shape, pos: Position): Board {
  const newBoard = board.map(row => [...row])
  const { row, col } = pos
  for (let r = 0; r < shape.cells.length; r++) {
    for (let c = 0; c < shape.cells[r].length; c++) {
      if (shape.cells[r][c]) {
        newBoard[row + r][col + c] = 1
      }
    }
  }
  return newBoard
}

export function getFullRows(board: Board): number[] {
  const rows: number[] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every(c => c === 1)) rows.push(r)
  }
  return rows
}

export function getFullCols(board: Board): number[] {
  const cols: number[] = []
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!board[r][c]) { full = false; break }
    }
    if (full) cols.push(c)
  }
  return cols
}

export function clearLines(board: Board, rows: number[], cols: number[]): Board {
  const newBoard = board.map(row => [...row])
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) newBoard[r][c] = 0
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) newBoard[r][c] = 0
  }
  return newBoard
}

export function canPlaceAny(board: Board, pieces: Shape[]): boolean {
  for (const piece of pieces) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlace(board, piece, { row: r, col: c })) return true
      }
    }
  }
  return false
}
