import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { SeoH1, SeoH2 } from '@/components/ui/SEOContentSection'

export const metadata: Metadata = {
  title: '服務條款',
  description: '免費工具與小遊戲網站的服務條款，使用本網站前請詳細閱讀相關條款。',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '服務條款' },
      ]} />

      <SeoH1>服務條款</SeoH1>

      <div className="prose prose-gray max-w-none leading-relaxed text-gray-600">
        <p>歡迎使用「免費工具與小遊戲」（以下簡稱本網站）。使用本網站即表示您同意以下條款。</p>

        <SeoH2>一、服務說明</SeoH2>
        <p>本網站提供免費的線上工具與網頁小遊戲。所有工具均以「現狀」提供，我們不保證其準確性或適用性。</p>

        <SeoH2>二、使用限制</SeoH2>
        <ul className="list-inside list-disc space-y-1">
          <li>您不得使用本網站的工具從事任何非法活動</li>
          <li>您不得試圖破壞或干擾本網站的正常運作</li>
          <li>本網站的工具僅供個人使用，不得用於商業用途</li>
        </ul>

        <SeoH2>三、免責聲明</SeoH2>
        <p>本網站的工具和遊戲僅供參考和娛樂用途。我們不對以下情況承擔責任：</p>
        <ul className="list-inside list-disc space-y-1">
          <li>工具使用結果的準確性</li>
          <li>因使用工具造成的任何直接或間接損失</li>
          <li>服務中斷或暫停</li>
        </ul>

        <SeoH2>四、智慧財產權</SeoH2>
        <p>本網站的原始碼、設計、內容均受版權保護。未經授權不得複製或修改。</p>

        <SeoH2>五、條款變更</SeoH2>
        <p>我們保留隨時修改本服務條款的權利。變更後繼續使用本網站即表示您接受修改後的條款。</p>

        <SeoH2>六、聯絡我們</SeoH2>
        <p>如果您對本服務條款有任何疑問，請透過<a href="/contact" className="text-blue-600 hover:text-blue-700">聯絡我們</a>頁面與我們聯繫。</p>
      </div>
    </div>
  )
}
