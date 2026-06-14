'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Board, Position, GameStatus, SpecialsBoard, SpecialPiece, MatchResult } from '@/lib/games/match-3/types'
import { BOARD_SIZE, INITIAL_STEPS, createEmptySpecials, getFruitFromValue, getSpecialFromValue } from '@/lib/games/match-3/types'
import {
  isAdjacent, swap, hasMatches, findMatches, removeMatches, applyGravity, fillEmpty,
  generateBoard, detectLTShape, getSpecialFromMatch, createSpecialAt, collectSpecialActivations,
  getCombinedSpecialEffect, getCellsAffectedBySpecial,
} from '@/lib/games/match-3/board'
import { calcMatchScore, getHighScore, saveHighScore } from '@/lib/games/match-3/scoring'
import { GameSound } from '@/lib/games/sound'

export interface AnimState {
  removing: Position[]
  falling: Position[]
  filling: Position[]
  specialActivating: Position[]
}

function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(-1))
}

export function useMatch3() {
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [isClient, setIsClient] = useState(false)
  const [specials, setSpecials] = useState<SpecialsBoard>(createEmptySpecials())
  // blockers will be added in Phase 3
  const [score, setScore] = useState(0)
  const [highScore, setHighScoreState] = useState(getHighScore())
  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [combo, setCombo] = useState(0)
  const [status, setStatus] = useState<GameStatus>('ready')
  const [selected, setSelected] = useState<Position | null>(null)
  const [animState, setAnimState] = useState<AnimState>({ removing: [], falling: [], filling: [], specialActivating: [] })
  const [soundOn, setSoundOn] = useState(true)
  const soundRef = useRef(new GameSound(true))
  const boardRef = useRef<Board>(board)
  const specialsRef = useRef<SpecialsBoard>(specials)
  useEffect(() => { boardRef.current = board; specialsRef.current = specials }, [board, specials])
  const processChainRef = useRef<((b: Board, sp: SpecialsBoard, c: number, s: number, r: number) => void) | null>(null)

  useEffect(() => {
    const gb = generateBoard()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoard(gb)
    setIsClient(true)
  }, [])

  const startGame = useCallback(() => {
    const gb = generateBoard()
    setBoard(gb)
    setSpecials(createEmptySpecials())
    setScore(0)
    setSteps(INITIAL_STEPS)
    setCombo(0)
    setStatus('playing')
    setSelected(null)
    setAnimState({ removing: [], falling: [], filling: [], specialActivating: [] })
    soundRef.current = new GameSound(true)
  }, [])

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev
      soundRef.current.setEnabled(next)
      return next
    })
  }, [])

  const processChain = useCallback((currentBoard: Board, currentSpecials: SpecialsBoard, currentCombo: number, totalScore: number, remainingSteps: number) => {
    let matches = findMatches(currentBoard, currentSpecials)
    const ltMatches = detectLTShape(currentBoard, matches, currentSpecials)
    matches = [...matches, ...ltMatches]

    if (matches.length === 0) {
      setBoard(currentBoard)
      setSpecials(currentSpecials)
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

    // Check for special piece activations
    const specialAffected = collectSpecialActivations(currentBoard, currentSpecials, allMatched)
    const allAffected = [...allMatched, ...specialAffected]

    const newCombo = currentCombo + 1
    setCombo(newCombo)
    setAnimState(prev => ({ ...prev, removing: allAffected, specialActivating: specialAffected }))

    if (newCombo >= 2) soundRef.current.combo()
    else soundRef.current.match3clear()

    setTimeout(() => {
      let cleared = removeMatches(currentBoard, matches)
      let newSpecials = currentSpecials.map(row => [...row])

      for (const m of matches) {
        const specialType = getSpecialFromMatch(m)
        if (specialType && m.center) {
          const fruit = getFruitFromValue(currentBoard[m.center.row][m.center.col])
          const result = createSpecialAt(cleared, newSpecials, m.center, specialType, fruit)
          cleared = result.board
          newSpecials = result.specials
        }
      }

      setAnimState({ removing: [], falling: [], filling: [], specialActivating: [] })

      const { board: gravBoard, specials: gravSpecials } = applyGravity(cleared, newSpecials)
      const { board: filledBoard, specials: filledSpecials } = fillEmpty(gravBoard, gravSpecials)

      const hasSpec = matches.some(m => getSpecialFromMatch(m) !== null) || specialAffected.length > 0
      const chainScore = calcMatchScore(allAffected.length, currentCombo, hasSpec)
      const newTotal = totalScore + chainScore
      setScore(newTotal)

      setTimeout(() => {
        processChainRef.current?.(filledBoard, filledSpecials, newCombo, newTotal, remainingSteps)
      }, 200)
    }, 250)
  }, [])

  useEffect(() => {
    processChainRef.current = processChain
  }, [processChain])

  const doSwap = useCallback((a: Position, b: Position) => {
    const currentBoard = boardRef.current
    const currentSpecials = specialsRef.current
    const testBoard = swap(currentBoard, a, b)
    if (!hasMatches(testBoard, currentSpecials)) return false

    const clickScore = score
    const clickSteps = steps

    setSelected(null)
    setBoard(testBoard)
    const newSteps = clickSteps - 1
    setSteps(newSteps)

    // Check if both swapped pieces are special (combined effect)
    const specA = currentSpecials[a.row]?.[a.col] ?? getSpecialFromValue(testBoard[a.row]?.[a.col] ?? -1)
    const specB = currentSpecials[b.row]?.[b.col] ?? getSpecialFromValue(testBoard[b.row]?.[b.col] ?? -1)
    const isComboSwap = specA && specB

    let allAffected: Position[]
    let matches: MatchResult[]

    if (isComboSwap) {
      const comboAffected = getCombinedSpecialEffect(testBoard, currentSpecials, a, b, specA!, specB!)
      allAffected = comboAffected
      matches = []
    } else {
      matches = findMatches(testBoard, currentSpecials)
      const ltMatches = detectLTShape(testBoard, matches, currentSpecials)
      matches = [...matches, ...ltMatches]

      const allPositions: Position[] = []
      for (const m of matches) {
        for (const p of m.positions) allPositions.push(p)
      }

      const specialAffected = collectSpecialActivations(testBoard, currentSpecials, allPositions)
      allAffected = [...allPositions, ...specialAffected]
    }

    setAnimState(prev => ({ ...prev, removing: allAffected, specialActivating: allAffected }))

    soundRef.current.match3swap()

    setTimeout(() => {
      let cleared = removeMatches(testBoard, matches)
      let newSpecials = currentSpecials.map(row => [...row])

      if (isComboSwap) {
        // Combined swap: clear all affected positions directly
        for (const p of allAffected) {
          if (getFruitFromValue(cleared[p.row][p.col]) > 0) {
            cleared[p.row][p.col] = -1
          }
        }
        newSpecials[a.row][a.col] = null
        newSpecials[b.row][b.col] = null
      } else {
        for (const m of matches) {
          const specialType = getSpecialFromMatch(m)
          if (specialType && m.center) {
            const fruit = getFruitFromValue(testBoard[m.center.row][m.center.col])
            const result = createSpecialAt(cleared, newSpecials, m.center, specialType, fruit)
            cleared = result.board
            newSpecials = result.specials
          }
        }
      }

      setAnimState({ removing: [], falling: [], filling: [], specialActivating: [] })

      const { board: gravBoard, specials: gravSpecials } = applyGravity(cleared, newSpecials)
      const { board: filledBoard, specials: filledSpecials } = fillEmpty(gravBoard, gravSpecials)

      const hasSpec = matches.some(m => getSpecialFromMatch(m) !== null) || !!(specA && specB)
      const matchScore = calcMatchScore(allAffected.length, 0, hasSpec)
      const newScore = clickScore + matchScore
      setScore(newScore)
      setCombo(1)

      setTimeout(() => {
        processChainRef.current?.(filledBoard, filledSpecials, 1, newScore, newSteps)
      }, 200)
    }, 250)

    return true
  }, [score, steps])

  const activateSpecialPiece = useCallback((pos: Position, sp: SpecialPiece) => {
    const currentBoard = boardRef.current
    const currentSpecials = specialsRef.current
    setSelected(null)

    const affected = [...getCellsAffectedBySpecial(currentBoard, pos, sp), pos]
    const clickScore = score
    const clickSteps = steps
    const newSteps = clickSteps - 1
    setSteps(newSteps)

    setAnimState(prev => ({ ...prev, removing: affected, specialActivating: affected }))
    soundRef.current.match3clear()

    setTimeout(() => {
      const cleared = removeMatches(currentBoard, [{ positions: affected, count: affected.length, shape: 'row' }])
      let newSpecials = currentSpecials.map(row => [...row])
      newSpecials[pos.row][pos.col] = null

      setAnimState({ removing: [], falling: [], filling: [], specialActivating: [] })
      const { board: gravBoard, specials: gravSpecials } = applyGravity(cleared, newSpecials)
      const { board: filledBoard, specials: filledSpecials } = fillEmpty(gravBoard, gravSpecials)

      const newScore = clickScore + calcMatchScore(affected.length, 0, true)
      setScore(newScore)
      setCombo(1)

      setTimeout(() => {
        processChainRef.current?.(filledBoard, filledSpecials, 1, newScore, newSteps)
      }, 200)
    }, 250)
  }, [score, steps])

  const handleCellClick = useCallback((pos: Position) => {
    if (status !== 'playing') return
    const sp = specialsRef.current[pos.row]?.[pos.col] ?? getSpecialFromValue(boardRef.current[pos.row]?.[pos.col] ?? -1)

    if (!selected) {
      // Clicking a special piece activates it directly
      if (sp) {
        activateSpecialPiece(pos, sp)
        return
      }
      setSelected(pos)
      soundRef.current.place()
      return
    }
    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null)
      return
    }
    if (!isAdjacent(selected, pos)) {
      // If target is special, activate it
      if (sp) {
        activateSpecialPiece(pos, sp)
        return
      }
      setSelected(pos)
      soundRef.current.place()
      return
    }

    const swapped = doSwap(selected, pos)
    if (!swapped) {
      setSelected(pos)
    }
  }, [status, selected, doSwap, activateSpecialPiece])

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
    board, specials, score, highScore, steps, combo, status, selected, animState, soundOn,
    isClient,
    startGame, handleCellClick, handleSwipe, pauseGame, setSelected, toggleSound,
  }
}
