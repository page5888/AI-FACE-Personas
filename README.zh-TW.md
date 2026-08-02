<p align="center">
  <a href="./README.md">English</a> ·
  <strong>繁體中文</strong>
</p>

<p align="center">
  <a href="https://page5888.github.io/AI-FACE-Personas/">公開網站</a>
</p>

# AI FACE 角色庫

這是 [AI FACE](https://github.com/page5888/AI-FACE) 的社群角色投稿倉庫。

第一次來？請先閱讀完整的[使用、投稿、投票與版權流程](./docs/USER-FLOWS.zh-TW.md)。

> [!CAUTION]
> **請勿上傳你不擁有著作權的角色或圖片。**
> 動漫、遊戲、電影、名人、品牌、Logo、網路下載圖片、截圖或其他第三方智慧財產內容，一律不接受，並可能不另行通知直接移除。

本倉庫刻意從空角色庫開始。角色只有在檔案格式、授權聲明、自動檢查與人工審查全部通過後，才會進入正式目錄。

## 可以投稿

- 由你本人創作的原創角色。
- 由你委託創作，且合約明確授予你修改與再散布權利的原創角色。
- 使用 AI 產生的原創角色，但生成服務條款必須允許此用途，而且結果不得重現第三方角色或智慧財產。

AI 生成不代表自動沒有版權問題。投稿者仍須對角色設計與所有檔案負責。

## 禁止投稿

- 既有動漫、漫畫、遊戲、電影、電視、漫畫作品、吉祥物或名人角色。
- 二創、近似角色、複製服裝、可辨識品牌素材、Logo 或商標。
- 從網站、社群、素材商店、搜尋引擎或其他創作者下載的圖片。
- 原始照片、參考照片、截圖、含私人資料的提示詞、ZIP 或無關檔案。
- 違法、仇恨、剝削、露骨色情，或以不安全方式呈現未成年人的內容。

## 角色包格式

每個角色只能放在一個資料夾：

```text
personas/<character-id>/
├── persona.json
├── preview.png
└── spritesheet.png
```

目前 AI FACE 動態角色使用一張透明 `1024 × 1536` PNG，排列為 `4 × 6`。只接受上面三個檔案；請勿附上原始照片或生圖參考素材。

請先複製 [`templates/persona.json`](./templates/persona.json)，再閱讀 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 投稿流程

1. Fork 本倉庫。
2. 在自己的 Fork 建立 `personas/<character-id>/`。
3. 加入精確三個必要檔案。
4. 執行 `npm test` 與 `npm run validate`。
5. 建立 Pull Request，逐項完成權利聲明。

Pull Request 只是投稿提案，不代表自動公開。自動檢查通過也不能取代版權與視覺人工審查。

## 版權檢舉

請閱讀 [`COPYRIGHT.md`](./COPYRIGHT.md)。若要先通知維護者，可使用版權檢舉 Issue 表單並提供精確檔案網址；請勿在公開 Issue 填寫私人聯絡資料。正式版權通知請使用 GitHub 官方程序。

## 成本與空間邊界

目前使用 GitHub Fork 與 Pull Request，不建立 AI FACE 上傳伺服器、會員或帳號系統。角色素材只會在審查後保存。未來若目錄超出一般 Git 儲存的合理範圍，會另外規劃受審查的儲存方案，不會默默加入付費基礎設施。

AI FACE 是獨立第三方專案，與 OpenAI 無隸屬或官方背書關係。
