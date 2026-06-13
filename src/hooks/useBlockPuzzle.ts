'use client'

import { useState, useCallback } from 'react'
import type { Board, Shape, Position, GameStatus, DragState } from '@/lib/games/block-puzzle/types'
import { createEmptyBoard, canPlace, placeShape, getFullRows, getFullCols, clearLines, canPlaceAny } from '@/lib/games/block-puzzle/board'
import { getRandomPieces } from '@/lib/games/block-puzzle/shapes'
import { calcPlaceScore, calcClearScore, getHighScore, saveHighScore } from '@/lib/games/block-puzzle/scoring'

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

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard())
    setCurrentPieces(getRandomPieces(3))
    setScore(0)
    setCombo(0)
    setStatus('playing')
    setAnimState({ clearingRows: [], clearingCols: [] })
    setLastClearCount(0)
  }, [])

  const pauseGame = useCallback(() => {
    setStatus(prev => prev === 'playing' ? 'paused' : 'playing')
  }, [])

  const placePiece = useCallback((pieceIndex: number, pos: Position) => {
    if (status !== 'playing') return
    const piece = currentPieces[pieceIndex]
    if (!piece || !canPlace(board, piece, pos)) return

    const cellsPlaced = piece.cells.flat().filter(Boolean).length
    const newBoard = placeShape(board, piece, pos)

    const fullRows = getFullRows(newBoard)
    const fullCols = getFullCols(newBoard)
    const totalLines = fullRows.length + fullCols.length

    if (totalLines > 0) {
      setAnimState({ clearingRows: fullRows, clearingCols: fullCols })
      const newCombo = combo + 1
      setCombo(newCombo)
      setLastClearCount(totalLines)

      setTimeout(() => {
        setAnimState({ clearingRows: [], clearingCols: [] })
        setBoard(clearLines(newBoard, fullRows, fullCols))
        setScore(prev => prev + calcPlaceScore(cellsPlaced) + calcClearScore(totalLines, newCombo))
      }, 300)
    } else {
      setCombo(0)
      setLastClearCount(0)
      setBoard(newBoard)
      setScore(prev => prev + calcPlaceScore(cellsPlaced))
    }

    const nextPieces = currentPieces.filter((_, i) => i !== pieceIndex)
    if (nextPieces.length === 0) {
      const newPieces = getRandomPieces(3)
      if (!canPlaceAny(newBoard, newPieces)) {
        setTimeout(() => {
          setStatus('gameOver')
          setCurrentPieces([])
          saveHighScore(score + calcPlaceScore(cellsPlaced))
          setHighScoreState(getHighScore())
        }, totalLines > 0 ? 400 : 100)
        return
      }
      setTimeout(() => setCurrentPieces(newPieces), totalLines > 0 ? 400 : 100)
    } else {
      if (!canPlaceAny(newBoard, nextPieces)) {
        setTimeout(() => {
          setStatus('gameOver')
          setCurrentPieces(nextPieces)
          saveHighScore(score + calcPlaceScore(cellsPlaced))
          setHighScoreState(getHighScore())
        }, totalLines > 0 ? 400 : 100)
        return
      }
      setTimeout(() => setCurrentPieces(nextPieces), totalLines > 0 ? 400 : 100)
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

  const toggleSound = useCallback(() => {
    setSoundOn(prev => !prev)
  }, [])

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
