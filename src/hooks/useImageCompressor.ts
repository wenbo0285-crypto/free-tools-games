'use client'

import { useState, useCallback, useRef } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export type OutputFormat = 'jpeg' | 'png' | 'webp'

export type ResizeMode =
  | 'original'
  | 'width-1920'
  | 'width-1280'
  | 'width-1080'
  | 'width-800'
  | 'custom'

export interface CompressSettings {
  quality: number
  outputFormat: OutputFormat
  resizeMode: ResizeMode
  customWidth: number
  customHeight: number
}

export interface CompressedImage {
  id: string
  originalFile: File
  originalSize: number
  compressedBlob: Blob | null
  compressedSize: number | null
  originalWidth: number
  originalHeight: number
  compressedWidth: number | null
  compressedHeight: number | null
  status: 'pending' | 'processing' | 'done' | 'error'
  error?: string
  savingsPercent: number | null
  isLarger: boolean
  originalPreviewUrl: string
  compressedPreviewUrl: string | null
}

const DEFAULT_SETTINGS: CompressSettings = {
  quality: 80,
  outputFormat: 'jpeg',
  resizeMode: 'original',
  customWidth: 800,
  customHeight: 600,
}

const MAX_FILE_SIZE = 20 * 1024 * 1024
const MAX_FILE_COUNT = 20
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

let idCounter = 0

