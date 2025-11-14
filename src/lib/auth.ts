// src/lib/auth.ts

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
  // SQLite DB
  database: new Database("./database/database.sqlite"),
  secret: process.env.BETTER_AUTH_SECRET,

  // Enable email/password login
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    // expiresIn: 60, // 1 min for testing
  },
  plugins: [nextCookies(), admin()],
});

// Correct way to infer types in Better Auth
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
