import fs from "fs";
import path from "path";
import getDb from "../src/app/database/db.js";

const pagesDir = path.resolve("src/app/(pages)");
const db = await getDb();

// Regex to match t("string") or t('string')
const tRegex = /t\(\s*["'`]([^"'`]+)["'`]/g;

// Regex to match <Trans>Some text</Trans>
const transRegex = /<Trans>(.*?)<\/Trans>/gs;

function getAllFiles(dir, allFiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) getAllFiles(fullPath, allFiles);
    else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".tsx"))
      allFiles.push(fullPath);
  }
  return allFiles;
}

function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const keys = new Set();

  // Find t("key") usages
  let match;
  while ((match = tRegex.exec(content))) {
    let rawKey = match[1].trim();
    // Remove interpolation placeholders like {{email}}
    // rawKey = rawKey.replace(/\{\{.*?\}\}/g, "").trim();
    // Keep interpolation placeholders (so {{email}} stays in string)
    rawKey = rawKey.trim();

    // Also clean extra spaces or punctuation left over
    rawKey = rawKey
      .replace(/\s{2,}/g, " ")
      .replace(/ ,/g, ",")
      .trim();
    if (rawKey) keys.add(rawKey);
  }

  // Find <Trans>Some Text</Trans>
  while ((match = transRegex.exec(content))) {
    let text = match[1].replace(/\s+/g, " ").trim();
    text = text.replace(/\{\{.*?\}\}/g, "").trim();
    if (text) keys.add(text);
  }

  return Array.from(keys);
}

function saveToDatabase(keys) {
  const insertStmt = db.prepare(`
    INSERT INTO translations (lang_code, key, value)
    VALUES ('english', ?, ?)
    ON CONFLICT(lang_code, key) DO NOTHING
  `);

  for (const key of keys) {
    insertStmt.run(key, key); // default value same as key
  }
}

function main() {
  const allFiles = getAllFiles(pagesDir);

  const allKeys = new Set();
  for (const file of allFiles) {
    const keys = extractKeysFromFile(file);
    keys.forEach((k) => allKeys.add(k));
  }
  saveToDatabase([...allKeys]);
}

main();
