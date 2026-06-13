export interface Game {
  id: string
  name: string
  description: string
  href: string
  icon: string
}

export const games: Game[] = [
  {
    id: 'block-puzzle',
    name: '方塊拼圖',
    description: '經典方塊拼圖遊戲，拖曳方塊放入網格中，挑戰你的空間邏輯能力。',
    href: '/games/block-puzzle',
    icon: '🧩',
  },
  {
    id: 'match-3',
    name: '三消遊戲',
    description: '經典三消玩法，交換相鄰方塊達成三個以上連線，消除越多分數越高。',
    href: '/games/match-3',
    icon: '💎',
  },
]
