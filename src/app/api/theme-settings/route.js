import { NextResponse } from "next/server";
import getDb from "../../database/db";

// ✅ GET /api/themes — get all themes
export async function GET() {
  const db = await getDb();
  const rows = db.prepare("SELECT * FROM themes").all();
  return NextResponse.json(rows);
}

// ✅ POST /api/themes — create or update theme
export async function POST(req) {
  const data = await req.json();
  const { name, vars, visible = true } = data;

  if (!name || !vars) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await getDb();
  const now = Date.now();

  db.prepare(`
    INSERT INTO themes (name, vars, visible, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET 
      vars = excluded.vars, 
      visible = excluded.visible, 
      updatedAt = excluded.updatedAt
  `).run(name, JSON.stringify(vars), visible ? 1 : 0, now, now);

  return NextResponse.json({ success: true });
}

// ✅ DELETE /api/themes?name=themeName
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing theme name" }, { status: 400 });
  }

  const db = await getDb();
  db.prepare("DELETE FROM themes WHERE name = ?").run(name);

  return NextResponse.json({ success: true });
}

// ✅ PATCH /api/themes — rename theme
export async function PATCH(req) {
  const data = await req.json();
  const { oldName, newName } = data;

  if (!oldName || !newName) {
    return NextResponse.json({ error: "Missing theme names" }, { status: 400 });
  }

  const db = await getDb();

  const existing = db.prepare("SELECT * FROM themes WHERE name = ?").get(newName);
  if (existing) {
    return NextResponse.json({ error: "Theme with this name already exists" }, { status: 400 });
  }

  db.prepare("UPDATE themes SET name = ?, updatedAt = ? WHERE name = ?")
    .run(newName, Date.now(), oldName);

  return NextResponse.json({ success: true });
}
