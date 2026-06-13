import Link from 'next/link'
import type { Tool } from '@/data/tools'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 text-3xl">{tool.icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{tool.name}</h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">{tool.description}</p>
      <Link
        href={tool.href}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        立即使用
      </Link>
    </div>
  )
}
