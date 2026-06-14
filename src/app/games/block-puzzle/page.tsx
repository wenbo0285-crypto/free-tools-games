import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import BlockPuzzleClient from './BlockPuzzleClient'
import { SeoContentSection, FaqSection } from '@/components/ui/SEOContentSection'

export const metadata: Metadata = {
  title: '方塊拼圖',
  description: '免費線上 8x8 方塊拼圖遊戲，拖曳方塊填滿橫列或直列消除得分，挑戰你的最高分！手機與電腦都能玩，不用下載。',
}

const faqItems = [
  {
    question: '方塊拼圖可以免費玩嗎？',
    answer: '可以，完全免費。不需要註冊或付費，開啟網頁即可遊玩。',
  },
  {
    question: '手機可以玩嗎？',
    answer: '可以。手機版支援手指拖曳放置方塊，棋盤格有針對觸控優化，操作順手。',
  },
  {
    question: '分數會保存嗎？',
    answer: '會。您的最高分會自動保存在瀏覽器中，關閉網頁後再次開啟仍會保留。',
  },
  {
    question: '要登入嗎？',
    answer: '不需要。遊戲完全在瀏覽器中執行，無須註冊或登入。',
  },
  {
    question: '遊戲規則是什麼？',
    answer: '將方塊拖曳到 8x8 棋盤上，填滿橫列或直列即可消除得分。一次消除越多列分數越高。當三個方塊都無法放置時遊戲結束。',
  },
  {
    question: '怎麼獲得高分？',
    answer: '盡量保留大空間，不要把棋盤切太碎，優先消除多條線，注意三個方塊的擺放順序以製造連續消除。',
  },
]

export default function BlockPuzzlePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '免費遊戲', href: '/games' },
        { label: '方塊拼圖' },
      ]} />

      <h1 className="mb-2 text-3xl font-bold text-gray-900">方塊拼圖</h1>
      <p className="mb-6 text-gray-600">
        拖曳方塊填滿橫列或直列，挑戰你的最高分！
      </p>

      <AdPlaceholder position="top-banner" />

      <BlockPuzzleClient />

      <SeoContentSection title="方塊拼圖怎麼玩？">
        <ul className="list-inside list-disc space-y-1">
          <li>拖曳方塊到 8x8 棋盤上</li>
          <li>填滿橫列或直列即可消除</li>
          <li>一次消除越多列分數越高</li>
          <li>沒有空間放置方塊時遊戲結束</li>
        </ul>
      </SeoContentSection>

      <SeoContentSection title="方塊拼圖遊戲特色">
        <ul className="list-inside list-disc space-y-1">
          <li>免費遊玩，不用下載</li>
          <li>手機和電腦都能玩</li>
          <li>適合短時間放鬆</li>
          <li>可以挑戰最高分</li>
        </ul>
      </SeoContentSection>

      <SeoContentSection title="高分技巧">
        <ul className="list-inside list-disc space-y-1">
          <li>盡量保留大空間</li>
          <li>不要把棋盤切太碎</li>
          <li>優先消除多條線</li>
          <li>注意三個方塊的擺放順序</li>
        </ul>
      </SeoContentSection>

      <AdPlaceholder position="bottom" />

      <FaqSection items={faqItems} />
    </div>
  )
}
