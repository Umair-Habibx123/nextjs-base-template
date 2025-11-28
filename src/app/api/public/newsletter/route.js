//app/api/newsletter/route.js

import getDb from "../../../database/db";

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
