import getDb from "../../../database/db";


export async function GET() {
  const db = await getDb();
  const rows = db.prepare("SELECT * FROM translations").all();

  // Group translations by language
  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.lang_code]) acc[row.lang_code] = {};
    acc[row.lang_code][row.key] = row.value || "";
    return acc;
  }, {});

  // Ensure English base exists
  if (!grouped.english) grouped.english = {};

  // Normalize keys so every language has all English keys
  const englishKeys = Object.keys(grouped.english);

  for (const lang of Object.keys(grouped)) {
    for (const key of englishKeys) {
      if (!(key in grouped[lang])) {
        grouped[lang][key] = ""; // empty untranslated
      }
    }
  }

  // Compute stats server-side
  const stats = Object.entries(grouped).map(([lang, data]) => {
    const totalKeys = englishKeys.length;
    const translatedCount = Object.values(data).filter(v => v && v.trim() !== "").length;
    const completion = totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;
    return { lang, totalKeys, translatedCount, completion };
  });

  return Response.json({ success: true, data: grouped, stats });
}



export async function POST(req) {
  const db = await getDb();
  const body = await req.json();
  const { lang_code, key, value } = body;

  if (!lang_code || !key) {
    return Response.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO translations (lang_code, key, value)
      VALUES (?, ?, ?)
      ON CONFLICT(lang_code, key) DO UPDATE SET value=excluded.value
    `);
    stmt.run(lang_code, key, value);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving translation:", error);
    return Response.json(
      { success: false, message: "Failed to save translation" },
      { status: 500 }
    );
  }
}