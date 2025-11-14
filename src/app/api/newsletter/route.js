//app/api/newsletter/route.js

import getDb from "../../database/db";


// ➕ Subscribe a new email
export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return Response.json(
        { success: false, message: "Email required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = db
      .prepare("SELECT id FROM newsletter_subscribers WHERE email = ?")
      .get(email);

    if (existing) {
      return Response.json(
        { success: false, message: "Already subscribed" },
        { status: 409 }
      );
    }

    db.prepare(
      "INSERT INTO newsletter_subscribers (email, createdAt) VALUES (?, ?)"
    ).run(email, Date.now());

    return Response.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return Response.json(
      { success: false, message: "Internal error" },
      { status: 500 }
    );
  }
}

// 📋 Fetch all subscribers
export async function GET() {
  try {
    const db = await getDb();
    const rows = db
      .prepare("SELECT * FROM newsletter_subscribers ORDER BY createdAt DESC")
      .all();
    return Response.json({ success: true, data: rows });
  } catch (err) {
    console.error("Newsletter fetch error:", err);
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ❌ Delete selected subscribers (new)
export async function DELETE(req) {
  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return Response.json(
        { success: false, message: "No emails provided for deletion." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const placeholders = emails.map(() => "?").join(",");
    const stmt = db.prepare(
      `DELETE FROM newsletter_subscribers WHERE email IN (${placeholders})`
    );
    const result = stmt.run(...emails);

    if (result.changes > 0) {
      return Response.json({
        success: true,
        message: `Deleted ${result.changes} subscriber(s).`,
      });
    } else {
      return Response.json({
        success: false,
        message: "No matching subscribers found.",
      });
    }
  } catch (err) {
    console.error("Newsletter delete error:", err);
    return Response.json(
      { success: false, message: "Failed to delete subscribers." },
      { status: 500 }
    );
  }
}
