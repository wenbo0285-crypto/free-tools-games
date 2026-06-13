# 免費工具與小遊戲

一個基於 Next.js 的免費線上工具與小遊戲網站，所有功能均在瀏覽器端執行，無須後端伺服器。

## 已完成功能

### 工具
- **圖片壓縮工具** (`/tools/image-compressor`) - 單張/批次上傳、品質調整、尺寸調整、WebP 輸出、ZIP 下載
- **QR Code 產生器** (`/tools/qr-code-generator`) - 9 種 QR 類型、顏色/尺寸自訂、Logo 上傳、PNG 下載
- **PDF 壓縮工具** (`/tools/pdf-compressor`) - 三種壓縮模式、瀏覽器端處理、誠實大小比較

### 遊戲
- **方塊拼圖** (`/games/block-puzzle`) - 8x8 棋盤、15 種方塊、拖曳放置、橫直列消除、Combo
- **三消遊戲** (`/games/match-3`) - 8x8 棋盤、6 種水果、連鎖消除、30 步挑戰

## 技術棧

- **框架**: Next.js 16.2.9
- **語言**: TypeScript
- **樣式**: Tailwind CSS v4
- **套件**: pdf-lib, pdfjs-dist, qrcode, jszip, file-saver
- **開發**: Turbopack, ESLint

## 本機啟動

```bash
npm install
npm run dev
```

開啟 http://localhost:3000

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## 部署建議

- **Vercel**（推薦）：直接連接 Git 倉庫自動部署
- **Cloudflare Pages**：支援 Next.js 靜態匯出
- 無須後端伺服器，所有功能在瀏覽器端執行

## 注意事項

- PDF 壓縮對文字型 PDF 效果有限（已誠實提示）
- QR Code 目前僅支援 PNG 下載
- 音效尚未實作（方塊拼圖預留開關）
- 所有檔案處理均在瀏覽器本機完成，不上傳伺服器
