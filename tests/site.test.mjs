import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = resolve(repositoryRoot, "docs");
const indexPath = resolve(siteRoot, "index.html");
const privacyPath = resolve(siteRoot, "privacy", "index.html");
const supportPath = resolve(siteRoot, "support", "index.html");
const cssPath = resolve(siteRoot, "assets", "site.css");
const scriptPath = resolve(siteRoot, "assets", "site.js");
const iconPath = resolve(siteRoot, "assets", "ai-face.png");
const previewZipPath = resolve(siteRoot, "downloads", "AI-FACE-Preview.zip");
const checksumPath = resolve(siteRoot, "downloads", "AI-FACE-Preview.sha256.txt");

const html = await readFile(indexPath, "utf8");
const privacyHtml = await readFile(privacyPath, "utf8");
const supportHtml = await readFile(supportPath, "utf8");
const css = await readFile(cssPath, "utf8");
const script = await readFile(scriptPath, "utf8");
const normalizedHtml = html.replace(/\s+/g, " ");

test("publishes one concise bilingual accessible entrance", () => {
  assert.match(html, /data-language-button="en"/);
  assert.match(html, /data-language-button="zh"/);
  assert.match(html, /data-copy="en"/);
  assert.match(html, /data-copy="zh"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="main">/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(normalizedHtml, /Phase\s*\d|internal preview|內部試用/i);
});

test("keeps the public path focused on install, personas, privacy, and support", () => {
  assert.match(html, /https:\/\/github\.com\/page5888\/AI-FACE-Personas"/);
  assert.doesNotMatch(html, /href="https:\/\/github\.com\/page5888\/AI-FACE"/);
  assert.match(html, /href="\.\/downloads\/AI-FACE-Preview\.zip"/);
  assert.match(html, /href="\.\/privacy\/"/);
  assert.match(html, /href="\.\/support\/"/);
  assert.match(normalizedHtml, /Installation currently uses Developer mode/);
  assert.doesNotMatch(html, /chrome\.google\.com\/webstore/);
});

test("gives ordinary users a complete four-step installation path", () => {
  assert.equal([...html.matchAll(/data-install-step="[1-4]"/g)].length, 4);
  assert.match(html, /chrome:\/\/extensions/);
  assert.match(normalizedHtml, /select Load unpacked/);
  assert.match(normalizedHtml, /containing manifest\.json/);
  assert.match(normalizedHtml, /No GitHub, Node\.js, Terminal, or source build is required/);
});

test("ships a checksummed installable preview ZIP", async () => {
  const packageBytes = await readFile(previewZipPath);
  const checksum = await readFile(checksumPath, "utf8");
  const digest = createHash("sha256").update(packageBytes).digest("hex");
  const archiveText = packageBytes.toString("latin1");

  assert.ok(packageBytes.length > 1_000_000);
  assert.equal(packageBytes[0], 0x50);
  assert.equal(packageBytes[1], 0x4b);
  assert.equal(checksum.trim(), `${digest}  AI-FACE-Preview.zip`);
  assert.match(archiveText, /manifest\.json/);
  assert.match(archiveText, /INSTALL\.txt/);
  assert.match(archiveText, /personas\\haruna\.png/);
  assert.match(archiveText, /personas\\miu\.png/);
  assert.match(archiveText, /personas\\nova\.png/);
  assert.doesNotMatch(archiveText, /node_modules|\.tsx|personas\\(?:aether|aira|byte|kaito|lumi|ren)\.png/i);
});

test("publishes standalone bilingual privacy and support pages", () => {
  assert.match(privacyHtml, /Privacy Policy \/ 隱私政策/);
  assert.match(privacyHtml, /chrome\.storage\.local/);
  assert.match(privacyHtml, /tabCapture/);
  assert.match(privacyHtml, /不讀取或保存 ChatGPT 對話文字/);
  assert.match(privacyHtml, /not recorded or uploaded by AI FACE/);
  assert.match(supportHtml, /Support AI FACE \/ 支持 AI FACE/);
  assert.match(supportHtml, /0x6f4B48910276527f1C2D2e1c8CA9f1a02592e785/);
  assert.match(supportHtml, /EMWFYcEUnksDvYCq1inLaqdWRsZ8DxduGXa8YHpoHVR7/);
  assert.match(supportHtml, /does not unlock Pro/);
});

test("states the product, privacy, and copyright boundaries", () => {
  assert.match(normalizedHtml, /No conversation reading/);
  assert.match(normalizedHtml, /No active image upload/);
  assert.match(normalizedHtml, /Local does not mean encrypted/);
  assert.match(normalizedHtml, /Upload only characters you have the right to share/);
  assert.match(normalizedHtml, /not affiliated with or endorsed by OpenAI/);
});

test("keeps the website local and tracker-free", () => {
  const combinedSource = [html, privacyHtml, supportHtml, script].join("\n");
  assert.doesNotMatch(combinedSource, /google-analytics|googletagmanager/i);
  assert.doesNotMatch(combinedSource, /posthog|segment|mixpanel/i);
  assert.doesNotMatch(script, /\bfetch\s*\(/);
  assert.doesNotMatch(script, /XMLHttpRequest|WebSocket|EventSource/);
});

test("resolves every local website asset", async () => {
  for (const path of [cssPath, scriptPath, iconPath, previewZipPath, checksumPath, privacyPath, supportPath]) {
    await access(path);
  }

  const localReferences = [...html.matchAll(/(?:href|src)="(\.\/[^"#?]+)"/g)].map((match) => match[1]);
  assert.deepEqual(
    [...new Set(localReferences)].sort(),
    ["./assets/ai-face.png", "./assets/site.css", "./assets/site.js", "./downloads/AI-FACE-Preview.zip", "./privacy/", "./support/"],
  );
});