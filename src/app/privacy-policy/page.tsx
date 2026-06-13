import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { SeoH1, SeoH2 } from '@/components/ui/SEOContentSection'

export const metadata: Metadata = {
  title: '隱私政策',
  description: '免費工具與小遊戲網站的隱私政策，說明我們如何保護您的個人資料與隱私權。',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '隱私政策' },
      ]} />

      <SeoH1>隱私政策</SeoH1>

      <div className="prose prose-gray max-w-none leading-relaxed text-gray-600">
        <p>歡迎使用「免費工具與小遊戲」（以下簡稱本網站）。我們重視您的隱私權，因此制定了本隱私政策，說明我們如何收集、使用和保護您的資料。</p>

        <SeoH2>一、資料收集</SeoH2>
        <p>本網站大部分功能為純前端工具，您的檔案和資料會在瀏覽器中處理，不會上傳到我們的伺服器。我們僅收集以下基本資料：</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Google Analytics 等第三方服務提供的匿名瀏覽數據（頁面瀏覽次數、停留時間等）</li>
          <li>廣告服務所需的基礎資訊（裝置類型、瀏覽器版本等）</li>
        </ul>

        <SeoH2>二、資料使用</SeoH2>
        <p>我們收集的資料僅用於：</p>
        <ul className="list-inside list-disc space-y-1">
          <li>改善網站功能與使用者體驗</li>
          <li>分析網站流量與使用趨勢</li>
          <li>投放適當的廣告內容</li>
        </ul>

        <SeoH2>三、第三方服務</SeoH2>
        <p>本網站可能使用以下第三方服務：</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Google Analytics - 分析網站流量</li>
          <li>Google AdSense - 投放廣告（未來可能啟用）</li>
          <li>H5 Games Ads - 遊戲廣告（未來可能啟用）</li>
        </ul>

        <SeoH2>四、檔案處理</SeoH2>
        <p>當您使用圖片壓縮、PDF 壓縮等工具時，所有檔案處理均在您的瀏覽器中完成。我們的伺服器不會接收、儲存或處理您的檔案。</p>

        <SeoH2>五、Cookie</SeoH2>
        <p>本網站可能使用必要的 Cookie 以維持網站基本功能。廣告服務可能使用第三方 Cookie 來提供相關廣告。</p>

        <SeoH2>六、聯絡我們</SeoH2>
        <p>如果您對本隱私政策有任何疑問，請透過<a href="/contact" className="text-blue-600 hover:text-blue-700">聯絡我們</a>頁面與我們聯繫。</p>
      </div>
    </div>
  )
}
