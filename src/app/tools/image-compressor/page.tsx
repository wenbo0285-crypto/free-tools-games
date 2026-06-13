import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import ImageCompressorClient from './ImageCompressorClient'
import { SeoContentSection, FaqSection, StepList } from '@/components/ui/SEOContentSection'

export const metadata: Metadata = {
  title: '圖片壓縮工具',
  description: '免費線上圖片壓縮工具，支援 JPG、PNG、WebP 格式壓縮與格式轉換，可調整品質與尺寸，所有處理都在瀏覽器端完成，不上傳伺服器。',
}

const steps = [
  '點擊或拖曳上傳圖片檔案（支援 JPG、PNG、WebP 格式）',
  '調整壓縮品質、輸出格式、尺寸設定',
  '點擊「開始壓縮」一鍵處理所有圖片',
  '預覽壓縮前後對比，確認品質',
  '單張下載或點擊「下載全部 ZIP」批次下載',
]

const faqItems = [
  {
    question: '圖片會被上傳到伺服器嗎？',
    answer: '不會。所有圖片處理都在您的瀏覽器中完成，檔案不會上傳到任何伺服器，請安心使用。',
  },
  {
    question: '手機照片可以壓縮嗎？',
    answer: '可以。您可以直接從手機相簿選擇照片上傳，支援 JPG 與 WebP 格式，壓縮後可大幅減少照片檔案大小。',
  },
  {
    question: '可以批次壓縮圖片嗎？',
    answer: '可以。一次最多可上傳 20 張圖片，上傳後可一鍵全部壓縮，並可批次下載 ZIP 壓縮檔。',
  },
  {
    question: 'JPG 可以轉 WebP 嗎？',
    answer: '可以。在輸出格式中選擇 WebP，即可將 JPG 或 PNG 圖片轉換為 WebP 格式，通常可以獲得更小的檔案大小。',
  },
  {
    question: 'PNG 透明背景會保留嗎？',
    answer: '輸出格式選擇 PNG 時會保留透明背景。若選擇 JPG 輸出，透明背景會被白色填滿。',
  },
  {
    question: '壓縮後圖片變模糊怎麼辦？',
    answer: '請提高壓縮品質數值（建議 80% 以上），或選擇「保持原尺寸」避免縮小解析度。',
  },
  {
    question: '為什麼壓縮後檔案沒有變小？',
    answer: '少數圖片（如已高度壓縮的 JPEG）壓縮後可能無法再縮小，我們的工具會自動標示此情況，建議使用原圖或更換輸出格式。',
  },
]

export default function ImageCompressorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '免費工具', href: '/tools' },
        { label: '圖片壓縮工具' },
      ]} />

      <h1 className="mb-2 text-3xl font-bold text-gray-900">圖片壓縮工具</h1>
      <p className="mb-6 text-gray-600">
        免費壓縮 JPG、PNG、WebP 圖片，降低檔案大小，保留清晰畫質。
      </p>

      <AdPlaceholder position="top-banner" />

      <ImageCompressorClient />

      <AdPlaceholder position="in-content" />

      <SeoContentSection title="圖片壓縮工具可以做什麼？">
        <ul className="list-inside list-disc space-y-1">
          <li>降低圖片檔案大小，節省儲存空間</li>
          <li>加快網站載入速度，提升 SEO 表現</li>
          <li>方便 Email、LINE、表單上傳（解決檔案太大無法附件的問題）</li>
          <li>適合 JPG、PNG、WebP 三種常見格式</li>
        </ul>
      </SeoContentSection>

      <SeoContentSection title="JPG、PNG、WebP 有什麼差別？">
        <ul className="list-inside list-disc space-y-1">
          <li><strong>JPG</strong>：適合照片與漸層豐富的圖片，檔案較小，但不支援透明背景</li>
          <li><strong>PNG</strong>：適合透明背景與螢幕截圖，無失真壓縮，但檔案較大</li>
          <li><strong>WebP</strong>：適合網站圖片，檔案通常比 JPG 更小，同時支援透明背景</li>
        </ul>
      </SeoContentSection>

      <SeoContentSection title="圖片壓縮會影響畫質嗎？">
        <p>
          品質越低，檔案越小。80% 通常是畫質與檔案大小的最佳平衡點。
          您可以在壓縮後透過預覽功能比較壓縮前後的差異，確保品質符合需求。
        </p>
      </SeoContentSection>

      <SeoContentSection title="使用教學">
        <StepList steps={steps} />
      </SeoContentSection>

      <FaqSection items={faqItems} />

      <AdPlaceholder position="bottom" />
    </div>
  )
}
