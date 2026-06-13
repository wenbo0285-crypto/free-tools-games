'use client'

import { useRef } from 'react'
import { usePdfCompressor } from '@/hooks/usePdfCompressor'
import { LEVEL_CONFIG } from '@/lib/pdf-compressor/types'
import type { CompressionLevel } from '@/lib/pdf-compressor/types'

export default function PdfCompressorClient() {
  const {
    fileInfo, level, status, result, errorMsg,
    selectFile, clearFile, setLevel, startCompress, downloadResult,
  } = usePdfCompressor()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) selectFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) selectFile(f)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const formatBytes = (b: number) => {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  const isProcessing = status === 'loading' || status === 'compressing'

  return (
    <div className="space-y-6">
      {/* Privacy notice */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
        檔案會在瀏覽器中處理，不會上傳到任何伺服器，請放心使用。
      </div>

      {/* File upload / info */}
      {!fileInfo ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-sm font-medium text-gray-600">拖曳 PDF 到這裡，或點擊選取檔案</p>
          <p className="mt-1 text-xs text-gray-400">支援 PDF 格式，最大 50MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{fileInfo.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(fileInfo.size)}</p>
              </div>
            </div>
            <button
              onClick={clearFile}
              disabled={isProcessing}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              清除
            </button>
          </div>
        </div>
      )}

      {/* Compression level */}
      {fileInfo && !isProcessing && status !== 'done' && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">壓縮模式</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.entries(LEVEL_CONFIG) as [CompressionLevel, typeof LEVEL_CONFIG[CompressionLevel]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setLevel(key)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  level === key
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">{cfg.label}</div>
                <div className="mt-1 text-xs text-gray-500">{cfg.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compress button */}
      {fileInfo && status !== 'done' && (
        <div className="flex justify-center">
          <button
            onClick={startCompress}
            disabled={isProcessing}
            className="rounded-xl bg-indigo-600 px-10 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? '壓縮中...' : '開始壓縮'}
          </button>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-300 border-t-indigo-600" />
          <p className="text-sm text-gray-500">正在壓縮 PDF，請稍候...</p>
          {fileInfo && fileInfo.pages > 20 && (
            <p className="text-xs text-amber-600">頁數較多，處理可能需要一些時間</p>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">壓縮結果</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xs text-gray-500">原始大小</div>
              <div className="mt-1 text-lg font-bold text-gray-900">{formatBytes(result.originalSize)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xs text-gray-500">壓縮後</div>
              <div className="mt-1 text-lg font-bold text-gray-900">{formatBytes(result.compressedSize)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xs text-gray-500">節省</div>
              <div className={`mt-1 text-lg font-bold ${result.isReduced ? 'text-green-600' : 'text-red-500'}`}>
                {result.isReduced ? formatBytes(result.savingsBytes) : '0 B'}
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xs text-gray-500">節省比例</div>
              <div className={`mt-1 text-lg font-bold ${result.isReduced ? 'text-green-600' : 'text-red-500'}`}>
                {result.isReduced ? `${result.savingsPercent}%` : '0%'}
              </div>
            </div>
          </div>

          {!result.isReduced && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              壓縮後檔案沒有變小，建議保留原始檔案。
            </div>
          )}

          {result.isReduced && result.savingsPercent < 5 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              壓縮幅度有限，此 PDF 可能已經過壓縮或是文字型 PDF。
            </div>
          )}

          {level === 'heavy' && (
            <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800">
              強力壓縮可能將文字型 PDF 轉成圖片，文字搜尋與複製功能可能受到影響。
            </div>
          )}

          <div className="mt-5 flex justify-center">
            <button
              onClick={downloadResult}
              className="rounded-xl bg-indigo-600 px-10 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              下載壓縮後 PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
