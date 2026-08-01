import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { deflateSync } from "node:zlib";
import {
  inspectCompletePng,
  inspectPngHeader,
  validateManifest,
  validateRepository,
} from "../scripts/validate-personas.mjs";

function pngHeader(width, height, colorType = 6) {
  const buffer = Buffer.alloc(33);
  Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  buffer[24] = 8;
  buffer[25] = colorType;
  return buffer;
}

const TEST_CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let current = value;
  for (let bit = 0; bit < 8; bit += 1) {
    current = (current & 1) === 1
      ? 0xedb88320 ^ (current >>> 1)
      : current >>> 1;
  }
  return current >>> 0;
});

function testCrc32(buffer) {
  let checksum = 0xffffffff;
  for (const byte of buffer) {
    checksum =
      TEST_CRC_TABLE[(checksum ^ byte) & 0xff] ^ (checksum >>> 8);
  }
  return (checksum ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(testCrc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

function pngFile(width, height, colorType = 6) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = colorType;
  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const pixels = Buffer.alloc((width * bytesPerPixel + 1) * height);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(pixels)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function manifest(id = "test-character") {
  return {
    schemaVersion: 1,
    id,
    displayName: "Test Character",
    description: {
      en: "An original test character.",
      zhTW: "原創測試角色。",
    },
    author: {
      name: "Test Author",
      github: "@test-author",
    },
    sourceType: "original-ai",
    license: "CC-BY-4.0",
    attribution: "Test Character by Test Author, CC BY 4.0.",
    ai: {
      generated: true,
      tool: "Test generator",
    },
    assets: {
      preview: "preview.png",
      spritesheet: "spritesheet.png",
    },
    sprite: {
      layout: "4x6",
      width: 1024,
      height: 1536,
      columns: 4,
      rows: 6,
    },
    rights: {
      ownerOrAuthorized: true,
      originalCharacter: true,
      noThirdPartyIP: true,
      redistributionAllowed: true,
    },
  };
}

async function createRepository() {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-face-personas-"));
  await mkdir(path.join(root, "personas"));
  await writeFile(path.join(root, "personas", "README.md"), "Reviewed only\n");
  return root;
}

async function writePack(root, id, value = manifest(id)) {
  const directory = path.join(root, "personas", id);
  await mkdir(directory);
  await writeFile(
    path.join(directory, "persona.json"),
    `${JSON.stringify(value, null, 2)}\n`,
  );
  await writeFile(path.join(directory, "preview.png"), pngFile(512, 512));
  await writeFile(
    path.join(directory, "spritesheet.png"),
    pngFile(1024, 1536),
  );
  return directory;
}

test("reads and fully validates canonical RGBA PNGs", () => {
  const expected = {
    width: 1024,
    height: 1536,
    bitDepth: 8,
    colorType: 6,
    compression: 0,
    filter: 0,
    interlace: 0,
  };
  assert.deepEqual(inspectPngHeader(pngHeader(1024, 1536)), expected);

  const complete = pngFile(1024, 1536);
  assert.deepEqual(inspectCompletePng(complete), expected);
  assert.equal(inspectCompletePng(complete.subarray(0, 40)), null);
  assert.equal(inspectPngHeader(Buffer.from("not a png")), null);
});

test("accepts an empty reviewed catalog", async (context) => {
  const root = await createRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.deepEqual(await validateRepository(root), {
    errors: [],
    personaCount: 0,
  });
});

test("accepts one complete original character pack", async (context) => {
  const root = await createRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  await writePack(root, "test-character");
  assert.deepEqual(await validateRepository(root), {
    errors: [],
    personaCount: 1,
  });
});

test("rejects false rights declarations", () => {
  const value = manifest();
  value.rights.noThirdPartyIP = false;
  assert.ok(
    validateManifest(value, "test-character").includes(
      "rights.noThirdPartyIP must be true.",
    ),
  );
});

test("rejects source photos and other extra files", async (context) => {
  const root = await createRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const directory = await writePack(root, "test-character");
  await writeFile(path.join(directory, "reference-photo.jpg"), "not allowed");
  const result = await validateRepository(root);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /files must be exactly/);
});

test("rejects incorrect sprite dimensions and PNGs without alpha", async (context) => {
  const root = await createRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const directory = await writePack(root, "test-character");
  await writeFile(
    path.join(directory, "spritesheet.png"),
    pngFile(1024, 1024, 2),
  );
  const result = await validateRepository(root);
  assert.ok(result.errors.some((error) => /RGBA PNG/.test(error)));
  assert.ok(result.errors.some((error) => /1024x1536/.test(error)));
});
