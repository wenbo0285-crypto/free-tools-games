export function calcPlaceScore(cellsPlaced: number): number {
  return cellsPlaced * 10
}

export function calcClearScore(linesCleared: number, combo: number): number {
  let base = 0
  if (linesCleared === 1) base = 100
  else if (linesCleared === 2) base = 300
  else if (linesCleared === 3) base = 600
  else if (linesCleared >= 4) base = 1000
  return base * Math.max(1, combo)
}

export function getHighScore(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem('blockPuzzleHighScore')
  return stored ? parseInt(stored, 10) : 0
}

export function saveHighScore(score: number): void {
  if (typeof window === 'undefined') return
  const current = getHighScore()
  if (score > current) {
    localStorage.setItem('blockPuzzleHighScore', score.toString())
  }
}
