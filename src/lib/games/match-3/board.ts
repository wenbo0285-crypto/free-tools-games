import type { Board, Position, MatchResult, SpecialPiece, SpecialsBoard } from './types'
import { BOARD_SIZE, FRUIT_COUNT, getFruitFromValue, makeSpecialValue, getSpecialFromValue } from './types'

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(-1))
}

export function randomFruit(): number {
  return Math.floor(Math.random() * FRUIT_COUNT)
}

function getNormalized(v: number): number {
  return v < 0 ? -1 : getFruitFromValue(v)
}

export function findMatches(board: Board, _specials?: SpecialsBoard): MatchResult[] {
  const matched = new Set<string>()
  const results: MatchResult[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    let start = 0
    for (let c = 1; c <= BOARD_SIZE; c++) {
      const curr = c < BOARD_SIZE ? getNormalized(board[r][c]) : -2
      const first = getNormalized(board[r][start])
      if (c < BOARD_SIZE && curr === first && first >= 0) continue
      const len = c - start
      if (len >= 3 && first >= 0) {
        const positions: Position[] = []
        for (let i = start; i < c; i++) {
          const key = `${r},${i}`
          matched.add(key)
          positions.push({ row: r, col: i })
        }
        const center = { row: r, col: Math.floor((start + c - 1) / 2) }
        results.push({ positions, count: len, shape: 'row', center })
      }
      start = c
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let start = 0
    for (let r = 1; r <= BOARD_SIZE; r++) {
      const curr = r < BOARD_SIZE ? getNormalized(board[r][c]) : -2
      const first = getNormalized(board[start][c])
      if (r < BOARD_SIZE && curr === first && first >= 0) continue
      const len = r - start
      if (len >= 3 && first >= 0) {
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
        if (positions.length > 0) {
          const center = { row: Math.floor((start + r - 1) / 2), col: c }
          results.push({ positions, count: len, shape: 'col', center })
        }
      }
      start = r
    }
  }

  return results
}

export function hasMatches(board: Board, _specials?: SpecialsBoard): boolean {
  return findMatches(board, _specials).length > 0
}

export function detectLTShape(board: Board, matches: MatchResult[], _specials?: SpecialsBoard): MatchResult[] {
  const extra: MatchResult[] = []
  const posToMatch = new Map<string, MatchResult>()

  for (const m of matches) {
    for (const p of m.positions) {
      posToMatch.set(`${p.row},${p.col}`, m)
    }
  }

  const cellMatchCount = new Map<string, number>()
  for (const m of matches) {
    for (const p of m.positions) {
      const key = `${p.row},${p.col}`
      cellMatchCount.set(key, (cellMatchCount.get(key) || 0) + 1)
    }
  }

  for (const [key, count] of cellMatchCount) {
    if (count >= 2) {
      const [r, c] = key.split(',').map(Number)
      const center = { row: r, col: c }
      const totalPositions: Position[] = []
      const seen = new Set<string>()
      for (const m of matches) {
        for (const p of m.positions) {
          const pk = `${p.row},${p.col}`
          if (!seen.has(pk)) {
            seen.add(pk)
            totalPositions.push(p)
          }
        }
      }
      if (totalPositions.length >= 4) {
        extra.push({ positions: totalPositions, count: totalPositions.length, shape: 'L', center })
      }
    }
  }

  return extra
}

export function getSpecialFromMatch(match: MatchResult): SpecialPiece | null {
  if (match.count >= 5) return 'colorBomb'
  if (match.count >= 4) return match.shape === 'row' ? 'lineH' : 'lineV'
  if (match.shape === 'L' || match.shape === 'T') return 'bomb'
  return null
}

export function getCellsAffectedBySpecial(board: Board, pos: Position, special: SpecialPiece): Position[] {
  const affected: Position[] = []
  switch (special) {
    case 'lineH':
      for (let c = 0; c < BOARD_SIZE; c++) affected.push({ row: pos.row, col: c })
      break
    case 'lineV':
      for (let r = 0; r < BOARD_SIZE; r++) affected.push({ row: r, col: pos.col })
      break
    case 'bomb':
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = pos.row + dr
          const nc = pos.col + dc
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            affected.push({ row: nr, col: nc })
          }
        }
      }
      break
    case 'colorBomb': {
      const targetFruit = getNormalized(board[pos.row][pos.col])
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (r === pos.row && c === pos.col) continue
          if (getNormalized(board[r][c]) === targetFruit) {
            affected.push({ row: r, col: c })
          }
        }
      }
      break
    }
    case 'wrapped':
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = pos.row + dr
          const nc = pos.col + dc
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !(dr === 0 && dc === 0)) {
            affected.push({ row: nr, col: nc })
          }
        }
      }
      break
  }
  return affected
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

