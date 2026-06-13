import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import AdPlaceholder from '@/components/ui/AdPlaceholder'
import QRCodeGeneratorClient from './QRCodeGeneratorClient'
import { SeoContentSection, FaqSection } from '@/components/ui/SEOContentSection'

export const metadata: Metadata = {
  title: 'QR Code 產生器',
  description: '免費線上 QR Code 產生器，支援網址、Wi-Fi、名片、社群連結等多種格式，可自訂顏色與 Logo，產生後可下載 PNG 圖片。',
}

const faqItems = [
  {
    question: 'QR Code 是免費的嗎？',
    answer: '是的，完全免費。您不需要註冊或付費，所有功能都可以在瀏覽器中免費使用。',
  },
  {
    question: '產生的 QR Code 會過期嗎？',
    answer: '不會。QR Code 一旦產生就永久有效，只要您掃描的目標網址或內容沒有變更，QR Code 就不會失效。',
  },
  {
    question: '可以放自己的 Logo 嗎？',
    answer: '可以。您可以在 QR Code 中間上傳自己的 Logo 圖片，支援 PNG、JPG、WebP 格式。建議 Logo 不要太大，以免影響掃描。',
  },
  {
    question: '可以產生 Wi-Fi QR Code 嗎？',
    answer: '可以。選擇 Wi-Fi 類型，輸入 SSID 與密碼，即可產生 Wi-Fi QR Code。手機掃描後可直接連線，無需手動輸入密碼。',
  },
  {
    question: '可以下載透明背景嗎？',
    answer: '可以。在樣式設定中將背景顏色設為透明，下載 PNG 格式即可保留透明背景。',
  },
  {
    question: '為什麼 QR Code 掃不出來？',
    answer: '可能原因包括：顏色對比不夠明顯、Logo 太大遮蓋太多區域、邊距不足、QR Code 印刷尺寸太小。建議使用深色前景與淺色背景，Logo 保持在 QR Code 面積的 20% 以內。',
  },
  {
    question: '商業用途可以使用嗎？',
    answer: '可以。產生的 QR Code 可用於商業用途，包括名片、海報、菜單、產品包裝等，無任何使用限制。',
  },
]

export default function QRCodeGeneratorPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '免費工具', href: '/tools' },
        { label: 'QR Code 產生器' },
      ]} />

      <h1 className="mb-2 text-3xl font-bold text-gray-900">QR Code 產生器</h1>
      <p className="mb-6 text-gray-600">
        免費產生網址、Wi-Fi、名片、社群連結 QR Code，可下載 PNG 圖片。
      </p>

      <AdPlaceholder position="top-banner" />

      <QRCodeGeneratorClient />

      <AdPlaceholder position="in-content" />

      <SeoContentSection title="QR Code 產生器可以做什麼？">
        <ul className="list-inside list-disc space-y-1">
          <li>網址轉 QR Code，快速分享連結</li>
          <li>Wi-Fi 密碼分享，手機一掃即連</li>
          <li>名片 vCard QR Code，快速儲存聯絡人</li>
          <li>社群連結 QR Code，導流到 Instagram、Facebook、LINE</li>
          <li>店家菜單 QR Code，手機點餐更方便</li>
        </ul>
      </SeoContentSection>

      <SeoContentSection title="QR Code 可以用在哪裡？">
        <ul className="list-inside list-disc space-y-1">
          <li>店面展示：張貼 QR Code 讓顧客掃描瀏覽網站或菜單</li>
          <li>名片：將 vCard QR Code 印在名片上，方便交換聯絡資訊</li>
          <li>傳單海報：掃描直達活動報名頁面或官方網站</li>
          <li>菜單：餐廳可將 QR Code 貼在桌上，掃描即看電子菜單</li>
          <li>活動報名：將報名連結轉為 QR Code，參加者掃描即可填寫</li>
          <li>Google 評論：一鍵引導顧客到 Google 評論頁面</li>
          <li>社群導流：引導粉絲到 Instagram、Facebook、LINE 官方帳號</li>
        </ul>
      </SeoContentSection>

      <SeoContentSection title="如何讓 QR Code 比較容易掃描？">
        <ul className="list-inside list-disc space-y-1">
          <li>顏色對比要明顯：使用深色前景與淺色背景，避免相近色系</li>
          <li>Logo 不要太大：Logo 面積建議不超過 QR Code 總面積的 20%</li>
          <li>保留邊距：QR Code 周圍至少保留一個模組單位的白邊</li>
          <li>印刷前先測試：大量印製前務必先用手機掃描測試</li>
        </ul>
      </SeoContentSection>

      <FaqSection items={faqItems} />

      <AdPlaceholder position="bottom" />
    </div>
  )
}
