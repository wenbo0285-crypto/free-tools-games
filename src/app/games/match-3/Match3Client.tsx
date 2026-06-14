'use client'

import { useMatch3 } from '@/hooks/useMatch3'
import { BOARD_SIZE, FRUITS } from '@/lib/games/match-3/types'
import { useState, useEffect } from 'react'

export default function Match3Client() {
  const {
    board, score, highScore, steps, combo, status, selected, animState,
    startGame, handleCellClick, pauseGame,
  } = useMatch3()

  const [boardPx, setBoardPx] = useState(400)
  useEffect(() => {
    const calc = () => setBoardPx(Math.min(window.innerWidth * 0.92, 420))
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const isRemoving = (r: number, c: number) =>
    animState.removing.some(p => p.row === r && p.col === c)

  const pauseOverlay = status === 'paused' ? (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-gray-100/80 backdrop-blur-sm"
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">已暫停</div>
        <button onClick={pauseGame} className="mt-3 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white">繼續遊戲</button>
      </div>
    </div>
  ) : null

  return (
    <div className="flex flex-col items-center gap-6 overflow-x-hidden max-w-full" style={{ boxSizing: 'border-box' }}>
      {/* Score bar */}
      <div className="flex w-full flex-wrap items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-200" style={{ maxWidth: 'min(92vw, 420px)', boxSizing: 'border-box', overflowWrap: 'anywhere' }}>
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
      <div className="flex gap-3 flex-wrap justify-center">
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

      {/* Board + pause overlay */}
      <div className="relative" style={{ width: boardPx }}>
        {pauseOverlay}

        <div className={`rounded-xl border-2 border-gray-200 bg-gray-50 p-0.5 shadow-sm overflow-hidden ${status === 'gameOver' ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ display: status === 'paused' ? 'none' : 'block' }}>
          <div
            className="grid select-none touch-none"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gap: '2px',
              aspectRatio: '1 / 1',
            }}
          >
            {board.map((row, r) =>
              row.map((fruit, c) => {
                const isSelected = selected?.row === r && selected?.col === c
                const removing = isRemoving(r, c)
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => status === 'playing' && !removing ? handleCellClick({ row: r, col: c }) : undefined}
                    className={`
                      flex items-center justify-center rounded-xl cursor-pointer
                      transition-all duration-150 select-none touch-none
                      ${isSelected ? 'ring-3 ring-indigo-400 scale-105 shadow-md' : 'hover:ring-2 hover:ring-indigo-300'}
                      ${removing ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                      ${status === 'playing' ? 'hover:bg-indigo-50' : ''}
                    `}
                    style={{
                      aspectRatio: '1 / 1',
                      backgroundColor: fruit >= 0 ? 'white' : 'transparent',
                      transition: removing ? 'all 0.2s ease-out' : 'all 0.15s ease',
                    }}
                  >
                    {fruit >= 0 && (
                      <span className={removing ? 'animate-ping' : ''} style={{ fontSize: 'clamp(18px, 5vw, 32px)' }}>
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
