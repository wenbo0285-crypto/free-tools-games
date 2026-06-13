import type { Metadata } from 'next'
import GameCard from '@/components/ui/GameCard'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import { games } from '@/data/games'

export const metadata: Metadata = {
  title: '免費網頁小遊戲',
  description: '免費網頁小遊戲集合，包含方塊拼圖、三消遊戲等經典玩法，不需下載安裝，開啟瀏覽器即可遊玩。',
}

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">免費網頁小遊戲</h1>
      <p className="mb-8 text-gray-600">精選免費網頁小遊戲，無需下載，開啟即玩。</p>

      <AdPlaceholder position="top-banner" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      <div className="mt-8">
        <AdPlaceholder position="bottom" />
      </div>
    </div>
  )
}
