'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useImageCompressor } from '@/hooks/useImageCompressor'
import FileDropZone from '@/components/ui/FileDropZone'
import PrimaryButton from '@/components/ui/PrimaryButton'
import SecondaryButton from '@/components/ui/SecondaryButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Toast from '@/components/ui/Toast'

const QUALITY_PRESETS = [
  { label: '高品質：90%', value: 90 },
  { label: '平衡：80%', value: 80 },
  { label: '小檔案：60%', value: 60 },
  { label: '極小檔案：40%', value: 40 },
]

const RESIZE_OPTIONS = [
  { label: '保持原尺寸', value: 'original' as const },
  { label: '最大寬度 1920px', value: 'width-1920' as const },
  { label: '最大寬度 1280px', value: 'width-1280' as const },
  { label: '最大寬度 1080px', value: 'width-1080' as const },
  { label: '最大寬度 800px', value: 'width-800' as const },
  { label: '自訂尺寸', value: 'custom' as const },
]

export default function ImageCompressorClient() {
  const {
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
  } = useImageCompressor()

  const dropzoneRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      addImages(files)
    },
    [addImages],
  )

  const errorRef = useRef(error)
  useEffect(() => {
    if (error && error !== errorRef.current) {
      setToast({ message: error, type: 'error' })
    }
    errorRef.current = error
  }, [error])

  const handleCompressAll = useCallback(async () => {
    if (images.length === 0) {
      setToast({ message: '請先上傳圖片', type: 'info' })
      return
    }
    await compressAll()
    setToast({ message: '壓縮完成！', type: 'success' })
  }, [images, compressAll])

  const handleDownloadZip = useCallback(async () => {
    try {
      await downloadAllZip()
    } catch {
      setToast({ message: 'ZIP 下載失敗', type: 'error' })
    }
  }, [downloadAllZip])

  const webpSupported = useMemo(() => {
    if (settings.outputFormat !== 'webp') return true
    const canvas = document.createElement('canvas')
    return canvas.toDataURL('image/webp').startsWith('data:image/webp')
  }, [settings.outputFormat])

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <section className="my-8">
        <p className="mb-4 text-sm text-gray-500">
          圖片會在你的瀏覽器中處理，不會上傳到伺服器。
        </p>
        <div ref={dropzoneRef}>
          <FileDropZone
            accept="image/jpeg,image/png,image/webp"
            multiple
            onFilesSelected={handleFilesSelected}
          />
        </div>
      </section>

      {images.length > 0 && (
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">壓縮設定</h2>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              壓縮品質：{settings.quality}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={settings.quality}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, quality: Number(e.target.value) }))
              }
              className="w-full"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {QUALITY_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, quality: preset.value }))
                  }
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    settings.quality === preset.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">輸出格式</label>
            <div className="flex gap-2">
              {(['jpeg', 'png', 'webp'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, outputFormat: format }))}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    settings.outputFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {format === 'jpeg' ? 'JPG' : format === 'png' ? 'PNG' : 'WebP'}
                </button>
              ))}
            </div>
            {!webpSupported && settings.outputFormat === 'webp' && (
              <p className="mt-1 text-xs text-red-500">
                您的瀏覽器不支援 WebP 格式
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">尺寸調整</label>
            <div className="flex flex-wrap gap-2">
              {RESIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, resizeMode: option.value }))
                  }
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    settings.resizeMode === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {settings.resizeMode === 'custom' && (
              <div className="mt-2 flex gap-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">寬度 (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={settings.customWidth}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        customWidth: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">高度 (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={settings.customHeight}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        customHeight: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
                <p className="self-end text-xs text-gray-400">留空則按比例縮放</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={handleCompressAll} isLoading={isProcessing}>
                {isProcessing ? '壓縮中...' : '開始壓縮'}
              </PrimaryButton>
              <SecondaryButton onClick={clearAll}>清除全部</SecondaryButton>
            </div>
            <div className="text-sm text-gray-500">
              共 {images.length} 張
              {doneCount > 0 && ` | 已完成 ${doneCount}`}
              {pendingCount > 0 && ` | 待處理 ${pendingCount}`}
              {errorCount > 0 && ` | 失敗 ${errorCount}`}
            </div>
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">圖片列表</h2>
            <div className="flex flex-wrap gap-2">
              {totalCompressedSize > 0 && (
                <span className="self-center text-sm text-gray-500">
                  總計：{formatFileSize(totalOriginalSize)} → {formatFileSize(totalCompressedSize)}
                  {' '}
                  {totalOriginalSize > 0 && (
                    <span className="font-medium text-green-600">
                      (-{Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)}%)
                    </span>
                  )}
                </span>
              )}
              {doneCount > 0 && (
                <PrimaryButton onClick={handleDownloadZip} isLoading={isProcessing}>
                  下載全部 ZIP
                </PrimaryButton>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {img.originalFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="ml-2 shrink-0 text-gray-400 hover:text-red-500"
                    aria-label="移除"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400">原始</p>
                    <img
                      src={img.originalPreviewUrl}
                      alt="原始圖片"
                      className="mt-1 h-24 w-full rounded object-contain bg-gray-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formatFileSize(img.originalSize)} ({img.originalWidth}x{img.originalHeight})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">
                      {img.status === 'done' ? '壓縮後' : img.status === 'processing' ? '處理中' : img.status === 'error' ? '失敗' : '等待中'}
                    </p>
                    {img.compressedPreviewUrl ? (
                      <img
                        src={img.compressedPreviewUrl}
                        alt="壓縮後圖片"
                        className="mt-1 h-24 w-full rounded object-contain bg-gray-100"
                      />
                    ) : (
                      <div className="mt-1 flex h-24 w-full items-center justify-center rounded bg-gray-50">
                        {img.status === 'processing' ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    )}
                    {img.compressedSize !== null && (
                      <p className="mt-1 text-xs text-gray-500">
                        {formatFileSize(img.compressedSize)}
                        {img.compressedWidth && img.compressedHeight
                          ? ` (${img.compressedWidth}x${img.compressedHeight})`
                          : ''}
                      </p>
                    )}
                  </div>
                </div>

                {img.status === 'done' && img.savingsPercent !== null && (
                  <div className="mb-2 flex items-center gap-2">
                    {img.isLarger ? (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                        壓縮後未變小，建議使用原圖或更換輸出格式
                      </span>
                    ) : (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        節省 {img.savingsPercent}%
                      </span>
                    )}
                  </div>
                )}

                {img.status === 'error' && img.error && (
                  <p className="mb-2 text-xs text-red-500">{img.error}</p>
                )}

                {img.status === 'done' && img.compressedBlob && (
                  <div className="flex gap-2">
                    <PrimaryButton
                      onClick={() => downloadSingle(img.id)}
                      className="flex-1 py-1.5 text-xs"
                    >
                      下載
                    </PrimaryButton>
                    <SecondaryButton
                      onClick={() => compressSingle(img.id)}
                      className="flex-1 py-1.5 text-xs"
                    >
                      重新壓縮
                    </SecondaryButton>
                  </div>
                )}

                {img.status === 'pending' && (
                  <PrimaryButton
                    onClick={() => compressSingle(img.id)}
                    className="w-full py-1.5 text-xs"
                  >
                    壓縮此圖片
                  </PrimaryButton>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">使用提示</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
          <li>支援 JPG、PNG、WebP 格式上傳</li>
          <li>單張圖片最大 20MB，一次最多 20 張</li>
          <li>調整壓縮品質滑桿，在檔案大小與畫質之間取得平衡</li>
          <li>如需透明背景，請選擇 PNG 輸出</li>
          <li>壓縮後可預覽比較差異</li>
        </ul>
      </section>
    </div>
  )
}

