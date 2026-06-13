'use client'

import { useCallback, useRef } from 'react'
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

  const cellSize = Math.min(44, Math.floor((typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 600) : 600) / BOARD_SIZE))

  const getBoardPos = useCallback((clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!boardRef.current) return null
    const rect = boardRef.current.getBoundingClientRect()
    const col = Math.floor((clientX - rect.left) / cellSize)
    const row = Math.floor((clientY - rect.top) / cellSize)
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null
    return { row, col }
  }, [cellSize])

  const handlePointerDown = useCallback((e: React.PointerEvent, pieceIndex: number) => {
    e.preventDefault()
    boardRef.current?.setPointerCapture(e.pointerId)
    startDrag(pieceIndex)
    const pos = getBoardPos(e.clientX, e.clientY)
    if (pos) setDragPos(pieceIndex, pos.row, pos.col)
  }, [startDrag, getBoardPos, setDragPos])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging) return
    e.preventDefault()
    const pos = getBoardPos(e.clientX, e.clientY)
    if (pos) setDragPos(dragState.pieceIndex, pos.row, pos.col)
  }, [dragState, getBoardPos, setDragPos])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    endDrag()
  }, [endDrag])

  const handleTouchStart = useCallback((e: React.TouchEvent, pieceIndex: number) => {
    const touch = e.touches[0]
    if (!touch) return
    startDrag(pieceIndex)
    const pos = getBoardPos(touch.clientX, touch.clientY)
    if (pos) setDragPos(pieceIndex, pos.row, pos.col)
  }, [startDrag, getBoardPos, setDragPos])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragState.isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return
    const pos = getBoardPos(touch.clientX, touch.clientY)
    if (pos) setDragPos(dragState.pieceIndex, pos.row, pos.col)
  }, [dragState, getBoardPos, setDragPos])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    endDrag()
  }, [endDrag])

  function renderBoard() {
    const cells: React.ReactNode[] = []

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const isClearingRow = animState.clearingRows.includes(r)
        const isClearingCol = animState.clearingCols.includes(c)

        cells.push(
          <div
            key={`${r}-${c}`}
            className={`border-[0.5px] border-gray-200 transition-colors duration-150 ${isClearingRow || isClearingCol ? 'animate-pulse' : ''}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: board[r][c] ? '#4F46E5' : isClearingRow || isClearingCol ? '#FCD34D' : dragState.previewPos && dragState.isValid &&
                r >= dragState.previewPos.row && r < dragState.previewPos.row + (currentPieces[dragState.pieceIndex]?.cells.length || 1) &&
                c >= dragState.previewPos.col && c < dragState.previewPos.col + (currentPieces[dragState.pieceIndex]?.cells[0]?.length || 1)
                ? (currentPieces[dragState.pieceIndex]?.cells[r - dragState.previewPos.row]?.[c - dragState.previewPos.col]
                  ? 'rgba(79, 70, 229, 0.25)' : '#f3f4f6')
                : '#f3f4f6',
              borderRadius: 2,
            }}
          />
        )
      }
    }
    return cells
  }

  function renderPiece(shape: Shape, index: number) {
    const isDraggingThis = dragState.isDragging && dragState.pieceIndex === index
    if (isDraggingThis) return null

    return (
      <div
        key={index}
        className="inline-flex cursor-grab touch-none flex-col items-center rounded-lg border border-gray-200 bg-white p-2 shadow-sm active:cursor-grabbing"
        onPointerDown={e => handlePointerDown(e, index)}
        onTouchStart={e => handleTouchStart(e, index)}
        style={{ userSelect: 'none' }}
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

  function renderFloatingPiece() {
    if (!dragState.isDragging || dragState.pieceIndex < 0) return null
    const shape = currentPieces[dragState.pieceIndex]
    if (!shape) return null

    return (
      <div
        className="pointer-events-none fixed z-50"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: dragState.isValid ? 0.8 : 0.4,
        }}
      >
        {shape.cells.map((row, ri) => (
          <div key={ri} className="flex" style={{ gap: 1 }}>
            {row.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  width: cellSize * 0.7,
                  height: cellSize * 0.7,
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

  function renderGameOver() {
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
              ref={boardRef}
              className="grid touch-none select-none rounded-lg border-2 border-gray-300 bg-gray-50"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
                gap: 0,
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={clearDrag}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {renderBoard()}
            </div>

            <div className="flex items-center justify-center gap-4">
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
