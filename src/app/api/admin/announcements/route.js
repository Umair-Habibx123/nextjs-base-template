import getDb from "../../../database/db";

export async function GET() {
  try {
    const db = await getDb();
    const rows = db.prepare("SELECT * FROM announcements ORDER BY createdAt DESC").all();
    return Response.json({ success: true, data: rows });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function POST(req) {
  try {
    const { text } = await req.json();
    const db = await getDb();
    db.prepare(`
      INSERT INTO announcements (text, is_active, createdAt, updatedAt)
      VALUES (?, 1, ?, ?)
    `).run(text, Date.now(), Date.now());
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function PUT(req) {
  try {
    const { id, text, is_active } = await req.json();
    const db = await getDb();
    db.prepare(`
      UPDATE announcements SET text=?, is_active=?, updatedAt=? WHERE id=?
    `).run(text, is_active ? 1 : 0, Date.now(), id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const db = await getDb();
    db.prepare("DELETE FROM announcements WHERE id=?").run(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
