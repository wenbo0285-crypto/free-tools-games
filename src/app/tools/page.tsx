import type { Metadata } from 'next'
import ToolCard from '@/components/ui/ToolCard'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import { tools } from '@/data/tools'

export const metadata: Metadata = {
  title: '免費線上工具',
  description: '免費線上工具集合，包含圖片壓縮、QR Code 產生、PDF 壓縮等實用工具，所有處理都在瀏覽器端完成。',
}

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">免費線上工具</h1>
      <p className="mb-8 text-gray-600">精選實用免費工具，保護你的隱私，所有處理都在瀏覽器本地完成。</p>

      <AdPlaceholder position="top-banner" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <div className="mt-8">
        <AdPlaceholder position="bottom" />
      </div>
    </div>
  )
}
