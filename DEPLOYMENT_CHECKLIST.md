# 部署檢查清單

## 部署前檢查

- [ ] `npm install` 無錯誤
- [ ] `npm run build` 成功
- [ ] `npm run lint` 0 errors
- [ ] TypeScript 無錯誤
- [ ] 本機測試所有路由可開啟
- [ ] Console 無錯誤

## Vercel 部署

1. 連接 Git 倉庫（GitHub / GitLab）
2. Framework preset 選擇 Next.js
3. 環境變數：無須設定（全部靜態）
4. 部署指令：`npm run build`
5. 輸出目錄：自動偵測

## Cloudflare Pages 部署

1. 使用 `next.config.js` 設定 `output: 'export'`（如需靜態匯出）
2. 或使用 Cloudflare 的 Next.js 整合
3. Build command: `npm run build`
4. Output directory: `out`

## 上線後要檢查的項目

- [ ] 首頁可正常開啟
- [ ] 所有工具正常運作（圖片壓縮 / QR Code / PDF 壓縮）
- [ ] 所有遊戲正常運作（方塊拼圖 / 三消遊戲）
- [ ] 手機版排版無破版
- [ ] 繁體中文正確顯示
- [ ] SEO meta tags 正確

## 接廣告前注意事項

- **AdSense**：需確認各頁面廣告插入位置（目前使用 AdPlaceholder 佔位）
- **H5 Games Ads**：遊戲頁面可考慮插入插頁廣告
- **GDPR / 隱私政策**：已包含 `/privacy-policy` 與 `/terms`
- **廣告干擾**：確認廣告不會擋到遊戲操作按鈕