export function applyGravity(board: Board, specials?: SpecialsBoard):
  { board: Board; specials: SpecialsBoard; moves: { from: Position; to: Position }[] } {
  const newBoard = board.map(row => [...row])
  const newSpecials: SpecialsBoard = specials ? specials.map(row => [...row]) : createEmptySpecials()
  const moves: { from: Position; to: Position }[] = []

  for (let c = 0; c < BOARD_SIZE; c++) {
    let writeRow = BOARD_SIZE - 1
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (newBoard[r][c] >= 0) {
        if (r !== writeRow) {
          newBoard[writeRow][c] = newBoard[r][c]
          newBoard[r][c] = -1
          newSpecials[writeRow][c] = newSpecials[r][c]
          newSpecials[r][c] = null
          moves.push({ from: { row: r, col: c }, to: { row: writeRow, col: c } })
        }
        writeRow--
      }
    }
  }

  return { board: newBoard, specials: newSpecials, moves }
}

export function fillEmpty(board: Board, specials?: SpecialsBoard):
  { board: Board; specials: SpecialsBoard; filled: Position[] } {
  const newBoard = board.map(row => [...row])
  const newSpecials: SpecialsBoard = specials ? specials.map(row => [...row]) : createEmptySpecials()
  const filled: Position[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] < 0) {
        newBoard[r][c] = randomFruit()
        newSpecials[r][c] = null
        filled.push({ row: r, col: c })
      }
    }
  }

  return { board: newBoard, specials: newSpecials, filled }
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

export function findValidSwap(board: Board, specials?: SpecialsBoard): { a: Position; b: Position } | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (specials?.[r]?.[c]) continue
      const dirs = [[0, 1], [1, 0]]
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= BOARD_SIZE || nc >= BOARD_SIZE) continue
        if (specials?.[nr]?.[nc]) continue
        const testBoard = swap(board, { row: r, col: c }, { row: nr, col: nc })
        if (hasMatches(testBoard, specials)) {
          return { a: { row: r, col: c }, b: { row: nr, col: nc } }
        }
      }
    }
  }
  return null
}

