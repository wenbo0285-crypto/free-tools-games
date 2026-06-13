export interface Tool {
  id: string
  name: string
  description: string
  href: string
  icon: string
}

export const tools: Tool[] = [
  {
    id: 'image-compressor',
    name: '圖片壓縮工具',
    description: '在瀏覽器端壓縮 JPEG、PNG、WebP 圖片，壓縮過程不上傳伺服器，保護您的隱私。',
    href: '/tools/image-compressor',
    icon: '🖼️',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code 產生器',
    description: '免費線上產生 QR Code 條碼，支援網址、文字、電話號碼等多種格式，可直接下載。',
    href: '/tools/qr-code-generator',
    icon: '📱',
  },
  {
    id: 'pdf-compressor',
    name: 'PDF 壓縮工具',
    description: '在瀏覽器端壓縮 PDF 檔案，減少檔案體積，所有處理都在本地完成。',
    href: '/tools/pdf-compressor',
    icon: '📄',
  },
]
