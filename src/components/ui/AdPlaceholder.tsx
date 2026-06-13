type AdPosition = 'top-banner' | 'in-content' | 'sidebar' | 'bottom' | 'game-over' | 'reward'

interface AdPlaceholderProps {
  position: AdPosition
}

const positionStyles: Record<AdPosition, string> = {
  'top-banner': 'w-full min-h-[90px]',
  'in-content': 'w-full min-h-[120px]',
  sidebar: 'min-h-[250px] w-full',
  bottom: 'w-full min-h-[90px]',
  'game-over': 'min-h-[200px] w-full max-w-sm',
  reward: 'min-h-[200px] w-full max-w-sm',
}

export default function AdPlaceholder({ position }: AdPlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 ${positionStyles[position]}`}
    >
      廣告區塊預留位置
    </div>
  )
}