function createEmptySpecials(): SpecialsBoard {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
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

export function createSpecialAt(board: Board, specials: SpecialsBoard, pos: Position, special: SpecialPiece, fruit: number): { board: Board; specials: SpecialsBoard } {
  const newBoard = board.map(row => [...row])
  const newSpecials = specials.map(row => [...row])
  newBoard[pos.row][pos.col] = makeSpecialValue(fruit, special)
  newSpecials[pos.row][pos.col] = special
  return { board: newBoard, specials: newSpecials }
}

export function collectSpecialActivations(
  board: Board,
  specials: SpecialsBoard,
  matchedPositions: Position[],
): Position[] {
  const visited = new Set<string>()
  const allAffected: Position[] = []
  const queue: Position[] = []

  for (const p of matchedPositions) {
    const key = `${p.row},${p.col}`
    if (!visited.has(key)) {
      visited.add(key)
      queue.push(p)
    }
  }

  while (queue.length > 0) {
    const pos = queue.shift()!
    const sp = specials[pos.row]?.[pos.col] ?? getSpecialFromValue(board[pos.row]?.[pos.col] ?? -1)
    if (sp) {
      const affected = getCellsAffectedBySpecial(board, pos, sp)
      for (const a of affected) {
        const key = `${a.row},${a.col}`
        if (!visited.has(key)) {
          visited.add(key)
          allAffected.push(a)
          const aSp = specials[a.row]?.[a.col] ?? getSpecialFromValue(board[a.row]?.[a.col] ?? -1)
          if (aSp) queue.push(a)
        }
      }
    }
  }

  return allAffected
}

export function getCombinedSpecialEffect(
  board: Board,
  specials: SpecialsBoard,
  a: Position,
  b: Position,
  specA: SpecialPiece,
  specB: SpecialPiece,
): Position[] {
  const affected: Position[] = []
  const addPos = (r: number, c: number) => { if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) affected.push({ row: r, col: c }) }

  if (specA === 'colorBomb' && specB === 'colorBomb') {
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        addPos(r, c)
    return affected
  }

  if (specA === 'colorBomb' || specB === 'colorBomb') {
    const colorPiece = specA === 'colorBomb' ? b : a
    const color = getFruitFromValue(board[colorPiece.row][colorPiece.col])
    const otherSpecial = specA === 'colorBomb' ? specB : specA
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (getFruitFromValue(board[r][c]) === color) {
          addPos(r, c)
          if (otherSpecial === 'bomb') {
            for (let dr = -1; dr <= 1; dr++)
              for (let dc = -1; dc <= 1; dc++)
                addPos(r + dr, c + dc)
          } else if (otherSpecial === 'lineH') {
            for (let cc = 0; cc < BOARD_SIZE; cc++) addPos(r, cc)
          } else if (otherSpecial === 'lineV') {
            for (let rr = 0; rr < BOARD_SIZE; rr++) addPos(rr, c)
          } else if (otherSpecial === 'wrapped') {
            for (let dr = -2; dr <= 2; dr++)
              for (let dc = -2; dc <= 2; dc++)
                addPos(r + dr, c + dc)
          }
        }
      }
    }
    return affected
  }

  if ((specA === 'bomb' && specB === 'bomb')) {
    const centers = [a, b]
    for (const c of centers) {
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          addPos(c.row + dr, c.col + dc)
    }
    return affected
  }

  if ((specA === 'bomb' && (specB === 'lineH' || specB === 'lineV')) ||
      (specB === 'bomb' && (specA === 'lineH' || specA === 'lineV'))) {
    const bombPos = specA === 'bomb' ? a : b
    const linePos = specA === 'bomb' ? b : a
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        addPos(bombPos.row + dr, bombPos.col + dc)
    for (let c = 0; c < BOARD_SIZE; c++) addPos(linePos.row, c)
    for (let r = 0; r < BOARD_SIZE; r++) addPos(r, linePos.col)
    return affected
  }

  if ((specA === 'bomb' && specB === 'wrapped') || (specA === 'wrapped' && specB === 'bomb')) {
    const centers = [a, b]
    for (const c of centers) {
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          addPos(c.row + dr, c.col + dc)
    }
    return affected
  }

  if (specA === 'wrapped' && specB === 'wrapped') {
    const centers = [a, b]
    for (const c of centers) {
      for (let dr = -3; dr <= 3; dr++)
        for (let dc = -3; dc <= 3; dc++)
          addPos(c.row + dr, c.col + dc)
    }
    return affected
  }

  if ((specA === 'wrapped' && (specB === 'lineH' || specB === 'lineV')) ||
      (specB === 'wrapped' && (specA === 'lineH' || specA === 'lineV'))) {
    const wrapPos = specA === 'wrapped' ? a : b
    const linePos = specA === 'wrapped' ? b : a
    for (let dr = -2; dr <= 2; dr++)
      for (let dc = -2; dc <= 2; dc++)
        addPos(wrapPos.row + dr, wrapPos.col + dc)
    for (let c = 0; c < BOARD_SIZE; c++) addPos(linePos.row, c)
    for (let r = 0; r < BOARD_SIZE; r++) addPos(r, linePos.col)
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        addPos(linePos.row + dr, linePos.col + dc)
    return affected
  }

  if ((specA === 'lineH' && specB === 'lineV') || (specA === 'lineV' && specB === 'lineH')) {
    for (let c = 0; c < BOARD_SIZE; c++) addPos(a.row, c)
    for (let r = 0; r < BOARD_SIZE; r++) addPos(r, a.col)
    for (let c = 0; c < BOARD_SIZE; c++) addPos(b.row, c)
    for (let r = 0; r < BOARD_SIZE; r++) addPos(r, b.col)
    return affected
  }

  if (specA === 'lineH' && specB === 'lineH') {
    for (let c = 0; c < BOARD_SIZE; c++) { addPos(a.row, c); addPos(b.row, c) }
    return affected
  }
  if (specA === 'lineV' && specB === 'lineV') {
    for (let r = 0; r < BOARD_SIZE; r++) { addPos(r, a.col); addPos(r, b.col) }
    return affected
  }

  return affected
}
