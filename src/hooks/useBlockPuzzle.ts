'use client'

import { useState, useCallback, useRef } from 'react'
import type { Board, Shape, Position, GameStatus, DragState } from '@/lib/games/block-puzzle/types'
import { createEmptyBoard, canPlace, placeShape, getFullRows, getFullCols, clearLines, canPlaceAny } from '@/lib/games/block-puzzle/board'
import { getWeightedRandomPieces } from '@/lib/games/block-puzzle/shapes'
import { calcPlaceScore, calcClearScore, getHighScore, saveHighScore } from '@/lib/games/block-puzzle/scoring'
import { GameSound } from '@/lib/games/sound'

export interface AnimationState {
  clearingRows: number[]
  clearingCols: number[]
}

export function useBlockPuzzle() {
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [currentPieces, setCurrentPieces] = useState<Shape[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScoreState] = useState(getHighScore())
  const [combo, setCombo] = useState(0)
  const [status, setStatus] = useState<GameStatus>('ready')
  const [soundOn, setSoundOn] = useState(true)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    pieceIndex: -1,
    offset: { row: 0, col: 0 },
    previewPos: null,
    isValid: false,
  })
  const [animState, setAnimState] = useState<AnimationState>({ clearingRows: [], clearingCols: [] })
  const [lastClearCount, setLastClearCount] = useState(0)
  const soundRef = useRef(new GameSound(true))

  const startGame = useCallback(() => {
    const b = createEmptyBoard()
    setBoard(b)
    const newPieces = getWeightedRandomPieces(3)
    setCurrentPieces(newPieces)
    setScore(0)
    setCombo(0)
    setStatus('playing')
    setAnimState({ clearingRows: [], clearingCols: [] })
    setLastClearCount(0)
    soundRef.current = new GameSound(true)
  }, [])

  const pauseGame = useCallback(() => {
    setStatus(prev => prev === 'playing' ? 'paused' : 'playing')
  }, [])

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev
      soundRef.current.setEnabled(next)
      return next
    })
  }, [])

  const placePiece = useCallback((pieceIndex: number, pos: Position) => {
    if (status !== 'playing') return
    const piece = currentPieces[pieceIndex]
    if (!piece || !canPlace(board, piece, pos)) return

    const cellsPlaced = piece.cells.flat().filter(Boolean).length
    const newBoard = placeShape(board, piece, pos)
    const currentScore = score

    const fullRows = getFullRows(newBoard)
    const fullCols = getFullCols(newBoard)
    const totalLines = fullRows.length + fullCols.length

    soundRef.current.place()

    const processRemaining = (afterBoard: Board, afterScore: number) => {
      const remaining = currentPieces.filter((_, i) => i !== pieceIndex)
      const checkPieces = remaining.length === 0 ? getWeightedRandomPieces(3) : remaining
      if (!canPlaceAny(afterBoard, checkPieces)) {
        setStatus('gameOver')
        setCurrentPieces(checkPieces)
        saveHighScore(afterScore)
        setHighScoreState(getHighScore())
        soundRef.current.gameOver()
        return
      }
      setCurrentPieces(remaining.length === 0 ? checkPieces : remaining)
    }

    if (totalLines > 0) {
      setAnimState({ clearingRows: fullRows, clearingCols: fullCols })
      const newCombo = combo + 1
      setCombo(newCombo)
      setLastClearCount(totalLines)

      setTimeout(() => {
        soundRef.current.clear()
        if (newCombo >= 2) soundRef.current.combo()
        setAnimState({ clearingRows: [], clearingCols: [] })
        const clearedBoard = clearLines(newBoard, fullRows, fullCols)
        setBoard(clearedBoard)
        const newScore = currentScore + calcPlaceScore(cellsPlaced) + calcClearScore(totalLines, newCombo)
        setScore(newScore)
        processRemaining(clearedBoard, newScore)
      }, 300)
    } else {
      setCombo(0)
      setLastClearCount(0)
      setBoard(newBoard)
      const newScore = currentScore + calcPlaceScore(cellsPlaced)
      setScore(newScore)
      processRemaining(newBoard, newScore)
    }
  }, [board, currentPieces, status, combo, score])

  const setDragPos = useCallback((pieceIndex: number, boardRow: number, boardCol: number) => {
    const piece = currentPieces[pieceIndex]
    if (!piece) return
    const pos = { row: boardRow, col: boardCol }
    const isValid = canPlace(board, piece, pos)
    setDragState(prev => ({
      ...prev,
      pieceIndex,
      previewPos: pos,
      isValid,
    }))
  }, [board, currentPieces])

  const startDrag = useCallback((pieceIndex: number) => {
    setDragState({
      isDragging: true,
      pieceIndex,
      offset: { row: 0, col: 0 },
      previewPos: null,
      isValid: false,
    })
  }, [])

  const endDrag = useCallback(() => {
    if (dragState.previewPos && dragState.isValid) {
      placePiece(dragState.pieceIndex, dragState.previewPos)
    }
    setDragState({
      isDragging: false,
      pieceIndex: -1,
      offset: { row: 0, col: 0 },
      previewPos: null,
      isValid: false,
    })
  }, [dragState, placePiece])

  const clearDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      pieceIndex: -1,
      offset: { row: 0, col: 0 },
      previewPos: null,
      isValid: false,
    })
  }, [])

  return {
    board, currentPieces, score, highScore, combo, status, soundOn, dragState, animState, lastClearCount,
    startGame, pauseGame, placePiece, startDrag, endDrag, setDragPos, toggleSound, clearDrag,
  }
}
