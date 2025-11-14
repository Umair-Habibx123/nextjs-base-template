import getDb from "../../database/db";

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message)
      return new Response(JSON.stringify({ error: "All fields are required." }), { status: 400 });

    const db = await getDb();
    db.prepare(
      `INSERT INTO contacts (name, email, message, createdAt) VALUES (?, ?, ?, ?)`
    ).run(name, email, message, Date.now());

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(JSON.stringify({ error: "Failed to save message." }), { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = db.prepare(`SELECT * FROM contacts ORDER BY createdAt DESC`).all();

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to fetch contacts:", err);
    return new Response(JSON.stringify({ error: "Failed to load contacts" }), {
      status: 500,
    });
  }
}
