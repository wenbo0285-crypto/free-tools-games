import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import { SeoH1, SeoContentSection, FaqSection, StepList } from '@/components/ui/SEOContentSection'
import Match3Client from './Match3Client'

export const metadata: Metadata = {
  title: '貓貓連線 | 免費工具與小遊戲',
  description: '胖胖貓咪連線消除，輕鬆療癒又紓壓。交換相鄰貓咪達成三消，連線越多分數越高！',
}

export default function Match3Page() {
  const steps = [
    '點擊兩個相鄰的貓咪進行交換',
    '三個或以上相同貓咪連成一線即可消除',
    '消除後上方貓咪會掉落並補充新貓咪',
    '連續消除可獲得 combo 加分',
    '連線 4 個以上可產生特殊效果貓咪！',
  ]

  const faqItems = [
    {
      question: '三消遊戲需要網路嗎？',
      answer: '不需要。遊戲完全在瀏覽器中執行，離線也可遊玩。',
    },
    {
      question: '遊戲有幾關？',
      answer: '遊戲採用最高分模式，每局 30 步，步數用完即 game over，可不斷挑戰自己的最高分！',
    },
    {
      question: '步數用完會怎樣？',
      answer: '當步數歸零時遊戲結束，會顯示本局分數並自動保存最高分到瀏覽器中。',
    },
    {
      question: '貓貓連線跟一般三消有什麼不同？',
      answer: '我們使用可愛的 Q 版貓咪作為遊戲圖案，比傳統水果三消更具特色，連線 4 個以上還能產生特殊效果方塊！',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '免費小遊戲', href: '/games' },
        { label: '三消遊戲' },
      ]} />

      <SeoH1>貓貓連線</SeoH1>

      <AdPlaceholder position="top-banner" />

      <section className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Match3Client />
      </section>

      <AdPlaceholder position="in-content" />

      <SeoContentSection title="遊戲玩法">
        <StepList steps={steps} />
      </SeoContentSection>

      <SeoContentSection title="為什麼要玩貓貓連線？">
        <p>
          三消遊戲是經典的益智遊戲類型，透過交換貓咪達成消除，簡單易懂卻富有挑戰性。
          每局 30 步的限制讓每一步都至關重要，連鎖消除更是逆轉分數的關鍵！
          連線 4 個以上貓咪可產生特殊效果方塊，讓遊戲更加刺激！
        </p>
      </SeoContentSection>

      <FaqSection items={faqItems} />

      <AdPlaceholder position="bottom" />
    </div>
  )
}
