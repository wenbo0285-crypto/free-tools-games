export function calcMatchScore(count: number, combo: number, hasSpecial: boolean = false): number {
  let base = count === 3 ? 30 : count === 4 ? 60 : count === 5 ? 100 : 30 * (count - 2)
  if (hasSpecial) base *= 1.5
  return Math.round(base * (1 + combo * 0.5))
}

export function getHighScore(): number {
  if (typeof window === 'undefined') return 0
  try {
    const val = localStorage.getItem('match3_highscore')
    return val ? parseInt(val, 10) || 0 : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score: number) {
  try {
    localStorage.setItem('match3_highscore', String(score))
  } catch {}
}
