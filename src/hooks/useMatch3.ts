'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Board, Position, GameStatus } from '@/lib/games/match-3/types'
import { INITIAL_STEPS } from '@/lib/games/match-3/types'
import { isAdjacent, swap, hasMatches, findMatches, removeMatches, applyGravity, fillEmpty, generateBoard } from '@/lib/games/match-3/board'
import { calcMatchScore, getHighScore, saveHighScore } from '@/lib/games/match-3/scoring'
import { GameSound } from '@/lib/games/sound'

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
  const [soundOn, setSoundOn] = useState(true)
  const soundRef = useRef(new GameSound(true))
  const boardRef = useRef<Board>(board)
  useEffect(() => { boardRef.current = board }, [board])
  const processChainRef = useRef<((b: Board, c: number, s: number, r: number) => void) | null>(null)

  const startGame = useCallback(() => {
    const gb = generateBoard()
    setBoard(gb)
    setScore(0)
    setSteps(INITIAL_STEPS)
    setCombo(0)
    setStatus('playing')
    setSelected(null)
    setAnimState({ removing: [], falling: [], filling: [] })
    soundRef.current = new GameSound(true)
  }, [])

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev
      soundRef.current.setEnabled(next)
      return next
    })
  }, [])

  const processChain = useCallback((currentBoard: Board, currentCombo: number, totalScore: number, remainingSteps: number) => {
    const matches = findMatches(currentBoard)
    if (matches.length === 0) {
      setBoard(currentBoard)
      if (remainingSteps <= 0) {
        setStatus('gameOver')
        saveHighScore(totalScore)
        setHighScoreState(getHighScore())
        soundRef.current.gameOver()
      }
      return
    }

    const allMatched: Position[] = []
    for (const m of matches) {
      for (const p of m.positions) allMatched.push(p)
    }

    const matchCount = allMatched.length
    const newCombo = currentCombo + 1
    setCombo(newCombo)
    setAnimState(prev => ({ ...prev, removing: allMatched }))

    if (newCombo >= 2) soundRef.current.combo()
    else soundRef.current.match3clear()

    setTimeout(() => {
      const cleared = removeMatches(currentBoard, matches)
      setAnimState({ removing: [], falling: [], filling: [] })

      const { board: gravBoard } = applyGravity(cleared)
      const { board: filledBoard } = fillEmpty(gravBoard)

      const chainScore = calcMatchScore(matchCount, currentCombo)
      const newTotal = totalScore + Math.round(chainScore)
      setScore(newTotal)

      setTimeout(() => {
        processChainRef.current?.(filledBoard, newCombo, newTotal, remainingSteps)
      }, 200)
    }, 250)
  }, [])

  useEffect(() => {
    processChainRef.current = processChain
  }, [processChain])

  const doSwap = useCallback((a: Position, b: Position) => {
    const currentBoard = boardRef.current
    const testBoard = swap(currentBoard, a, b)
    if (!hasMatches(testBoard)) return false

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

    soundRef.current.match3swap()

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
        processChainRef.current?.(filledBoard, 1, newScore, newSteps)
      }, 200)
    }, 250)

    return true
  }, [score, steps])

  const handleCellClick = useCallback((pos: Position) => {
    if (status !== 'playing') return
    if (!selected) {
      setSelected(pos)
      soundRef.current.place()
      return
    }
    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null)
      return
    }
    if (!isAdjacent(selected, pos)) {
      setSelected(pos)
      soundRef.current.place()
      return
    }

    const swapped = doSwap(selected, pos)
    if (!swapped) {
      setSelected(pos)
    }
  }, [status, selected, doSwap])

  const handleSwipe = useCallback((from: Position, direction: 'up' | 'down' | 'left' | 'right') => {
    if (status !== 'playing') return
    const to: Position = { row: from.row, col: from.col }
    if (direction === 'up') to.row--
    else if (direction === 'down') to.row++
    else if (direction === 'left') to.col--
    else if (direction === 'right') to.col++

    if (to.row < 0 || to.row >= 8 || to.col < 0 || to.col >= 8) return
    setSelected(from)
    doSwap(from, to)
  }, [status, doSwap])

  const pauseGame = useCallback(() => {
    setStatus(prev => prev === 'playing' ? 'paused' : 'playing')
  }, [])

  return {
    board, score, highScore, steps, combo, status, selected, animState, soundOn,
    startGame, handleCellClick, handleSwipe, pauseGame, setSelected, toggleSound,
  }
}
