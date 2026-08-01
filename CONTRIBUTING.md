# Contributing characters / 投稿角色

Thank you for contributing to AI FACE. Every submission must be an original character and must be safe for the project to redistribute.

Before preparing files, read the complete [user, submission, voting, and copyright flows](./docs/USER-FLOWS.md).

準備檔案前，請先閱讀完整的[使用、投稿、投票與版權流程](./docs/USER-FLOWS.zh-TW.md)。

感謝你為 AI FACE 投稿。每份投稿都必須是原創角色，而且 AI FACE 必須有權合法再散布。

## Rights gate / 權利門檻

By opening a pull request, you confirm all of the following:

建立 Pull Request 即表示你確認：

- You created the character, commissioned it with sufficient written rights, or generated an original design under terms that permit redistribution and modification.
- 角色由你創作、由你委託且具備足夠書面權利，或由允許修改與再散布的生成服務產生。
- The submission does not contain or imitate a recognizable third-party character, celebrity, brand, logo, costume, artwork, photograph, or trademark.
- 投稿不包含或模仿可辨識的第三方角色、名人、品牌、Logo、服裝、美術、照片或商標。
- You authorize redistribution under the license declared in `persona.json`.
- 你同意依照 `persona.json` 聲明的授權條款再散布。
- You understand that false or incomplete declarations may result in rejection or removal.
- 你了解不實或不完整聲明可能導致投稿被拒絕或移除。

Do not rely on fair use, fan-art status, or "AI generated" as proof that a submission is safe. When ownership is uncertain, do not upload it.

請勿以合理使用、二創或「AI 生成」當作可以投稿的證明。只要權利不確定，就不要上傳。

## Required files / 必要檔案

```text
personas/<character-id>/persona.json
personas/<character-id>/preview.png
personas/<character-id>/spritesheet.png
```

Rules:

- `<character-id>` uses lowercase ASCII letters, digits, and single hyphens.
- `spritesheet.png` is transparent RGBA, exactly `1024 × 1536`, and arranged as `4 × 6`.
- `preview.png` is transparent RGBA and no larger than 1 MiB.
- `spritesheet.png` is no larger than 5 MiB.
- No source photo, reference image, ZIP, PSD, prompt log, or additional file is allowed.
- Keep the character fully inside each frame with a stable scale and baseline.
- Do not include white backgrounds, checkerboards, text, logos, scenery, detached effects, or neighboring-frame overlap.

規則：

- `<character-id>` 只能使用小寫英文字母、數字與單一連字號。
- `spritesheet.png` 必須是透明 RGBA、精確 `1024 × 1536`，並排列為 `4 × 6`。
- `preview.png` 必須是透明 RGBA，且不超過 1 MiB。
- `spritesheet.png` 不超過 5 MiB。
- 不得附帶原始照片、參考圖片、ZIP、PSD、提示詞紀錄或其他檔案。
- 每格角色必須完整、尺寸一致並保持穩定基準線。
- 不得包含白底、透明棋盤格、文字、Logo、場景、分離特效或跨格重疊。

## Manifest / 角色資料

Copy [`templates/persona.json`](./templates/persona.json). The currently accepted licenses are:

- `CC0-1.0`
- `CC-BY-4.0`
- `CC-BY-SA-4.0`

Do not invent a custom license or use a license that forbids redistribution or modification.

請複製 [`templates/persona.json`](./templates/persona.json)。不得自創授權條款，也不得使用禁止修改或再散布的授權。

## Local validation / 本機驗證

```bash
npm test
npm run validate
```

Automation checks structure and technical facts. Maintainers still review identity consistency, visual quality, safety, and copyright risk.

自動檢查只驗證結構與技術事實；角色一致性、視覺品質、安全性與版權風險仍由維護者人工審查。
