export type CompressionLevel = 'light' | 'standard' | 'heavy'

export interface CompressionResult {
  compressedSize: number
  originalSize: number
  compressedBlob: Blob
  savingsPercent: number
  savingsBytes: number
  isReduced: boolean
  pagesProcessed: number
}

export interface PdfFileInfo {
  file: File
  name: string
  size: number
  pages: number
}

export type CompressorStatus =
  | 'idle'
  | 'loading'
  | 'compressing'
  | 'done'
  | 'error'

export const SIZE_LIMIT = 50 * 1024 * 1024 // 50MB

export const LEVEL_CONFIG: Record<CompressionLevel, {
  label: string
  description: string
  scale: number
  quality: number
}> = {
  light: {
    label: '輕度壓縮',
    description: '優先保留品質，適合正式文件',
    scale: 1.5,
    quality: 0.85,
  },
  standard: {
    label: '標準壓縮',
    description: '平衡品質與檔案大小，適合一般上傳',
    scale: 1.0,
    quality: 0.6,
  },
  heavy: {
    label: '強力壓縮',
    description: '盡量降低檔案大小，可能影響清晰度',
    scale: 0.5,
    quality: 0.3,
  },
}
