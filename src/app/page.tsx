import Link from 'next/link'
import ToolCard from '@/components/ui/ToolCard'
import GameCard from '@/components/ui/GameCard'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import { tools } from '@/data/tools'
import { games } from '@/data/games'
import { siteConfig } from '@/data/site'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">{siteConfig.name}</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
          {siteConfig.description}
        </p>
      </section>

      <AdPlaceholder position="top-banner" />

      <section className="mb-12 mt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">免費工具</h2>
          <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            檢視全部
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">免費小遊戲</h2>
          <Link href="/games" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            檢視全部
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <AdPlaceholder position="bottom" />
    </div>
  )
}
