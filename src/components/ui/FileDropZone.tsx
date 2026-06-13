'use client'

import { useCallback, useRef, useState } from 'react'

interface FileDropZoneProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onFilesSelected?: (files: File[]) => void
  children?: React.ReactNode
}

export default function FileDropZone({
  accept,
  multiple = false,
  maxSize,
  onFilesSelected,
  children,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(
    (fileList: FileList) => {
      setError(null)
      const files = Array.from(fileList)
      if (maxSize) {
        const oversized = files.some((f) => f.size > maxSize)
        if (oversized) {
          setError(`檔案大小超過限制 (${Math.round(maxSize / 1024 / 1024)}MB)`)
          return
        }
      }
      onFilesSelected?.(files)
    },
    [maxSize, onFilesSelected],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />
      {children || (
        <>
          <p className="mb-2 text-sm font-medium text-gray-600">
            拖曳檔案到這裡，或點擊選取檔案
          </p>
          <p className="text-xs text-gray-400">
            {accept ? `支援格式：${accept}` : ''}
            {maxSize ? ` | 單檔上限 ${Math.round(maxSize / 1024 / 1024)}MB` : ''}
          </p>
        </>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
