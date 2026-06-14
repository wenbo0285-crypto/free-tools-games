'use client'

import { useCallback, useRef } from 'react'
import { useMatch3 } from '@/hooks/useMatch3'
import { BOARD_SIZE, FRUITS } from '@/lib/games/match-3/types'
import type { Position } from '@/lib/games/match-3/types'

const SWIPE_THRESHOLD = 20

export default function Match3Client() {
  const {
    board, score, highScore, steps, combo, status, selected, animState, soundOn,
    startGame, handleCellClick, handleSwipe, pauseGame, toggleSound,
  } = useMatch3()

  const gridRef = useRef<HTMLDivElement>(null)
  const swipeStart = useRef<{ row: number; col: number; x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  const isRemoving = (r: number, c: number) =>
    animState.removing.some(p => p.row === r && p.col === c)

  const getBoardPos = useCallback((clientX: number, clientY: number): Position | null => {
    const el = gridRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const col = Math.floor((clientX - rect.left) / (rect.width / BOARD_SIZE))
    const row = Math.floor((clientY - rect.top) / (rect.height / BOARD_SIZE))
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null
    return { row, col }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (status !== 'playing') return
    didSwipe.current = false
    const pos = getBoardPos(e.clientX, e.clientY)
    if (!pos) return
    swipeStart.current = { row: pos.row, col: pos.col, x: e.clientX, y: e.clientY }
  }, [status, getBoardPos])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const start = swipeStart.current
    if (!start || didSwipe.current || status !== 'playing') return
    e.preventDefault()
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return

    let direction: 'up' | 'down' | 'left' | 'right'
    if (absDx > absDy) {
      direction = dx > 0 ? 'right' : 'left'
    } else {
      direction = dy > 0 ? 'down' : 'up'
    }

    didSwipe.current = true
    handleSwipe({ row: start.row, col: start.col }, direction)
  }, [status, handleSwipe])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (didSwipe.current) { didSwipe.current = false; swipeStart.current = null; return }
    if (status !== 'playing') { swipeStart.current = null; return }
    const pos = getBoardPos(e.clientX, e.clientY)
    if (pos) handleCellClick(pos)
    swipeStart.current = null
  }, [status, handleCellClick, getBoardPos])

  const handlePointerCancel = useCallback(() => {
    swipeStart.current = null
    didSwipe.current = false
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Score bar */}
      <div className="flex w-full flex-wrap items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-200" style={{ maxWidth: 420, boxSizing: 'border-box', overflowWrap: 'anywhere' }}>
        <div className="text-center flex-1 min-w-0 px-1">
          <div className="text-xs text-gray-500">分數</div>
          <div className="text-xl font-bold text-gray-900">{score}</div>
        </div>
        <div className="text-center flex-1 min-w-0 px-1">
          <div className="text-xs text-gray-500">步數</div>
          <div className={`text-xl font-bold ${steps <= 5 ? 'text-red-500' : 'text-gray-900'}`}>{steps}</div>
        </div>
        <div className="text-center flex-1 min-w-0 px-1">
          <div className="text-xs text-gray-500">Combo</div>
          <div className="text-xl font-bold text-orange-500">{combo > 0 ? `x${combo}` : '-'}</div>
        </div>
        <div className="text-center flex-1 min-w-0 px-1">
          <div className="text-xs text-gray-500">最高分</div>
          <div className="text-lg font-bold text-purple-600" style={{ overflowWrap: 'anywhere' }}>{highScore}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap justify-center w-full" style={{ maxWidth: 420, boxSizing: 'border-box' }}>
        <button
          onClick={toggleSound}
          className="rounded-lg p-2 text-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          title={soundOn ? '關閉音效' : '開啟音效'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        {status === 'ready' || status === 'gameOver' ? (
          <button
            onClick={startGame}
            className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            {status === 'gameOver' ? '再玩一次' : '開始遊戲'}
          </button>
        ) : (
          <button
            onClick={pauseGame}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {status === 'paused' ? '繼續' : '暫停'}
          </button>
        )}
        {status !== 'ready' && status !== 'gameOver' && (
          <button
            onClick={startGame}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            重新開始
          </button>
        )}
      </div>

      {/* Board */}
      <div className="relative w-full" style={{ maxWidth: 420 }}>
        {status === 'paused' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-gray-100/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">已暫停</div>
              <button onClick={pauseGame} className="mt-3 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white">繼續遊戲</button>
            </div>
          </div>
        )}

        <div
          className={`rounded-xl border-2 border-gray-200 bg-gray-50 p-0.5 shadow-sm overflow-hidden ${status === 'gameOver' ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ display: status === 'paused' ? 'none' : 'block' }}
        >
          <div
            ref={gridRef}
            className="grid select-none touch-none"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              gap: '2px',
              aspectRatio: '1 / 1',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {board.map((row, r) =>
              row.map((fruit, c) => {
                const isSelected = selected?.row === r && selected?.col === c
                const removing = isRemoving(r, c)
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`
                      flex items-center justify-center rounded-xl cursor-pointer
                      transition-all duration-150
                      ${isSelected ? 'ring-3 ring-indigo-400 scale-105 shadow-md' : 'hover:ring-2 hover:ring-indigo-300'}
                      ${removing ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                      ${status === 'playing' ? 'hover:bg-indigo-50' : ''}
                    `}
                    style={{
                      aspectRatio: '1 / 1',
                      minWidth: 0,
                      minHeight: 0,
                      backgroundColor: fruit >= 0 ? 'white' : 'transparent',
                      transition: removing ? 'all 0.2s ease-out' : 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    {fruit >= 0 && (
                      <span
                        className={removing ? 'animate-ping' : ''}
                        style={{ fontSize: 'clamp(18px, 5vw, 30px)', lineHeight: 1 }}
                      >
                        {FRUITS[fruit]}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Game Over modal */}
      {status === 'gameOver' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl" style={{ boxSizing: 'border-box', maxWidth: 'calc(100vw - 32px)' }}>
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-900">遊戲結束</h2>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-500">本局分數</div>
              <div className="text-4xl font-bold text-indigo-600">{score}</div>
              {score >= highScore && score > 0 && (
                <div className="text-sm font-medium text-orange-500">🎉 新最高分！</div>
              )}
            </div>
            <button
              onClick={startGame}
              className="mt-6 w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              再玩一次
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
