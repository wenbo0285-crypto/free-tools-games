import type { Board, Position, MatchResult } from './types'
import { BOARD_SIZE, FRUIT_COUNT } from './types'

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(-1))
}

export function randomFruit(): number {
  return Math.floor(Math.random() * FRUIT_COUNT)
}

export function findMatches(board: Board): MatchResult[] {
  const matched = new Set<string>()
  const results: MatchResult[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    let start = 0
    for (let c = 1; c <= BOARD_SIZE; c++) {
      if (c < BOARD_SIZE && board[r][c] === board[r][start] && board[r][c] >= 0) continue
      const len = c - start
      if (len >= 3 && board[r][start] >= 0) {
        const positions: Position[] = []
        for (let i = start; i < c; i++) {
          const key = `${r},${i}`
          matched.add(key)
          positions.push({ row: r, col: i })
        }
        results.push({ positions, count: len })
      }
      start = c
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let start = 0
    for (let r = 1; r <= BOARD_SIZE; r++) {
      if (r < BOARD_SIZE && board[r][c] === board[start][c] && board[r][c] >= 0) continue
      const len = r - start
      if (len >= 3 && board[start][c] >= 0) {
        const positions: Position[] = []
        for (let i = start; i < r; i++) {
          const key = `${i},${c}`
          if (!matched.has(key)) {
            matched.add(key)
            positions.push({ row: i, col: c })
          } else {
            positions.push({ row: i, col: c })
          }
        }
        results.push({ positions, count: len })
      }
      start = r
    }
  }

  return results
}

export function hasMatches(board: Board): boolean {
  return findMatches(board).length > 0
}

export function removeMatches(board: Board, matches: MatchResult[]): Board {
  const newBoard = board.map(row => [...row])
  const removed = new Set<string>()
  for (const m of matches) {
    for (const p of m.positions) {
      const key = `${p.row},${p.col}`
      if (!removed.has(key)) {
        removed.add(key)
        newBoard[p.row][p.col] = -1
      }
    }
  }
  return newBoard
}

export function applyGravity(board: Board): { board: Board; moves: { from: Position; to: Position }[] } {
  const newBoard = board.map(row => [...row])
  const moves: { from: Position; to: Position }[] = []

  for (let c = 0; c < BOARD_SIZE; c++) {
    let writeRow = BOARD_SIZE - 1
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (newBoard[r][c] >= 0) {
        if (r !== writeRow) {
          newBoard[writeRow][c] = newBoard[r][c]
          newBoard[r][c] = -1
          moves.push({ from: { row: r, col: c }, to: { row: writeRow, col: c } })
        }
        writeRow--
      }
    }
  }

  return { board: newBoard, moves }
}

export function fillEmpty(board: Board): { board: Board; filled: Position[] } {
  const newBoard = board.map(row => [...row])
  const filled: Position[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] < 0) {
        newBoard[r][c] = randomFruit()
        filled.push({ row: r, col: c })
      }
    }
  }

  return { board: newBoard, filled }
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row)
  const dc = Math.abs(a.col - b.col)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

export function swap(board: Board, a: Position, b: Position): Board {
  const newBoard = board.map(row => [...row])
  const temp = newBoard[a.row][a.col]
  newBoard[a.row][a.col] = newBoard[b.row][b.col]
  newBoard[b.row][b.col] = temp
  return newBoard
}

export function findValidSwap(board: Board): { a: Position; b: Position } | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const dirs = [[0, 1], [1, 0]]
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= BOARD_SIZE || nc >= BOARD_SIZE) continue
        const testBoard = swap(board, { row: r, col: c }, { row: nr, col: nc })
        if (hasMatches(testBoard)) {
          return { a: { row: r, col: c }, b: { row: nr, col: nc } }
        }
      }
    }
  }
  return null
}

export function generateBoard(): Board {
  let attempts = 0
  while (attempts < 100) {
    attempts++
    const board = createEmptyBoard()
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = randomFruit()
        if (r >= 2 && board[r][c] === board[r - 1][c] && board[r][c] === board[r - 2][c]) {
          board[r][c] = (board[r][c] + 1) % FRUIT_COUNT
        }
        if (c >= 2 && board[r][c] === board[r][c - 1] && board[r][c] === board[r][c - 2]) {
          board[r][c] = (board[r][c] + 1) % FRUIT_COUNT
        }
      }
    }
    if (!hasMatches(board) && findValidSwap(board)) {
      return board
    }
  }

  const board = createEmptyBoard()
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = randomFruit()
    }
  }
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      let fruit = board[r][c]
      if (r >= 2 && board[r - 1][c] === fruit && board[r - 2][c] === fruit) {
        fruit = (fruit + 1) % FRUIT_COUNT
      }
      if (c >= 2 && board[r][c - 1] === fruit && board[r][c - 2] === fruit) {
        fruit = (fruit + 1) % FRUIT_COUNT
      }
      board[r][c] = fruit
    }
  }
  return board
}
