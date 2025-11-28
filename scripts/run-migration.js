import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("./database/database.sqlite");
const sql = fs.readFileSync("./better-auth_migrations/2025-11-13T06-17-58.173Z.sql", "utf8");

db.exec(sql);
