import getDb from "../../../../database/db";

export async function GET() {
  try {
    const db = await getDb();
    const templates = db.prepare("SELECT * FROM announcement_templates ORDER BY createdAt DESC").all();
    return Response.json({ success: true, data: templates });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function POST(req) {
  try {
    const { name, html, css } = await req.json();
    const db = await getDb();
    db.prepare(`
      INSERT INTO announcement_templates (name, html, css, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, html, css, Date.now(), Date.now());
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function PUT(req) {
  try {
    const { id, name, html, css } = await req.json();
    const db = await getDb();
    db.prepare(`
      UPDATE announcement_templates SET name=?, html=?, css=?, updatedAt=?
      WHERE id=?
    `).run(name, html, css, Date.now(), id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const db = await getDb();
    db.prepare("DELETE FROM announcement_templates WHERE id=?").run(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