function generateId(): string {
  idCounter += 1
  return `img-${Date.now()}-${idCounter}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  mode: ResizeMode,
  customWidth: number,
  customHeight: number,
): { width: number; height: number } {
  let maxWidth: number | null = null
  let maxHeight: number | null = null

  switch (mode) {
    case 'original':
      return { width: originalWidth, height: originalHeight }
    case 'width-1920':
      maxWidth = 1920
      break
    case 'width-1280':
      maxWidth = 1280
      break
    case 'width-1080':
      maxWidth = 1080
      break
    case 'width-800':
      maxWidth = 800
      break
    case 'custom':
      if (customWidth > 0) maxWidth = customWidth
      if (customHeight > 0) maxHeight = customHeight
      break
  }

  let width = originalWidth
  let height = originalHeight

  if (maxWidth && width > maxWidth) {
    height = Math.round(height * (maxWidth / width))
    width = maxWidth
  }
  if (maxHeight && height > maxHeight) {
    width = Math.round(width * (maxHeight / height))
    height = maxHeight
  }

  return { width, height }
}

function compressImage(
  file: File,
  settings: CompressSettings,
  originalWidth: number,
  originalHeight: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      try {
        const actualWidth = img.width
        const actualHeight = img.height
        const { width, height } = getResizeDimensions(
          actualWidth,
          actualHeight,
          settings.resizeMode,
          settings.customWidth,
          settings.customHeight,
        )

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('無法初始化 Canvas'))
          return
        }

        let mimeType: string
        switch (settings.outputFormat) {
          case 'jpeg':
            mimeType = 'image/jpeg'
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, width, height)
            break
          case 'png':
            mimeType = 'image/png'
            break
          case 'webp':
            mimeType = 'image/webp'
            break
          default:
            mimeType = 'image/jpeg'
        }

        ctx.drawImage(img, 0, 0, width, height)

        const quality = settings.quality / 100

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('壓縮失敗，無法產生圖片'))
            }
          },
          mimeType,
          quality,
        )
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err instanceof Error ? err : new Error('壓縮過程發生錯誤'))
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('圖片讀取失敗，請確認檔案是否損毀'))
    }

    img.src = url
  })
}

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('無法讀取圖片資訊'))
    }
    img.src = url
  })
}

export function useImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([])
  const [settings, setSettings] = useState<CompressSettings>(DEFAULT_SETTINGS)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const processingRef = useRef(false)

  const addImages = useCallback(async (files: File[]) => {
    setError(null)

    const validFiles: File[] = []
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
        setError(`「${file.name}」不是支援的圖片格式（JPG / PNG / WebP）`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`「${file.name}」超過 20MB 限制`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    const currentCount = images.length
    if (currentCount + validFiles.length > MAX_FILE_COUNT) {
      setError(`一次最多處理 ${MAX_FILE_COUNT} 張圖片（目前已有 ${currentCount} 張）`)
      return
    }

    const newImages: CompressedImage[] = []
    for (const file of validFiles) {
      try {
        const dims = await loadImageDimensions(file)
        newImages.push({
          id: generateId(),
          originalFile: file,
          originalSize: file.size,
          compressedBlob: null,
          compressedSize: null,
          originalWidth: dims.width,
          originalHeight: dims.height,
          compressedWidth: null,
          compressedHeight: null,
          status: 'pending',
          savingsPercent: null,
          isLarger: false,
          originalPreviewUrl: URL.createObjectURL(file),
          compressedPreviewUrl: null,
        })
      } catch {
        setError(`「${file.name}」讀取失敗，已跳過`)
      }
    }

    setImages((prev) => [...prev, ...newImages])
  }, [images.length])

  const compressSingle = useCallback(
    async (id: string) => {
      const item = images.find((img) => img.id === id)
      if (!item || item.status === 'processing') return

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'processing' as const } : img,
        ),
      )

      try {
        const dims = await loadImageDimensions(item.originalFile)
        const blob = await compressImage(item.originalFile, settings, dims.width, dims.height)
        const { width, height } = getResizeDimensions(
          dims.width,
          dims.height,
          settings.resizeMode,
          settings.customWidth,
          settings.customHeight,
        )

        const compressedSize = blob.size
        const savingsPercent = item.originalSize > 0
          ? Math.round(((item.originalSize - compressedSize) / item.originalSize) * 100)
          : 0
        const isLarger = compressedSize >= item.originalSize

        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  compressedBlob: blob,
                  compressedSize,
                  compressedWidth: width,
                  compressedHeight: height,
                  status: 'done' as const,
                  savingsPercent,
                  isLarger,
                  compressedPreviewUrl: URL.createObjectURL(blob),
                }
              : img,
          ),
        )
      } catch (err) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'error' as const,
                  error: err instanceof Error ? err.message : '壓縮失敗',
                }
              : img,
          ),
        )
      }
    },
    [images, settings],
  )

  const compressAll = useCallback(async () => {
    if (processingRef.current) return
    processingRef.current = true
    setIsProcessing(true)
    setError(null)

    for (const img of images) {
      if (img.status === 'done' || img.status === 'processing') continue
      await compressSingle(img.id)
    }

    processingRef.current = false
    setIsProcessing(false)
  }, [images, compressSingle])

  const downloadSingle = useCallback((id: string) => {
    const item = images.find((img) => img.id === id)
    if (!item?.compressedBlob) return

    const ext = settings.outputFormat === 'jpeg' ? 'jpg' : settings.outputFormat
    const originalName = item.originalFile.name.replace(/\.[^.]+$/, '')
    const fileName = `${originalName}-compressed.${ext}`

    saveAs(item.compressedBlob, fileName)
  }, [images, settings.outputFormat])

  const downloadAllZip = useCallback(async () => {
    const doneImages = images.filter((img) => img.status === 'done' && img.compressedBlob)
    if (doneImages.length === 0) return

    try {
      const zip = new JSZip()
      const ext = settings.outputFormat === 'jpeg' ? 'jpg' : settings.outputFormat

      for (const img of doneImages) {
        const originalName = img.originalFile.name.replace(/\.[^.]+$/, '')
        const fileName = `${originalName}-compressed.${ext}`
        const blob = img.compressedBlob as Blob
        const buffer = await blob.arrayBuffer()
        zip.file(fileName, buffer)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, 'compressed-images.zip')
    } catch {
      setError('ZIP 檔案產生失敗，請稍後再試')
    }
  }, [images, settings.outputFormat])

  const clearAll = useCallback(() => {
    for (const img of images) {
      URL.revokeObjectURL(img.originalPreviewUrl)
      if (img.compressedPreviewUrl) URL.revokeObjectURL(img.compressedPreviewUrl)
    }
    setImages([])
    setError(null)
  }, [images])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id)
      if (item) {
        URL.revokeObjectURL(item.originalPreviewUrl)
        if (item.compressedPreviewUrl) URL.revokeObjectURL(item.compressedPreviewUrl)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = images
    .filter((img) => img.status === 'done' && img.compressedSize !== null)
    .reduce((sum, img) => sum + (img.compressedSize ?? 0), 0)

  const doneCount = images.filter((img) => img.status === 'done').length
  const pendingCount = images.filter((img) => img.status === 'pending').length
  const errorCount = images.filter((img) => img.status === 'error').length

  return {
    images,
    settings,
    setSettings,
    isProcessing,
    error,
    setError,
    addImages,
    compressAll,
    compressSingle,
    downloadSingle,
    downloadAllZip,
    clearAll,
    removeImage,
    totalOriginalSize,
    totalCompressedSize,
    doneCount,
    pendingCount,
    errorCount,
    formatFileSize,
  }
}
