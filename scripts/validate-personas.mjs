import {
  lstat,
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

export const ALLOWED_LICENSES = new Set([
  "CC0-1.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
]);

export const ALLOWED_SOURCE_TYPES = new Set([
  "original-drawn",
  "original-commissioned",
  "original-ai",
]);

export const REQUIRED_PERSONA_FILES = [
  "persona.json",
  "preview.png",
  "spritesheet.png",
];

export const MAX_PREVIEW_BYTES = 1024 * 1024;
export const MAX_SPRITESHEET_BYTES = 5 * 1024 * 1024;

const PERSONA_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GITHUB_USER_PATTERN = /^@[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const MAX_IMAGE_PIXELS = 2_000_000;

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let current = value;
  for (let bit = 0; bit < 8; bit += 1) {
    current = (current & 1) === 1
      ? 0xedb88320 ^ (current >>> 1)
      : current >>> 1;
  }
  return current >>> 0;
});

function crc32(buffer) {
  let checksum = 0xffffffff;
  for (const byte of buffer) {
    checksum = CRC_TABLE[(checksum ^ byte) & 0xff] ^ (checksum >>> 8);
  }
  return (checksum ^ 0xffffffff) >>> 0;
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireExactKeys(value, expected, label, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${label} must be an object.`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(canonical)) {
    errors.push(
      `${label} keys must be exactly: ${canonical.join(", ")}.`,
    );
    return false;
  }
  return true;
}

function requireText(value, label, errors, maxLength = 200) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > maxLength
  ) {
    errors.push(`${label} must be non-empty and at most ${maxLength} characters.`);
    return false;
  }
  return true;
}

export function validateManifest(manifest, folderName) {
  const errors = [];
  if (
    !requireExactKeys(
      manifest,
      [
        "schemaVersion",
        "id",
        "displayName",
        "description",
        "author",
        "sourceType",
        "license",
        "attribution",
        "ai",
        "assets",
        "sprite",
        "rights",
      ],
      "persona.json",
      errors,
    )
  ) {
    return errors;
  }

  if (manifest.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }
  if (!PERSONA_ID_PATTERN.test(manifest.id ?? "")) {
    errors.push("id must use lowercase letters, digits, and single hyphens.");
  }
  if (manifest.id !== folderName) {
    errors.push("id must exactly match its personas/<character-id> folder.");
  }
  requireText(manifest.displayName, "displayName", errors, 80);

  if (
    requireExactKeys(
      manifest.description,
      ["en", "zhTW"],
      "description",
      errors,
    )
  ) {
    requireText(manifest.description.en, "description.en", errors, 240);
    requireText(manifest.description.zhTW, "description.zhTW", errors, 240);
  }

  if (
    requireExactKeys(
      manifest.author,
      ["name", "github"],
      "author",
      errors,
    )
  ) {
    requireText(manifest.author.name, "author.name", errors, 80);
    if (!GITHUB_USER_PATTERN.test(manifest.author.github ?? "")) {
      errors.push("author.github must be a valid @username.");
    }
  }

  if (!ALLOWED_SOURCE_TYPES.has(manifest.sourceType)) {
    errors.push(
      `sourceType must be one of: ${[...ALLOWED_SOURCE_TYPES].join(", ")}.`,
    );
  }
  if (!ALLOWED_LICENSES.has(manifest.license)) {
    errors.push(
      `license must be one of: ${[...ALLOWED_LICENSES].join(", ")}.`,
    );
  }
  requireText(manifest.attribution, "attribution", errors, 300);

  if (
    requireExactKeys(
      manifest.ai,
      ["generated", "tool"],
      "ai",
      errors,
    )
  ) {
    if (typeof manifest.ai.generated !== "boolean") {
      errors.push("ai.generated must be a boolean.");
    }
    if (
      manifest.sourceType === "original-ai" &&
      manifest.ai.generated !== true
    ) {
      errors.push("original-ai submissions must set ai.generated to true.");
    }
    if (
      manifest.sourceType !== "original-ai" &&
      manifest.ai.generated !== false
    ) {
      errors.push("non-AI source types must set ai.generated to false.");
    }
    if (manifest.ai.generated === true) {
      requireText(manifest.ai.tool, "ai.tool", errors, 120);
    } else if (manifest.ai.tool !== "") {
      errors.push("ai.tool must be empty when ai.generated is false.");
    }
  }

  if (
    requireExactKeys(
      manifest.assets,
      ["preview", "spritesheet"],
      "assets",
      errors,
    )
  ) {
    if (manifest.assets.preview !== "preview.png") {
      errors.push("assets.preview must be preview.png.");
    }
    if (manifest.assets.spritesheet !== "spritesheet.png") {
      errors.push("assets.spritesheet must be spritesheet.png.");
    }
  }

  if (
    requireExactKeys(
      manifest.sprite,
      ["layout", "width", "height", "columns", "rows"],
      "sprite",
      errors,
    )
  ) {
    const expected = {
      layout: "4x6",
      width: 1024,
      height: 1536,
      columns: 4,
      rows: 6,
    };
    for (const [key, value] of Object.entries(expected)) {
      if (manifest.sprite[key] !== value) {
        errors.push(`sprite.${key} must be ${JSON.stringify(value)}.`);
      }
    }
  }

  if (
    requireExactKeys(
      manifest.rights,
      [
        "ownerOrAuthorized",
        "originalCharacter",
        "noThirdPartyIP",
        "redistributionAllowed",
      ],
      "rights",
      errors,
    )
  ) {
    for (const [key, value] of Object.entries(manifest.rights)) {
      if (value !== true) {
        errors.push(`rights.${key} must be true.`);
      }
    }
  }

  return errors;
}

export function inspectPngHeader(buffer) {
  if (
    buffer.length < 29 ||
    !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
    buffer.toString("ascii", 12, 16) !== "IHDR"
  ) {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25],
    compression: buffer[26],
    filter: buffer[27],
    interlace: buffer[28],
  };
}

export function inspectCompletePng(buffer) {
  const header = inspectPngHeader(buffer);
  if (header === null || header.width === 0 || header.height === 0) {
    return null;
  }
  if (
    header.bitDepth !== 8 ||
    ![2, 6].includes(header.colorType) ||
    header.compression !== 0 ||
    header.filter !== 0 ||
    header.interlace !== 0
  ) {
    return null;
  }

  let offset = PNG_SIGNATURE.length;
  let sawHeader = false;
  let sawImageData = false;
  let sawEnd = false;
  const imageData = [];

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const typeStart = offset + 4;
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (chunkEnd > buffer.length) {
      return null;
    }

    const type = buffer.toString("ascii", typeStart, dataStart);
    const expectedCrc = buffer.readUInt32BE(dataEnd);
    if (crc32(buffer.subarray(typeStart, dataEnd)) !== expectedCrc) {
      return null;
    }

    if (type === "IHDR") {
      if (sawHeader || offset !== PNG_SIGNATURE.length || length !== 13) {
        return null;
      }
      sawHeader = true;
    } else if (type === "IDAT") {
      if (!sawHeader || sawEnd) {
        return null;
      }
      sawImageData = true;
      imageData.push(buffer.subarray(dataStart, dataEnd));
    } else if (type === "IEND") {
      if (!sawHeader || !sawImageData || sawEnd || length !== 0) {
        return null;
      }
      sawEnd = true;
      offset = chunkEnd;
      break;
    }

    offset = chunkEnd;
  }

  if (!sawHeader || !sawImageData || !sawEnd || offset !== buffer.length) {
    return null;
  }

  const bytesPerPixel = header.colorType === 6 ? 4 : 3;
  const expectedBytes = (header.width * bytesPerPixel + 1) * header.height;
  try {
    const decoded = inflateSync(Buffer.concat(imageData), {
      maxOutputLength: expectedBytes + 1,
    });
    if (decoded.length !== expectedBytes) {
      return null;
    }
    const rowBytes = header.width * bytesPerPixel + 1;
    for (let row = 0; row < header.height; row += 1) {
      if (decoded[row * rowBytes] > 4) {
        return null;
      }
    }
  } catch {
    return null;
  }

  return header;
}

async function validatePng(filePath, options) {
  const errors = [];
  const info = await lstat(filePath);
  if (!info.isFile() || info.isSymbolicLink()) {
    return [`${options.name} must be a regular file, not a link.`];
  }
  if (info.size > options.maxBytes) {
    errors.push(`${options.name} exceeds ${options.maxBytes} bytes.`);
  }
  const buffer = await readFile(filePath);
  const header = inspectCompletePng(buffer);
  if (header === null) {
    return [...errors, `${options.name} is not a complete valid PNG.`];
  }
  if (header.width * header.height > MAX_IMAGE_PIXELS) {
    errors.push(`${options.name} exceeds ${MAX_IMAGE_PIXELS} pixels.`);
  }
  if (header.bitDepth !== 8 || header.colorType !== 6) {
    errors.push(`${options.name} must be an 8-bit RGBA PNG.`);
  }
  if (
    options.width !== undefined &&
    (header.width !== options.width || header.height !== options.height)
  ) {
    errors.push(
      `${options.name} must be exactly ${options.width}x${options.height}.`,
    );
  }
  return errors;
}

async function validatePersonaDirectory(personasDir, entry) {
  const errors = [];
  const folderName = entry.name;
  const prefix = `personas/${folderName}`;
  if (!PERSONA_ID_PATTERN.test(folderName)) {
    return [`${prefix}: folder name is not a valid character id.`];
  }
  if (entry.isSymbolicLink() || !entry.isDirectory()) {
    return [`${prefix}: only real directories are allowed.`];
  }

  const personaDir = path.join(personasDir, folderName);
  const entries = await readdir(personaDir, { withFileTypes: true });
  const actualFiles = entries.map((item) => item.name).sort();
  const expectedFiles = [...REQUIRED_PERSONA_FILES].sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    errors.push(
      `${prefix}: files must be exactly ${expectedFiles.join(", ")}.`,
    );
    return errors;
  }
  if (entries.some((item) => !item.isFile() || item.isSymbolicLink())) {
    errors.push(`${prefix}: links and nested directories are not allowed.`);
    return errors;
  }

  const manifestPath = path.join(personaDir, "persona.json");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    errors.push(
      ...validateManifest(manifest, folderName).map(
        (error) => `${prefix}: ${error}`,
      ),
    );
  } catch {
    errors.push(`${prefix}: persona.json must be valid UTF-8 JSON.`);
  }

  errors.push(
    ...(await validatePng(path.join(personaDir, "preview.png"), {
      name: `${prefix}/preview.png`,
      maxBytes: MAX_PREVIEW_BYTES,
    })),
  );
  errors.push(
    ...(await validatePng(path.join(personaDir, "spritesheet.png"), {
      name: `${prefix}/spritesheet.png`,
      maxBytes: MAX_SPRITESHEET_BYTES,
      width: 1024,
      height: 1536,
    })),
  );
  return errors;
}

export async function validateRepository(rootDirectory) {
  const personasDir = path.join(rootDirectory, "personas");
  const entries = await readdir(personasDir, { withFileTypes: true });
  const errors = [];
  const personaEntries = [];

  for (const entry of entries) {
    if (entry.name === "README.md" && entry.isFile()) {
      continue;
    }
    personaEntries.push(entry);
  }

  for (const entry of personaEntries) {
    errors.push(...(await validatePersonaDirectory(personasDir, entry)));
  }
  return {
    errors,
    personaCount: personaEntries.length,
  };
}

async function main() {
  const scriptPath = fileURLToPath(import.meta.url);
  const rootDirectory = path.resolve(path.dirname(scriptPath), "..");
  const result = await validateRepository(rootDirectory);
  if (result.errors.length > 0) {
    console.error("Persona validation failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(
    result.personaCount === 0
      ? "Persona validation passed. No reviewed packs are present yet."
      : `Persona validation passed for ${result.personaCount} pack(s).`,
  );
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await main();
}
