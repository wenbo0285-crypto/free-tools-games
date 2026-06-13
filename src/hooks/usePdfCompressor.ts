'use client'

import { useState, useCallback } from 'react'
import type { CompressionLevel, CompressionResult, PdfFileInfo, CompressorStatus } from '@/lib/pdf-compressor/types'
import { SIZE_LIMIT } from '@/lib/pdf-compressor/types'
import { compressPdf } from '@/lib/pdf-compressor/compress'

export function usePdfCompressor() {
  const [fileInfo, setFileInfo] = useState<PdfFileInfo | null>(null)
  const [level, setLevel] = useState<CompressionLevel>('standard')
  const [status, setStatus] = useState<CompressorStatus>('idle')
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const selectFile = useCallback((file: File) => {
    setErrorMsg('')
    setResult(null)

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('只接受 PDF 格式的檔案')
      return
    }

    if (file.size > SIZE_LIMIT) {
      setErrorMsg('檔案超過 50MB 限制，請選擇較小的檔案')
      return
    }

    const info: PdfFileInfo = {
      file,
      name: file.name,
      size: file.size,
      pages: 0,
    }
    setFileInfo(info)
    setStatus('idle')
  }, [])

  const clearFile = useCallback(() => {
    setFileInfo(null)
    setResult(null)
    setStatus('idle')
    setErrorMsg('')
  }, [])

  const startCompress = useCallback(async () => {
    if (!fileInfo) return

    setStatus('compressing')
    setErrorMsg('')
    setResult(null)

    try {
      const result = await compressPdf(fileInfo.file, level)
      setResult(result)
      setStatus('done')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '壓縮失敗'
      if (msg.includes('memory') || msg.includes('Memory')) {
        setErrorMsg('瀏覽器記憶體不足，請嘗試較小的 PDF 或改用較低壓縮等級')
      } else {
        setErrorMsg(`壓縮失敗：${msg}`)
      }
      setStatus('error')
    }
  }, [fileInfo, level])

  const downloadResult = useCallback(() => {
    if (!result || !fileInfo) return
    const url = URL.createObjectURL(result.compressedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed_${fileInfo.name}`
    a.click()
    URL.revokeObjectURL(url)
  }, [result, fileInfo])

  return {
    fileInfo, level, status, result, errorMsg,
    selectFile, clearFile, setLevel, startCompress, downloadResult,
  }
}
