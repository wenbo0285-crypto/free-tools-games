'use client'

import { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { useMatch3 } from '@/hooks/useMatch3'
import { BOARD_SIZE, CAT_NAMES, CAT_IMAGES, SPECIAL_IMAGES, getSpecialFromValue, getFruitFromValue } from '@/lib/games/match-3/types'
import type { Position, SpecialPiece } from '@/lib/games/match-3/types'

const SWIPE_THRESHOLD = 20

interface Particle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  color: string
}

interface ComboPopup {
  combo: number
  score: number
}

function CatImage({ fruit, special, removing, falling, activating, spType }: {
  fruit: number
  special: SpecialPiece | null
  removing: boolean
  falling: boolean
  activating: boolean
  spType: SpecialPiece | null
}) {
  const src = special ? SPECIAL_IMAGES[special] ?? CAT_IMAGES[fruit] : CAT_IMAGES[fruit]
  const [loaded, setLoaded] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (removing) {
      const t = setTimeout(() => setShowParticles(true), 150)
      return () => clearTimeout(t)
    }
    setShowParticles(false)
  }, [removing])

  let animClass = ''
  if (removing) animClass = 'anim-pop-out'
  else if (falling) animClass = 'anim-bounce-drop'
  else if (activating && spType === 'lineH') animClass = 'anim-beam-h'
  else if (activating && spType === 'lineV') animClass = 'anim-beam-v'
  else if (activating && spType === 'bomb') animClass = 'anim-explode'
  else if (activating && spType === 'colorBomb') animClass = 'anim-rainbow'
  else if (activating && spType === 'wrapped') animClass = 'anim-explode'

  return (
    <div className={`relative flex items-center justify-center w-full h-full ${animClass} ${activating ? 'z-10' : ''}`}>
      {!loaded && !removing && <div className="absolute inset-0 bg-gray-100 rounded-lg animate-pulse" />}
      <img
        src={src}
        alt={CAT_NAMES[fruit] ?? ''}
        className={`w-[80%] h-[80%] object-contain transition-opacity duration-100 ${loaded || removing ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        draggable={false}
      />
      {showParticles && <ParticleBurst />}
    </div>
  )
}

function ParticleBurst() {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f97316']
  const particles = useMemo(() => {
    const arr: Particle[] = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.5
      const dist = 20 + Math.random() * 20
      arr.push({
        id: i,
        x: 50,
        y: 50,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        color: colors[i % colors.length],
      })
    }
    return arr
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full anim-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 6,
            height: 6,
            backgroundColor: p.color,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function SpecialEffectOverlay({ spType, pos }: { spType: SpecialPiece; pos: { row: number; col: number } }) {
  let className = 'absolute inset-0 pointer-events-none rounded-xl z-15'
  let style: React.CSSProperties = {}

  if (spType === 'lineH') {
    className += ' bg-gradient-to-r from-yellow-300/60 via-yellow-200/40 to-yellow-300/60'
    style = { animation: 'beam-h 0.4s ease-out forwards' }
  } else if (spType === 'lineV') {
    className += ' bg-gradient-to-b from-blue-300/60 via-blue-200/40 to-blue-300/60'
    style = { animation: 'beam-v 0.4s ease-out forwards' }
  } else if (spType === 'bomb') {
    className += ' bg-gradient-to-br from-orange-400/60 via-red-400/40 to-orange-400/60'
    style = { animation: 'explode 0.4s ease-out forwards' }
  } else if (spType === 'colorBomb') {
    className += ' bg-gradient-to-br from-purple-400/60 via-pink-400/40 via-yellow-300/40 to-purple-400/60'
    style = { animation: 'rainbow-flash 0.6s ease-out forwards' }
  } else if (spType === 'wrapped') {
    className += ' bg-gradient-to-br from-green-400/60 via-teal-300/40 to-green-400/60'
    style = { animation: 'explode 0.5s ease-out forwards' }
  }

  return <div className={className} style={style} />
}

function ComboDisplay({ combo, score }: { combo: number; score: number }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 1200)
    return () => clearTimeout(t)
  }, [combo, score])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
      <div className="anim-combo text-center">
        <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-lg">
          {combo >= 4 ? '🔥 Combo x' + combo : combo >= 3 ? '⚡ Combo x' + combo : combo >= 2 ? 'Combo x' + combo : ''}
        </div>
        {score > 0 && (
          <div className="text-2xl font-bold text-yellow-500 drop-shadow mt-1">
            +{score}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Match3Client() {
  const {
    board, specials, score, highScore, steps, combo, status, selected, animState, soundOn,
    isClient,
    startGame, handleCellClick, handleSwipe, pauseGame, toggleSound,
  } = useMatch3()

  const gridRef = useRef<HTMLDivElement>(null)
  const swipeStart = useRef<{ row: number; col: number; x: number; y: number } | null>(null)
  const didSwipe = useRef(false)
  const [comboPopup, setComboPopup] = useState<ComboPopup | null>(null)
  const prevComboRef = useRef(0)

  useEffect(() => {
    if (combo >= 2 && combo !== prevComboRef.current) {
      const bonus = Math.min(combo, 6) * 100
      setComboPopup({ combo, score: bonus })
      const t = setTimeout(() => setComboPopup(null), 1300)
      prevComboRef.current = combo
      return () => clearTimeout(t)
    }
    if (combo === 0) prevComboRef.current = 0
  }, [combo])

  const isRemoving = (r: number, c: number) =>
    animState.removing.some(p => p.row === r && p.col === c)

  const isFalling = (r: number, c: number) =>
    animState.falling.some(p => p.row === r && p.col === c)

  const isActivating = (r: number, c: number) =>
    animState.specialActivating.some(p => p.row === r && p.col === c)

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
          <div className={`text-xl font-bold ${combo >= 3 ? 'text-purple-500' : combo >= 2 ? 'text-orange-500' : 'text-gray-500'}`}>
            {combo > 0 ? `x${combo}` : '-'}
          </div>
        </div>
        <div className="text-center flex-1 min-w-0 px-1">
          <div className="text-xs text-gray-500">最高分</div>
          <div className="text-lg font-bold text-purple-600" style={{ overflowWrap: 'anywhere' }}>{highScore}</div>
        </div>
      </div>

      {comboPopup && <ComboDisplay combo={comboPopup.combo} score={comboPopup.score} />}

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

      <div className="relative w-full" style={{ maxWidth: 420 }}>
        {!isClient && (
          <div className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50" style={{ aspectRatio: '1 / 1' }}>
            <div className="text-gray-400 text-sm">載入中...</div>
          </div>
        )}
        {isClient && status === 'paused' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-gray-100/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">已暫停</div>
              <button onClick={pauseGame} className="mt-3 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white">繼續遊戲</button>
            </div>
          </div>
        )}

        {isClient && (
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
              row.map((value, c) => {
                const isSelected = selected?.row === r && selected?.col === c
                const removing = isRemoving(r, c)
                const falling = isFalling(r, c)
                const activating = isActivating(r, c)
                const fruit = getFruitFromValue(value)
                const special = getSpecialFromValue(value) ?? specials[r]?.[c] ?? null
                const isEmpty = value < 0
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`
                      flex items-center justify-center rounded-xl cursor-pointer
                      transition-all duration-150
                      ${isSelected ? 'ring-3 ring-indigo-400 scale-105 shadow-md' : 'hover:ring-2 hover:ring-indigo-300'}
                      ${status === 'playing' && !isEmpty ? 'hover:bg-indigo-50' : ''}
                    `}
                    style={{
                      aspectRatio: '1 / 1',
                      minWidth: 0,
                      minHeight: 0,
                      backgroundColor: !isEmpty ? 'white' : 'transparent',
                      boxSizing: 'border-box',
                    }}
                  >
                    {activating && special && (
                      <SpecialEffectOverlay spType={special} pos={{ row: r, col: c }} />
                    )}
                    {!isEmpty && (
                      <CatImage
                        fruit={fruit}
                        special={special}
                        removing={removing}
                        falling={falling}
                        activating={activating}
                        spType={activating ? special : null}
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
        )}
      </div>

      {isClient && status === 'gameOver' && (
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
