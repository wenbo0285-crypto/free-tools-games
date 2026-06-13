import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import { SeoH1, SeoContentSection, FaqSection, StepList } from '@/components/ui/SEOContentSection'
import PdfCompressorClient from './PdfCompressorClient'

export const metadata: Metadata = {
  title: 'PDF 壓縮工具 | 免費工具與小遊戲',
  description: '免費線上 PDF 壓縮工具，在瀏覽器端壓縮 PDF 檔案，減少檔案體積，所有處理都在本地完成，不上傳伺服器。',
}

export default function PdfCompressorPage() {
  const steps = [
    '點擊或拖曳上傳 PDF 檔案',
    '選擇壓縮等級（輕度 / 標準 / 強力）',
    '點擊「開始壓縮」按鈕開始壓縮',
    '下載壓縮後的 PDF 檔案',
  ]

  const faqItems = [
    {
      question: 'PDF 壓縮後會影響內容嗎？',
      answer: '壓縮主要透過降低圖片品質和解析度來減少檔案大小，文字型 PDF 在輕度壓縮模式下影響較小，強力壓縮可能會將文字轉為圖片。',
    },
    {
      question: '我的 PDF 檔案安全嗎？',
      answer: '非常安全。所有 PDF 處理都在你的瀏覽器中完成，檔案不會上傳到任何伺服器，請放心使用。',
    },
    {
      question: '有檔案大小限制嗎？',
      answer: '免費版支援 50MB 以下的 PDF。如果瀏覽器記憶體不足，建議嘗試較小的 PDF 或使用較低壓縮等級。',
    },
    {
      question: '為什麼壓縮後檔案反而變大？',
      answer: '部分 PDF 已經過壓縮，或是內容以文字為主，這種情況下壓縮效果有限。如果壓縮後檔案沒有變小，建議保留原始檔案。',
    },
    {
      question: '三種壓縮模式有什麼差別？',
      answer: '輕度壓縮保留較高圖片品質（85% 品質、1.5 倍渲染），適合正式文件；標準壓縮平衡品質與大小（60% 品質），適合一般上傳；強力壓縮最大限度減少檔案體積（30% 品質、0.5 倍渲染），但可能影響清晰度。',
    },
    {
      question: '文字型 PDF 壓縮後會怎樣？',
      answer: '強力壓縮模式下，文字型 PDF 可能會被轉換成圖片，導致文字搜尋與複製功能受影響。建議文字型 PDF 使用輕度或標準壓縮模式以保留文字資訊。',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '免費工具', href: '/tools' },
        { label: 'PDF 壓縮工具' },
      ]} />

      <SeoH1>PDF 壓縮工具</SeoH1>
      <p className="mt-2 text-sm text-gray-500">
        免費線上壓縮 PDF，降低檔案大小，適合 Email、表單上傳與文件備份。
      </p>

      <AdPlaceholder position="top-banner" />

      <section className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <PdfCompressorClient />
      </section>

      <AdPlaceholder position="in-content" />

      <SeoContentSection title="使用教學">
        <StepList steps={steps} />
      </SeoContentSection>

      <SeoContentSection title="為什麼選擇我們的 PDF 壓縮工具？">
        <p>
          我們的 PDF 壓縮工具完全在瀏覽器端運作，保護你的檔案隱私。不需要註冊帳號，
          不需要上傳到伺服器，所有壓縮處理都在你的電腦上完成。提供三種壓縮模式，
          滿足不同需求。有效減少 PDF 檔案體積，方便郵件寄送或節省儲存空間。
        </p>
      </SeoContentSection>

      <FaqSection items={faqItems} />

      <AdPlaceholder position="bottom" />
    </div>
  )
}
