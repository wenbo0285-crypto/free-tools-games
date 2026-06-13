'use client'

import { useState, useCallback } from 'react'
import type { Board, Position, GameStatus } from '@/lib/games/match-3/types'
import { INITIAL_STEPS } from '@/lib/games/match-3/types'
import { isAdjacent, swap, hasMatches, findMatches, removeMatches, applyGravity, fillEmpty, generateBoard } from '@/lib/games/match-3/board'
import { calcMatchScore, getHighScore } from '@/lib/games/match-3/scoring'

export interface AnimState {
  removing: Position[]
  falling: Position[]
  filling: Position[]
}

export function useMatch3() {
  const [board, setBoard] = useState<Board>(generateBoard())
  const [score, setScore] = useState(0)
  const [highScore, setHighScoreState] = useState(getHighScore())
  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [combo, setCombo] = useState(0)
  const [status, setStatus] = useState<GameStatus>('ready')
  const [selected, setSelected] = useState<Position | null>(null)
  const [animState, setAnimState] = useState<AnimState>({ removing: [], falling: [], filling: [] })

  const startGame = useCallback(() => {
    setBoard(generateBoard())
    setScore(0)
    setSteps(INITIAL_STEPS)
    setCombo(0)
    setStatus('playing')
    setSelected(null)
    setAnimState({ removing: [], falling: [], filling: [] })
  }, [])

  const handleCellClick = useCallback((pos: Position) => {
    if (status !== 'playing') return
    if (!selected) { setSelected(pos); return }
    if (selected.row === pos.row && selected.col === pos.col) { setSelected(null); return }
    if (!isAdjacent(selected, pos)) { setSelected(pos); return }

    const testBoard = swap(board, selected, pos)
    if (!hasMatches(testBoard)) { setSelected(pos); return }

    const clickScore = score
    const clickSteps = steps

    setSelected(null)
    setBoard(testBoard)
    const newSteps = clickSteps - 1
    setSteps(newSteps)

    const matches = findMatches(testBoard)
    const allPositions: Position[] = []
    for (const m of matches) {
      for (const p of m.positions) allPositions.push(p)
    }
    setAnimState(prev => ({ ...prev, removing: allPositions }))

    const processChain = (currentBoard: Board, currentCombo: number, totalScore: number, remainingSteps: number) => {
      const matches = findMatches(currentBoard)
      if (matches.length === 0) {
        setBoard(currentBoard)
        if (remainingSteps <= 0) {
          setStatus('gameOver')
          setHighScoreState(getHighScore())
        }
        return
      }

      const cp: Position[] = []
      for (const m of matches) {
        for (const p of m.positions) cp.push(p)
      }

      const matchCount = cp.length
      const newCombo = currentCombo + 1
      setCombo(newCombo)
      setAnimState(prev => ({ ...prev, removing: cp }))

      setTimeout(() => {
        const cleared = removeMatches(currentBoard, matches)
        setAnimState({ removing: [], falling: [], filling: [] })

        const { board: gravBoard } = applyGravity(cleared)

        const { board: filledBoard } = fillEmpty(gravBoard)

        const chainScore = calcMatchScore(matchCount, currentCombo)
        const newTotal = totalScore + Math.round(chainScore)
        setScore(newTotal)

        setTimeout(() => {
          processChain(filledBoard, newCombo, newTotal, remainingSteps)
        }, 200)
      }, 250)
    }

    setTimeout(() => {
      const cleared = removeMatches(testBoard, matches)
      setAnimState({ removing: [], falling: [], filling: [] })

      const { board: gravBoard } = applyGravity(cleared)
      const { board: filledBoard } = fillEmpty(gravBoard)

      const matchScore = calcMatchScore(allPositions.length, 0)
      const newScore = clickScore + Math.round(matchScore)
      setScore(newScore)
      setCombo(1)

      setTimeout(() => {
        processChain(filledBoard, 1, newScore, newSteps)
      }, 200)
    }, 250)
  }, [board, score, steps, selected, status])

  const pauseGame = useCallback(() => {
    setStatus(prev => prev === 'playing' ? 'paused' : 'playing')
  }, [])

  return {
    board, score, highScore, steps, combo, status, selected, animState,
    startGame, handleCellClick, pauseGame, setSelected,
  }
}
