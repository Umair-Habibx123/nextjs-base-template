import { NextResponse } from "next/server";
import getDb from "../../../database/db";

export async function GET() {
  try {
    const db = await getDb();
    const rows = db.prepare("SELECT * FROM categories ORDER BY name").all();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
