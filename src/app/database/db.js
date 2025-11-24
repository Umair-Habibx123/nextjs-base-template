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

CREATE TABLE IF NOT EXISTS user_profile (
  userId TEXT NOT NULL PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
  data TEXT NOT NULL, -- JSON string
  createdAt INTEGER,
  updatedAt INTEGER
);

-- CREATE TABLE IF NOT EXISTS user_meta (
  -- id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  -- field TEXT NOT NULL,
  -- value TEXT,
  -- UNIQUE (userId, field)
-- );



  CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expiresAt DATE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt DATE NOT NULL,
    updatedAt DATE NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
     activeOrganizationId TEXT,
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

CREATE TABLE IF NOT EXISTS organization (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  createdAt DATE NOT NULL,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS member (
  id TEXT NOT NULL PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  createdAt DATE NOT NULL
);


  CREATE TABLE IF NOT EXISTS invitation (
  id TEXT NOT NULL PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT,
  status TEXT NOT NULL,
  expiresAt DATE NOT NULL,
  inviterId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
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
  // const count = db
  //   .prepare("SELECT COUNT(*) AS c FROM announcement_settings")
  //   .get();
  // if (count.c === 0) {
  //   db.prepare(
  //     `
  //     INSERT INTO announcement_settings (theme, bg_color, text_color, speed)
  //     VALUES ('scroll-left', '#2563eb', '#ffffff', 25)
  //   `
  //   ).run();
  // }

  // const gsCount = db.prepare("SELECT COUNT(*) AS c FROM global_settings").get();
  // if (gsCount.c === 0) {
  //   db.prepare(
  //     `
  //   INSERT INTO global_settings 
  //   (site_password_enabled, site_under_construction, createdAt, updatedAt)
  //   VALUES (0, 0, strftime('%s','now'), strftime('%s','now'))
  // `
  //   ).run();
  // }

  // Add this after your existing database initialization code in getDb() function

  // Seed email templates
  const emailTemplates = [
    {
      name: "password-reset",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #007bff; 
      color: white; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 20px 0;
    }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
    .expiry-notice { 
      background-color: #fff3cd; 
      border: 1px solid #ffeaa7; 
      padding: 10px; 
      border-radius: 4px; 
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hello {{user.name}},</p>
    <p>You requested to reset your password. Click the button below to create a new password:</p>
    <a href="{{resetLink}}" class="button">Reset Password</a>
    <div class="expiry-notice">
      <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
    </div>
    <p>If you didn't request this reset, please ignore this email.</p>
  </div>
</body>
</html>
    `,
      json: JSON.stringify({
        canvasItems: [
          {
            id: 1,
            name: "Text",
            type: "element",
            content: "Password Reset Request",
            fontSize: "24px",
            color: "#000000",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 2,
            name: "Text",
            type: "element",
            content: "Hello {{user.name}},",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 3,
            name: "Text",
            type: "element",
            content:
              "You requested to reset your password. Click the button below to create a new password:",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 20,
            paddingLeft: 20,
          },
          {
            id: 4,
            name: "Button",
            type: "element",
            content: "Reset Password",
            fontSize: "16px",
            buttonColor: "#007bff",
            buttonShape: "rounded-lg",
            buttonUrl: "{{resetLink}}",
            alignment: "center",
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 5,
            name: "Text",
            type: "element",
            content: "This link will expire in 1 hour for security reasons.",
            fontSize: "14px",
            color: "#856404",
            backgroundColor: "#fff3cd",
            alignment: "center",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 6,
            name: "Text",
            type: "element",
            content:
              "If you didn't request this reset, please ignore this email.",
            fontSize: "14px",
            color: "#666666",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: [],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
        ],
        layoutRows: [],
        nextId: 7,
      }),
    },
    {
      name: "password-reset-confirmation",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .security-notice { 
      background-color: #d4edda; 
      border: 1px solid #c3e6cb; 
      padding: 10px; 
      border-radius: 4px; 
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Successful</h2>
    <p>Hello {{user.name}},</p>
    <div class="security-notice">
      <p><strong>Your password has been successfully reset.</strong></p>
    </div>
    <p>If you did not make this change, please contact support immediately.</p>
  </div>
</body>
</html>
    `,
      json: JSON.stringify({
        canvasItems: [
          {
            id: 1,
            name: "Text",
            type: "element",
            content: "Password Reset Successful",
            fontSize: "24px",
            color: "#000000",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 2,
            name: "Text",
            type: "element",
            content: "Hello {{user.name}},",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 3,
            name: "Text",
            type: "element",
            content: "Your password has been successfully reset.",
            fontSize: "16px",
            color: "#155724",
            backgroundColor: "#d4edda",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 15,
            paddingRight: 20,
            paddingBottom: 15,
            paddingLeft: 20,
          },
          {
            id: 4,
            name: "Text",
            type: "element",
            content:
              "If you did not make this change, please contact support immediately.",
            fontSize: "14px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: [],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
        ],
        layoutRows: [],
        nextId: 5,
      }),
    },
    {
      name: "email-verification",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .otp-box { 
      background-color: #f8f9fa; 
      border: 2px dashed #dee2e6; 
      padding: 20px; 
      text-align: center; 
      margin: 20px 0;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
    }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #28a745; 
      color: white; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email</h2>
    <p>Hello {{user.name}},</p>
    <p>Please use the following OTP to verify your email address:</p>
    <div class="otp-box">{{otp}}</div>
    <p>This OTP will expire in 10 minutes for security reasons.</p>
    <p>If you didn't request this verification, please ignore this email.</p>
  </div>
</body>
</html>
    `,
      json: JSON.stringify({
        canvasItems: [
          {
            id: 1,
            name: "Text",
            type: "element",
            content: "Verify Your Email",
            fontSize: "24px",
            color: "#000000",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 2,
            name: "Text",
            type: "element",
            content: "Hello {{user.name}},",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 3,
            name: "Text",
            type: "element",
            content:
              "Please use the following OTP to verify your email address:",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 4,
            name: "Text",
            type: "element",
            content: "{{otp}}",
            fontSize: "32px",
            color: "#000000",
            backgroundColor: "#f8f9fa",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 20,
            paddingLeft: 20,
          },
          {
            id: 5,
            name: "Text",
            type: "element",
            content: "This OTP will expire in 10 minutes for security reasons.",
            fontSize: "14px",
            color: "#666666",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
        ],
        layoutRows: [],
        nextId: 6,
      }),
    },
    {
      name: "login-otp",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .otp-box { 
      background-color: #f8f9fa; 
      border: 2px dashed #dee2e6; 
      padding: 20px; 
      text-align: center; 
      margin: 20px 0;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
    }
    .security-note { 
      background-color: #fff3cd; 
      border: 1px solid #ffeaa7; 
      padding: 10px; 
      border-radius: 4px; 
      margin: 15px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your Login OTP</h2>
    <p>Hello {{user.name}},</p>
    <p>Your OTP for login is:</p>
    <div class="otp-box">{{otp}}</div>
    <div class="security-note">
      <p><strong>Security Notice:</strong> This OTP will expire in 10 minutes. Do not share this code with anyone.</p>
    </div>
    <p>If you didn't request this login, please secure your account immediately.</p>
  </div>
</body>
</html>
    `,
      json: JSON.stringify({
        canvasItems: [
          {
            id: 1,
            name: "Text",
            type: "element",
            content: "Your Login OTP",
            fontSize: "24px",
            color: "#000000",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 2,
            name: "Text",
            type: "element",
            content: "Hello {{user.name}},",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 3,
            name: "Text",
            type: "element",
            content: "Your OTP for login is:",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 4,
            name: "Text",
            type: "element",
            content: "{{otp}}",
            fontSize: "32px",
            color: "#000000",
            backgroundColor: "#f8f9fa",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 20,
            paddingLeft: 20,
          },
          {
            id: 5,
            name: "Text",
            type: "element",
            content:
              "Security Notice: This OTP will expire in 10 minutes. Do not share this code with anyone.",
            fontSize: "14px",
            color: "#856404",
            backgroundColor: "#fff3cd",
            alignment: "center",
            fontStyles: [],
            paddingTop: 15,
            paddingRight: 20,
            paddingBottom: 15,
            paddingLeft: 20,
          },
        ],
        layoutRows: [],
        nextId: 6,
      }),
    },
  ];

//   // Insert seed templates
//   const templateStmt = db.prepare(`
//   INSERT OR REPLACE INTO email_templates (name, html, json, createdAt, updatedAt)
//   VALUES (?, ?, ?, strftime('%s','now'), strftime('%s','now'))
// `);

//   emailTemplates.forEach((template) => {
//     templateStmt.run(template.name, template.html, template.json);
//   });

//   console.log("✅ Email templates seeded successfully");

  return db;
}
