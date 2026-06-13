'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQRCodeGenerator, type QRType } from '@/hooks/useQRCodeGenerator'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PrimaryButton from '@/components/ui/PrimaryButton'
import SecondaryButton from '@/components/ui/SecondaryButton'

const QR_TYPES: { value: QRType; label: string }[] = [
  { value: 'url', label: '網址 URL' },
  { value: 'text', label: '純文字' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: '電話' },
  { value: 'sms', label: '簡訊 SMS' },
  { value: 'line', label: 'LINE 連結' },
  { value: 'social', label: '社群連結' },
  { value: 'vcard', label: '名片 vCard' },
]

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'threads', label: 'Threads' },
  { value: 'custom', label: '自訂網址' },
]

export default function QRCodeGeneratorClient() {
  const {
    state,
    qrDataUrl,
    error,
    updateState,
    updateStyle,
    updateNested,
    generateQR,
    downloadPNG,
    reset,
  } = useQRCodeGenerator()

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!logoPreview) return
    const timer = setTimeout(() => URL.revokeObjectURL(logoPreview), 5000)
    return () => clearTimeout(timer)
  }, [logoPreview])

  const handleTypeChange = useCallback((type: QRType) => {
    updateState('type', type)
  }, [updateState])

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    try {
      await generateQR(logoFile)
    } finally {
      setIsGenerating(false)
    }
  }, [generateQR, logoFile])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }, [])

  const handleReset = useCallback(() => {
    reset()
    setLogoFile(null)
    setLogoPreview(null)
    setCopied(false)
  }, [reset])

  const handleCopy = useCallback(async () => {
    if (!qrDataUrl) return
    try {
      const resp = await fetch(qrDataUrl)
      const blob = await resp.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = qrDataUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [qrDataUrl])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerate()
    }, 500)
    return () => clearTimeout(timer)
  }, [state.type, state.url, state.text, state.wifi.ssid, state.wifi.encryption, state.wifi.password, state.email.email, state.email.subject, state.email.body, state.phone.number, state.sms.number, state.sms.message, state.line, state.social.url, state.vcard.name, state.vcard.phone, state.vcard.email, state.style.foregroundColor, state.style.backgroundColor, state.style.size, state.style.margin, state.style.transparentBg])

  function renderForm() {
    switch (state.type) {
      case 'url':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">網址</label>
            <input
              type="url"
              value={state.url}
              onChange={e => updateState('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        )
      case 'text':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">文字內容</label>
            <textarea
              value={state.text}
              onChange={e => updateState('text', e.target.value)}
              placeholder="請輸入文字..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        )
      case 'wifi':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Wi-Fi 名稱 (SSID)</label>
              <input
                type="text"
                value={state.wifi.ssid}
                onChange={e => updateNested('wifi', 'ssid', e.target.value)}
                placeholder="請輸入 Wi-Fi 名稱"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">加密方式</label>
              <select
                value={state.wifi.encryption}
                onChange={e => updateNested('wifi', 'encryption', e.target.value as 'WPA/WPA2' | 'WEP' | 'none')}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="WPA/WPA2">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="none">無密碼</option>
              </select>
            </div>
            {state.wifi.encryption !== 'none' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">密碼</label>
                <input
                  type="text"
                  value={state.wifi.password}
                  onChange={e => updateNested('wifi', 'password', e.target.value)}
                  placeholder="請輸入 Wi-Fi 密碼"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        )
      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={state.email.email}
                onChange={e => updateNested('email', 'email', e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">主旨</label>
              <input
                type="text"
                value={state.email.subject}
                onChange={e => updateNested('email', 'subject', e.target.value)}
                placeholder="Email 主旨"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">內容</label>
              <textarea
                value={state.email.body}
                onChange={e => updateNested('email', 'body', e.target.value)}
                placeholder="Email 內容"
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )
      case 'phone':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">電話號碼</label>
            <input
              type="tel"
              value={state.phone.number}
              onChange={e => updateNested('phone', 'number', e.target.value)}
              placeholder="+886912345678"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        )
      case 'sms':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">電話號碼</label>
              <input
                type="tel"
                value={state.sms.number}
                onChange={e => updateNested('sms', 'number', e.target.value)}
                placeholder="+886912345678"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">簡訊內容</label>
              <textarea
                value={state.sms.message}
                onChange={e => updateNested('sms', 'message', e.target.value)}
                placeholder="請輸入簡訊內容..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )
      case 'line':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">LINE 官方帳號或網址</label>
            <input
              type="text"
              value={state.line}
              onChange={e => updateState('line', e.target.value)}
              placeholder="https://line.me/R/ti/p/@xxx 或 @xxx"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        )
      case 'social':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">平台</label>
              <select
                value={state.social.platform}
                onChange={e => updateNested('social', 'platform', e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {SOCIAL_PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">連結網址</label>
              <input
                type="url"
                value={state.social.url}
                onChange={e => updateNested('social', 'url', e.target.value)}
                placeholder="https://instagram.com/your_account"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )
      case 'vcard':
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">姓名</label>
              <input
                type="text"
                value={state.vcard.name}
                onChange={e => updateNested('vcard', 'name', e.target.value)}
                placeholder="姓名"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">公司</label>
              <input
                type="text"
                value={state.vcard.company}
                onChange={e => updateNested('vcard', 'company', e.target.value)}
                placeholder="公司名稱"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">職稱</label>
              <input
                type="text"
                value={state.vcard.title}
                onChange={e => updateNested('vcard', 'title', e.target.value)}
                placeholder="職稱"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">電話</label>
              <input
                type="tel"
                value={state.vcard.phone}
                onChange={e => updateNested('vcard', 'phone', e.target.value)}
                placeholder="電話號碼"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={state.vcard.email}
                onChange={e => updateNested('vcard', 'email', e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">網站</label>
              <input
                type="url"
                value={state.vcard.website}
                onChange={e => updateNested('vcard', 'website', e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">地址</label>
              <input
                type="text"
                value={state.vcard.address}
                onChange={e => updateNested('vcard', 'address', e.target.value)}
                placeholder="地址"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">備註</label>
              <textarea
                value={state.vcard.note}
                onChange={e => updateNested('vcard', 'note', e.target.value)}
                placeholder="備註"
                rows={2}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">QR Code 類型</label>
            <select
              value={state.type}
              onChange={e => handleTypeChange(e.target.value as QRType)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              {QR_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {renderForm()}

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">樣式設定</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">前景顏色</label>
                <input
                  type="color"
                  value={state.style.foregroundColor}
                  onChange={e => updateStyle('foregroundColor', e.target.value)}
                  className="h-9 w-full cursor-pointer rounded border"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">背景顏色</label>
                <input
                  type="color"
                  value={state.style.backgroundColor}
                  onChange={e => updateStyle('backgroundColor', e.target.value)}
                  className="h-9 w-full cursor-pointer rounded border"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">尺寸</label>
                <select
                  value={state.style.size}
                  onChange={e => updateStyle('size', Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                >
                  <option value="150">150 x 150</option>
                  <option value="200">200 x 200</option>
                  <option value="300">300 x 300</option>
                  <option value="400">400 x 400</option>
                  <option value="500">500 x 500</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">邊距</label>
                <select
                  value={state.style.margin}
                  onChange={e => updateStyle('margin', Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                >
                  <option value="0">無邊距</option>
                  <option value="1">小</option>
                  <option value="2">中</option>
                  <option value="4">大</option>
                </select>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="transparentBg"
                checked={state.style.transparentBg}
                onChange={e => updateStyle('transparentBg', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="transparentBg" className="text-xs text-gray-600">透明背景</label>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Logo 設定</h3>
            <div>
              <label className="mb-1 block text-xs text-gray-600">上傳 Logo（支援 PNG、JPG、WebP）</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="w-full text-sm"
              />
              {logoPreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={logoPreview} alt="Logo 預覽" className="h-10 w-10 rounded border object-contain" />
                  <span className="text-xs text-gray-500">已上傳</span>
                </div>
              )}
              <p className="mt-1 text-xs text-amber-600">
                Logo 太大可能導致 QR Code 無法掃描，建議產生後用手機測試。
              </p>
            </div>
          </div>

          <PrimaryButton onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? '產生中...' : '產生 QR Code'}
          </PrimaryButton>
        </div>

        <div>
          <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {isGenerating ? (
              <div className="flex h-[300px] items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: Math.min(state.style.size, 300), height: Math.min(state.style.size, 300) }}
                className="rounded"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">
                <p className="text-center text-sm">請先輸入內容，系統會自動產生 QR Code。</p>
              </div>
            )}

            <p className="mt-2 text-xs text-amber-600">
              建議產生後使用手機掃描測試，確認 QR Code 可以正常開啟。
            </p>

            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}

            {qrDataUrl && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <PrimaryButton onClick={downloadPNG}>下載 PNG</PrimaryButton>
                <SecondaryButton onClick={handleCopy}>
                  {copied ? '已複製' : '複製圖片'}
                </SecondaryButton>
                <SecondaryButton onClick={handleReset}>清除重做</SecondaryButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">掃描可靠性提醒</p>
        <p className="mt-1">建議產生後使用手機掃描測試，確認 QR Code 可以正常開啟。如果掃描失敗，請調整顏色對比或縮小 Logo 尺寸後重新產生。</p>
      </div>
    </div>
  )
}
