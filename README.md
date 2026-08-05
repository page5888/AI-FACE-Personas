<p align="center">
  <strong>English</strong> ·
  <a href="./README.zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <a href="https://page5888.github.io/AI-FACE-Personas/">Public website</a>
</p>

# AI FACE Personas

Community character packs for [AI FACE](https://github.com/page5888/AI-FACE).

New here? Read the complete [user, submission, voting, and copyright flows](./docs/USER-FLOWS.md).

## Install the current preview

You do not need GitHub, Node.js, Terminal, or a source build.

1. [Download AI FACE Preview](./docs/downloads/AI-FACE-Preview.zip).
2. Right-click the ZIP and select **Extract All**.
3. Open `chrome://extensions` in Chrome.
4. Turn on **Developer mode** in the upper-right corner.
5. Select **Load unpacked**, then choose the extracted folder that directly contains `manifest.json`.
6. Open or refresh [ChatGPT](https://chatgpt.com/). Haruna appears automatically; use the AI FACE extension button to choose Haruna, Miu, or Nova.

This is a Phase 6 preview and is not yet published in the Chrome Web Store. After downloading an updated build, reload AI FACE on `chrome://extensions` and refresh the ChatGPT tab.

> [!CAUTION]
> **Do not upload copyrighted characters or images you do not own.**
> Submissions containing anime, game, movie, celebrity, brand, logo, downloaded artwork, screenshots, or other third-party intellectual property will be rejected and may be removed without notice.

This repository starts empty on purpose. A character appears in the catalog only after its files, format, license, and rights declaration have passed automated and human review.

## What can be submitted

- An original character created by you.
- An original character commissioned by you when the agreement gives you redistribution and modification rights.
- An original AI-generated character when the generation service permits this use and the result does not reproduce third-party intellectual property.

AI generation does not automatically make an image copyright-safe. You remain responsible for the submitted design and every included file.

## What cannot be submitted

- Existing anime, manga, game, movie, television, comic, mascot, or celebrity characters.
- Fan art, character lookalikes, copied costumes, recognizable brand assets, logos, or trademarks.
- Images downloaded from websites, social media, asset stores, search engines, or other creators.
- Source photos, reference photos, screenshots, prompts containing private information, ZIP files, or unrelated files.
- Content that is illegal, hateful, exploitative, sexually explicit, or depicts minors in an unsafe context.

## Character pack format

Each accepted pack occupies one folder:

```text
personas/<character-id>/
├── persona.json
├── preview.png
└── spritesheet.png
```

Current AI FACE animated packs use one transparent `1024 × 1536` PNG arranged as a `4 × 6` grid. Only the three files above are accepted. Do not include the source photo or generation references.

Start from [`templates/persona.json`](./templates/persona.json), then read [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Submit a character

1. Fork this repository.
2. Create `personas/<character-id>/` in your fork.
3. Add the exact three required files.
4. Run `npm test` and `npm run validate`.
5. Open a pull request and complete every rights checkbox.

Pull requests are proposals, not automatic publication. Passing automation does not replace copyright or visual review.

## Copyright reports

Read [`COPYRIGHT.md`](./COPYRIGHT.md). For an informal repository-level report, use the copyright report issue form and identify the exact file URL. Do not publish private contact information in an issue. Formal copyright notices should use GitHub's official process.

## Cost and hosting boundary

This repository uses GitHub forks and pull requests, so AI FACE does not operate an upload server or user account system. Character assets are stored only after review. If the catalog eventually outgrows normal Git hosting, the project will define a separate reviewed storage plan instead of silently adding paid infrastructure.

AI FACE is an independent third-party project and is not affiliated with or endorsed by OpenAI.
