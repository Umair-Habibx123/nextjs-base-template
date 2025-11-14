import getDb from "../../../../database/db";

export async function GET() {
  try {
    const db = await getDb();
    const settings = db.prepare("SELECT * FROM announcement_settings LIMIT 1").get();
    return Response.json({ success: true, data: settings });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function PUT(req) {
  try {
    const { theme, bg_color, text_color, speed, custom_html, custom_css } = await req.json();
    const db = await getDb();
    db.prepare(`
      UPDATE announcement_settings
      SET theme=?, bg_color=?, text_color=?, speed=?, custom_html=?, custom_css=?, updatedAt=?
      WHERE id=1
    `).run(theme, bg_color, text_color, speed, custom_html, custom_css, Date.now());
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
