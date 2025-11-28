import { seedDatabase } from "@/app/utils/seed-database";
import getDb from "../app/database/db";

export async function initDatabase() {
  const db = getDb();

  // check if already seeded
  const row = db.prepare("SELECT value FROM _meta WHERE key='seeded'").get();

  if (row?.value === "yes") return;

  await seedDatabase();

  db.prepare(
    "INSERT OR REPLACE INTO _meta (key, value) VALUES ('seeded', 'yes')"
  ).run();
  
}
