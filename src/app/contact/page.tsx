import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { SeoH1, SeoH2 } from '@/components/ui/SEOContentSection'

export const metadata: Metadata = {
  title: '聯絡我們',
  description: '如有任何問題或建議，歡迎透過聯絡表單與我們聯繫。',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[
        { label: '首頁', href: '/' },
        { label: '聯絡我們' },
      ]} />

      <SeoH1>聯絡我們</SeoH1>
      <p className="mb-8 text-gray-600">如果您有任何問題、建議或合作提案，歡迎填寫以下表單與我們聯繫。</p>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">姓名</label>
            <input
              type="text"
              id="name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="請輸入您的姓名"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">電子郵件</label>
            <input
              type="email"
              id="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="請輸入您的電子郵件"
            />
          </div>
          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">主旨</label>
            <input
              type="text"
              id="subject"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="請輸入主旨"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">訊息</label>
            <textarea
              id="message"
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="請輸入您的訊息"
            />
          </div>
          <div className="flex justify-center">
            <PrimaryButton type="submit">送出訊息</PrimaryButton>
          </div>
        </form>
      </section>

      <SeoH2>其他聯絡方式</SeoH2>
      <p className="text-gray-600">您也可以透過以下方式與我們聯繫：</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
        <li>電子郵件：contact@example.com</li>
      </ul>
    </div>
  )
}
