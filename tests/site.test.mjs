import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = resolve(repositoryRoot, "docs");
const indexPath = resolve(siteRoot, "index.html");
const cssPath = resolve(siteRoot, "assets", "site.css");
const scriptPath = resolve(siteRoot, "assets", "site.js");
const iconPath = resolve(siteRoot, "assets", "ai-face.png");

const html = await readFile(indexPath, "utf8");
const css = await readFile(cssPath, "utf8");
const script = await readFile(scriptPath, "utf8");
const normalizedHtml = html.replace(/\s+/g, " ");

test("publishes one bilingual, accessible public entrance", () => {
  assert.match(html, /data-language-button="en"/);
  assert.match(html, /data-language-button="zh"/);
  assert.match(html, /data-copy="en"/);
  assert.match(html, /data-copy="zh"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="main">/);
  assert.match(css, /prefers-reduced-motion/);
});

test("links both AI FACE projects without inventing a release URL", () => {
  assert.match(html, /https:\/\/github\.com\/page5888\/AI-FACE"/);
  assert.match(
    html,
    /https:\/\/github\.com\/page5888\/AI-FACE-Personas"/,
  );
  assert.match(normalizedHtml, /Chrome Web Store release is still planned/);
  assert.doesNotMatch(html, /chrome\.google\.com\/webstore/);
});

test("states the privacy, product, and copyright boundaries", () => {
  assert.match(normalizedHtml, /does not actively upload persona images/);
  assert.match(normalizedHtml, /Storage is local, not encrypted/);
  assert.match(normalizedHtml, /Do not upload copyrighted characters/);
  assert.match(normalizedHtml, /AI-generated does not automatically/);
  assert.match(normalizedHtml, /not exact phoneme lip sync/);
  assert.match(normalizedHtml, /not a frameless, click-through native desktop pet/);
  assert.match(normalizedHtml, /not affiliated with or endorsed by OpenAI/);
});

test("keeps the website local and tracker-free", () => {
  const combinedSource = html + "\n" + script;

  assert.doesNotMatch(combinedSource, /google-analytics|googletagmanager/i);
  assert.doesNotMatch(combinedSource, /posthog|segment|mixpanel/i);
  assert.doesNotMatch(script, /\bfetch\s*\(/);
  assert.doesNotMatch(script, /XMLHttpRequest|WebSocket|EventSource/);
});

test("resolves every local website asset", async () => {
  for (const path of [cssPath, scriptPath, iconPath]) {
    await access(path);
  }

  const localReferences = [
    ...html.matchAll(/(?:href|src)="(\.\/[^"#?]+)"/g),
  ].map((match) => match[1]);

  assert.deepEqual(
    [...new Set(localReferences)].sort(),
    ["./assets/ai-face.png", "./assets/site.css", "./assets/site.js"],
  );
});
