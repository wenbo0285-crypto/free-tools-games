'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { useBlockPuzzle } from '@/hooks/useBlockPuzzle'
import { BOARD_SIZE } from '@/lib/games/block-puzzle/types'
import type { Shape } from '@/lib/games/block-puzzle/types'
import PrimaryButton from '@/components/ui/PrimaryButton'
import SecondaryButton from '@/components/ui/SecondaryButton'
import AdPlaceholder from '@/components/ui/AdPlaceholder'

export default function BlockPuzzleClient() {
  const {
    board, currentPieces, score, highScore, combo, status, soundOn, dragState, animState,
    startGame, pauseGame, startDrag, endDrag, setDragPos, toggleSound, clearDrag,
  } = useBlockPuzzle()

  const boardRef = useRef<HTMLDivElement>(null)
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 })

  const [boardPx, setBoardPx] = useState(400)
  useEffect(() => {
    const calc = () => setBoardPx(Math.min(window.innerWidth * 0.92, 420))
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const cellSize = Math.floor(boardPx / BOARD_SIZE)

  const getBoardPos = useCallback((clientX: number, clientY: number, shape?: Shape): { row: number; col: number } | null => {
    if (!boardRef.current) return null
    const rect = boardRef.current.getBoundingClientRect()
    let col = Math.floor((clientX - rect.left) / (rect.width / BOARD_SIZE))
    let row = Math.floor((clientY - rect.top) / (rect.height / BOARD_SIZE))
    if (shape) {
      row -= Math.floor(shape.cells.length / 2)
      col -= Math.floor(shape.cells[0].length / 2)
    }
    return { row, col }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent, pieceIndex: number) => {
    e.preventDefault()
    boardRef.current?.setPointerCapture(e.pointerId)
    startDrag(pieceIndex)
    setPointerPos({ x: e.clientX, y: e.clientY })
    const shape = currentPieces[pieceIndex]
    const pos = getBoardPos(e.clientX, e.clientY, shape)
    if (pos) setDragPos(pieceIndex, pos.row, pos.col)
  }, [startDrag, getBoardPos, setDragPos, currentPieces])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging) return
    e.preventDefault()
    setPointerPos({ x: e.clientX, y: e.clientY })
    const shape = currentPieces[dragState.pieceIndex]
    const pos = getBoardPos(e.clientX, e.clientY, shape)
    if (pos) setDragPos(dragState.pieceIndex, pos.row, pos.col)
  }, [dragState, getBoardPos, setDragPos, currentPieces])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    endDrag()
  }, [endDrag])

  const renderBoard = () => {
    const cells: React.ReactNode[] = []
    const shape = dragState.isDragging ? currentPieces[dragState.pieceIndex] : undefined

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const isClearingRow = animState.clearingRows.includes(r)
        const isClearingCol = animState.clearingCols.includes(c)

        let bgColor = '#f3f4f6'
        let extraClass = ''

        if (isClearingRow || isClearingCol) {
          bgColor = '#FCD34D'
          extraClass = 'animate-pulse'
        } else if (board[r][c]) {
          bgColor = '#4F46E5'
        } else if (dragState.previewPos && shape) {
          const pr = dragState.previewPos.row
          const pc = dragState.previewPos.col
          const cellInShape = shape.cells[r - pr]?.[c - pc]
          if (r >= pr && r < pr + shape.cells.length && c >= pc && c < pc + shape.cells[0].length && cellInShape) {
            const br = r
            const bc = c
            const outOfBounds = br < 0 || br >= BOARD_SIZE || bc < 0 || bc >= BOARD_SIZE
            const overlap = !outOfBounds && board[br][bc] === 1

            if (dragState.isValid) {
              bgColor = 'rgba(79, 70, 229, 0.25)'
            } else if (overlap) {
              bgColor = 'rgba(220, 38, 38, 0.45)'
              extraClass = 'ring-2 ring-red-600 ring-inset'
            } else if (outOfBounds) {
              bgColor = 'rgba(220, 38, 38, 0.2)'
            } else {
              bgColor = 'rgba(220, 38, 38, 0.3)'
            }
          }
        }

        cells.push(
          <div
            key={`${r}-${c}`}
            className={`border-[0.5px] border-gray-200 transition-colors duration-100 ${extraClass}`}
            style={{ backgroundColor: bgColor }}
          />
        )
      }
    }
    return cells
  }

  const renderPiece = (shape: Shape, index: number) => {
    if (dragState.isDragging && dragState.pieceIndex === index) return null
    return (
      <div
        key={index}
        className="inline-flex cursor-grab touch-none flex-col items-center rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm active:cursor-grabbing"
        onPointerDown={e => handlePointerDown(e, index)}
        style={{ userSelect: 'none', touchAction: 'none' }}
      >
        {shape.cells.map((row, ri) => (
          <div key={ri} className="flex" style={{ gap: 1 }}>
            {row.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  width: cellSize * 0.6,
                  height: cellSize * 0.6,
                  backgroundColor: cell ? shape.color : 'transparent',
                  borderRadius: 3,
                  visibility: cell ? 'visible' : 'hidden',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderFloatingPiece = () => {
    if (!dragState.isDragging || dragState.pieceIndex < 0) return null
    const shape = currentPieces[dragState.pieceIndex]
    if (!shape) return null
    const floatW = shape.cells[0].length * cellSize
    const floatH = shape.cells.length * cellSize
    return (
      <div
        className="pointer-events-none fixed z-50"
        style={{
          transform: `translate3d(${pointerPos.x - floatW / 2}px, ${pointerPos.y - floatH / 2}px, 0)`,
          opacity: dragState.isValid ? 0.85 : 0.4,
        }}
      >
        {shape.cells.map((row, ri) => (
          <div key={ri} className="flex" style={{ gap: 1 }}>
            {row.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? shape.color : 'transparent',
                  borderRadius: 4,
                  visibility: cell ? 'visible' : 'hidden',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderGameOver = () => {
    if (status !== 'gameOver') return null
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm animate-in rounded-2xl bg-white p-8 text-center shadow-2xl">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">遊戲結束</h2>
          <p className="mb-1 text-lg text-gray-600">本局分數</p>
          <p className="mb-4 text-4xl font-bold text-indigo-600">{score}</p>
          <p className="mb-6 text-sm text-gray-500">最高分：{highScore}</p>
          <AdPlaceholder position="game-over" />
          <div className="mt-4 flex flex-col gap-3">
            <PrimaryButton onClick={startGame}>再玩一次</PrimaryButton>
            <SecondaryButton onClick={() => window.location.href = '/games'}>返回遊戲列表</SecondaryButton>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'ready') {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mb-4 text-5xl">🧩</div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">方塊拼圖</h2>
          <p className="mb-6 text-gray-600">8x8 棋盤消除遊戲，挑戰你的最高分！</p>
          <PrimaryButton onClick={startGame}>開始遊戲</PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-500">分數</span>
            <p className="text-lg font-bold text-gray-900">{score}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">最高分</span>
            <p className="text-lg font-bold text-indigo-600">{highScore}</p>
          </div>
          {combo > 0 && (
            <div className="animate-bounce rounded-full bg-amber-100 px-3 py-1">
              <span className="text-sm font-bold text-amber-600">{combo}x Combo!</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            title={soundOn ? '關閉音效' : '開啟音效'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          <SecondaryButton onClick={pauseGame}>
            {status === 'paused' ? '繼續' : '暫停'}
          </SecondaryButton>
          <SecondaryButton onClick={startGame}>重新開始</SecondaryButton>
        </div>
      </div>

      {status === 'paused' ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="mb-4 text-xl font-bold text-gray-900">遊戲暫停</p>
            <PrimaryButton onClick={pauseGame}>繼續遊戲</PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4 p-4">
            <div
              style={{ width: boardPx }}
              className="touch-none select-none"
            >
              <div
                ref={boardRef}
                className="grid rounded-lg border-2 border-gray-300 bg-gray-50 overflow-hidden"
                style={{
                  aspectRatio: '1 / 1',
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={clearDrag}
              >
                {renderBoard()}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 min-h-[70px]">
              {currentPieces.map((shape, i) => renderPiece(shape, i))}
            </div>

            {currentPieces.length === 0 && status === 'playing' && (
              <p className="text-sm text-gray-400">計算中...</p>
            )}
          </div>

          {renderFloatingPiece()}
        </>
      )}

      {renderGameOver()}
    </div>
  )
}
