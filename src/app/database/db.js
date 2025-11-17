import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db;

export default async function getDb() {
  if (db) return db;

  const dbDir = path.join(process.cwd(), "database");
  const dbPath = path.join(dbDir, "database.sqlite");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log("✅ Database directory created:", dbDir);
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`

  -- 🧩 BETTER AUTH TABLES

  CREATE TABLE IF NOT EXISTS user (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL,
  image TEXT,
  role TEXT,
  banned INTEGER,
  banReason TEXT,
  banExpires DATE,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL
);

  CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expiresAt DATE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt DATE NOT NULL,
    updatedAt DATE NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    impersonatedBy TEXT,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT NOT NULL PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt DATE,
    refreshTokenExpiresAt DATE,
    scope TEXT,
    password TEXT,
    createdAt DATE NOT NULL,
    updatedAt DATE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT NOT NULL PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt DATE NOT NULL,
    createdAt DATE NOT NULL,
    updatedAt DATE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS analytics_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT,
    fingerprint TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    path TEXT,
    referrer TEXT,
    day TEXT,
    visits INTEGER DEFAULT 1,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lang_code TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    UNIQUE(lang_code, key)
  );

  CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    vars TEXT,
    visible INTEGER DEFAULT 1,
    createdAt INTEGER,
    updatedAt INTEGER
  );



  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    replied INTEGER DEFAULT 0,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS contact_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    subject TEXT,
    body TEXT,
    createdAt INTEGER,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    html TEXT,
    json TEXT,
    createdAt INTEGER,
    updatedAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    createdAt INTEGER,
    updatedAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS announcement_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme TEXT DEFAULT 'scroll-left',
    bg_color TEXT DEFAULT '#2563eb',
    text_color TEXT DEFAULT '#ffffff',
    speed INTEGER DEFAULT 25,
    custom_html TEXT,
    custom_css TEXT,
    updatedAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS announcement_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    html TEXT,
    css TEXT,
    createdAt INTEGER,
    updatedAt INTEGER
  );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  -- 📰 BLOGS
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    excerpt TEXT,
    content_html TEXT,              -- main story (HTML from rich text)
    content_json TEXT,              -- raw JSON from editor
    author_id INTEGER,
    status TEXT DEFAULT 'draft',    -- 'draft' | 'published'
    order_number INTEGER DEFAULT NULL,
    is_featured INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    createdAt INTEGER,
    updatedAt INTEGER,
    published_at INTEGER,
    FOREIGN KEY (author_id) REFERENCES user(id)
  );


    CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    excerpt TEXT,
    content_html TEXT,              -- main story (HTML from rich text)
    content_json TEXT,              -- raw JSON from editor
    author_id INTEGER,
    status TEXT DEFAULT 'draft',    -- 'draft' | 'published'
    order_number INTEGER DEFAULT NULL,
    is_featured INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    createdAt INTEGER,
    updatedAt INTEGER,
    published_at INTEGER,
    FOREIGN KEY (author_id) REFERENCES user(id)
  );


    CREATE TABLE IF NOT EXISTS case_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    excerpt TEXT,
    content_html TEXT,              -- main story (HTML from rich text)
    content_json TEXT,              -- raw JSON from editor
    author_id INTEGER,
    status TEXT DEFAULT 'draft',    -- 'draft' | 'published'
    order_number INTEGER DEFAULT NULL,
    is_featured INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    createdAt INTEGER,
    updatedAt INTEGER,
    published_at INTEGER,
    FOREIGN KEY (author_id) REFERENCES user(id)
  );


  -- 🌿 RELATIONS (shared)
  CREATE TABLE IF NOT EXISTS blog_tags (
    blog_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (blog_id, tag_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS blog_categories (
    blog_id INTEGER,
    category_id INTEGER,
    PRIMARY KEY (blog_id, category_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_tags (
  project_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (project_id, tag_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_categories (
  project_id INTEGER,
  category_id INTEGER,
  PRIMARY KEY (project_id, category_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );


  CREATE TABLE IF NOT EXISTS case_studies_tags (
  case_studies_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (case_studies_id, tag_id),
  FOREIGN KEY (case_studies_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS case_studies_categories (
  case_studies_id INTEGER,
  category_id INTEGER,
  PRIMARY KEY (case_studies_id, category_id),
  FOREIGN KEY (case_studies_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );


  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    uploaded_at INTEGER
  );


  CREATE TABLE IF NOT EXISTS global_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_logo TEXT,
  site_favicon TEXT,
  site_password_enabled INTEGER DEFAULT 0,
  site_password TEXT DEFAULT 'demo123',
  site_under_construction INTEGER DEFAULT 0,
  createdAt INTEGER,
  updatedAt INTEGER
);

 `);

  // Insert announcement settings default
  const count = db
    .prepare("SELECT COUNT(*) AS c FROM announcement_settings")
    .get();
  if (count.c === 0) {
    db.prepare(
      `
      INSERT INTO announcement_settings (theme, bg_color, text_color, speed)
      VALUES ('scroll-left', '#2563eb', '#ffffff', 25)
    `
    ).run();
  }

  const gsCount = db.prepare("SELECT COUNT(*) AS c FROM global_settings").get();
  if (gsCount.c === 0) {
    db.prepare(
      `
    INSERT INTO global_settings 
    (site_password_enabled, site_under_construction, createdAt, updatedAt)
    VALUES (0, 0, strftime('%s','now'), strftime('%s','now'))
  `
    ).run();
  }

  return db;
}
