import Link from 'next/link'
import type { Game } from '@/data/games'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 text-3xl">{game.icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{game.name}</h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">{game.description}</p>
      <Link
        href={game.href}
        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
      >
        立即遊玩
      </Link>
    </div>
  )
}
