import getDb from "../../../../database/db";

export async function DELETE(req, context) {
  const { params } = await context;
  const db = await getDb();

  db.prepare("DELETE FROM translations WHERE lang_code = ?").run(params.lang);

  return Response.json({ success: true });
}
