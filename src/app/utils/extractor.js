import fs from "fs";
import path from "path";
import getDb from "../database/db.js";

export async function extractTranslations() {
  const pagesDir = path.resolve("src/app/(pages)");
  const db = await getDb();


  const tRegex = /t\(\s*["'`]([^"'`]+)["'`]/g;
  const transRegex = /<Trans>(.*?)<\/Trans>/gs;

  // --- Helper: get all .jsx/.tsx files recursively
  function getAllFiles(dir, allFiles = []) {
    if (!fs.existsSync(dir)) return allFiles;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) getAllFiles(fullPath, allFiles);
      else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".tsx"))
        allFiles.push(fullPath);
    }
    return allFiles;
  }

  // --- Extract translation keys from file
  function extractKeysFromFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const keys = new Set();

    let match;
    while ((match = tRegex.exec(content))) {
      let rawKey = match[1].trim();
      rawKey = rawKey.replace(/\s{2,}/g, " ").replace(/ ,/g, ",").trim();
      if (rawKey) keys.add(rawKey);
    }

    while ((match = transRegex.exec(content))) {
      let text = match[1].replace(/\s+/g, " ").trim();
      if (text) keys.add(text);
    }

    return Array.from(keys);
  }

  // --- Save updates to DB
  function syncDatabase(allKeys) {
    const existingRows = db
      .prepare("SELECT key, value FROM translations WHERE lang_code = 'english'")
      .all();
    const existingKeys = new Set(existingRows.map((r) => r.key));

    const insertStmt = db.prepare(`
      INSERT INTO translations (lang_code, key, value)
      VALUES ('english', ?, ?)
      ON CONFLICT(lang_code, key) DO UPDATE SET value = excluded.value
    `);

    // 1️⃣ Insert or update
    for (const key of allKeys) {
      insertStmt.run(key, key);
    }

    // 2️⃣ Delete keys that no longer exist in code
    const obsolete = existingRows
      .filter((r) => !allKeys.has(r.key))
      .map((r) => r.key);

    if (obsolete.length > 0) {
      const delStmt = db.prepare(
        `DELETE FROM translations WHERE lang_code = 'english' AND key = ?`
      );
      const tx = db.transaction(() => {
        for (const key of obsolete) delStmt.run(key);
      });
      tx();
    }

    return {
      added: [...allKeys].filter((k) => !existingKeys.has(k)).length,
      updated: [...allKeys].filter((k) => existingKeys.has(k)).length,
      deleted: obsolete.length,
    };
  }

  // --- Main extraction
  const allFiles = getAllFiles(pagesDir);
  const allKeys = new Set();
  for (const file of allFiles) {
    const keys = extractKeysFromFile(file);
    keys.forEach((k) => allKeys.add(k));
  }

  const { added, updated, deleted } = syncDatabase(allKeys);

  return {
    files: allFiles.length,
    keys: allKeys.size,
    added,
    updated,
    deleted,
  };
}
