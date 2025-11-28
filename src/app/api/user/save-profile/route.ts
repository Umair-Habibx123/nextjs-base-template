import getDb from "../../../database/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {

  try {
    const { email, data } = await req.json();
    const db = await getDb();

    const user = db.prepare("SELECT id FROM user WHERE email = ?").get(email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    db.prepare(
      `
      INSERT INTO user_profile (userId, data, createdAt, updatedAt)
      VALUES (?, ?, strftime('%s','now'), strftime('%s','now'))
      ON CONFLICT(userId) DO UPDATE SET
        data = excluded.data,
        updatedAt = excluded.updatedAt
    `
    ).run(userId, JSON.stringify(data));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
