import type { CompressionLevel, CompressionResult } from './types'
import { LEVEL_CONFIG } from './types'

export async function compressPdf(
  file: File,
  level: CompressionLevel
): Promise<CompressionResult> {
  const config = LEVEL_CONFIG[level]
  const arrayBuffer = await file.arrayBuffer()

  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise
  const totalPages = pdf.numPages

  const { PDFDocument } = await import('pdf-lib')
  const newPdf = await PDFDocument.create()

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: config.scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas, viewport }).promise

    const jpegData = canvas.toDataURL('image/jpeg', config.quality)
    const jpegBytes = dataUrlToBytes(jpegData)

    const image = await newPdf.embedJpg(jpegBytes)
    const pdfPage = newPdf.addPage([viewport.width, viewport.height])
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    })
  }

  const compressedBytes = await newPdf.save()
  const compressedBlob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' })

  const originalSize = file.size
  const compressedSize = compressedBlob.size
  const savingsBytes = originalSize - compressedSize
  const savingsPercent = originalSize > 0
    ? Math.round((savingsBytes / originalSize) * 100)
    : 0

  return {
    compressedSize,
    originalSize,
    compressedBlob,
    savingsPercent,
    savingsBytes,
    isReduced: compressedSize < originalSize,
    pagesProcessed: totalPages,
  }
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
