import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { auth } from "@/lib/auth";

export async function seedDatabase() {
  const dbDir = path.join(process.cwd(), "database");
  const dbPath = path.join(dbDir, "database.sqlite");

  const db = new Database(dbPath);

  try {
    console.log("🌱 Starting database seeding...");

    // Seed announcement settings
    const announcementSettingsCount = db
      .prepare("SELECT COUNT(*) AS c FROM announcement_settings")
      .get();

    if (announcementSettingsCount.c === 0) {
      db.prepare(
        `INSERT INTO announcement_settings (theme, bg_color, text_color, speed) 
         VALUES ('scroll-left', '#2563eb', '#ffffff', 25)`
      ).run();
      console.log("✅ Announcement settings seeded");
    }

    // Seed global settings
    const globalSettingsCount = db
      .prepare("SELECT COUNT(*) AS c FROM global_settings")
      .get();
    if (globalSettingsCount.c === 0) {
      db.prepare(
        `INSERT INTO global_settings 
         (site_password_enabled, site_under_construction, createdAt, updatedAt)
         VALUES (0, 0, strftime('%s','now'), strftime('%s','now'))`
      ).run();
      console.log("✅ Global settings seeded");
    }

    // Seed email templates
    await seedEmailTemplates(db);

    // Seed default content (blogs, projects, etc.)
    await seedDefaultContent(db);

    // Seed users
    await seedUsers();

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  } finally {
    db.close();
  }
}

async function seedEmailTemplates(db) {
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

  const templateStmt = db.prepare(`
    INSERT OR REPLACE INTO email_templates (name, html, json, createdAt, updatedAt)
    VALUES (?, ?, ?, strftime('%s','now'), strftime('%s','now'))
  `);

  emailTemplates.forEach((template) => {
    templateStmt.run(template.name, template.html, template.json);
  });

  console.log("✅ Email templates seeded");
}

async function seedDefaultContent(db) {
  // Seed default tags
  const defaultTags = [
    "Technology",
    "Design",
    "Development",
    "Business",
    "Marketing",
  ];
  const tagStmt = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
  defaultTags.forEach((tag) => tagStmt.run(tag));

  // Seed default categories
  const defaultCategories = [
    "Web Development",
    "Mobile App",
    "UI/UX",
    "Consulting",
  ];
  const categoryStmt = db.prepare(
    "INSERT OR IGNORE INTO categories (name) VALUES (?)"
  );
  defaultCategories.forEach((category) => categoryStmt.run(category));

  console.log("✅ Default content seeded");
}

async function seedUsers() {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const adminName = process.env.SUPER_ADMIN_NAME;

  const userEmail = process.env.DEFAULT_USER_EMAIL;
  const userPassword = process.env.DEFAULT_USER_PASSWORD;
  const userName = process.env.DEFAULT_USER_NAME;

  const createSafeUser = async (payload) => {
    try {
      const res = await auth.api.createUser({
        method: "POST",
        body: payload,
      });
      return { created: true, user: res.user };
    } catch (err) {
      if (/exist/i.test(err.message)) return { created: false, exists: true };
      return { created: false, error: err.message };
    }
  };

  const adminRes = await createSafeUser({
    email: adminEmail,
    password: adminPassword,
    name: adminName,
    role: "superadmin",
    data: {
      image:
        "https://tse4.mm.bing.net/th/id/OIP.5-Bgjm2pNzA2mLrHsB6V3gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  });

  const userRes = await createSafeUser({
    email: userEmail,
    password: userPassword,
    name: userName,
    role: "user",
    data: {
      image:
        "https://tse3.mm.bing.net/th/id/OIP.N6HHUrNv4bsSKj5VVZXsMAHaHQ?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  });
  console.log("✅ Users seeded");

  return Response.json({
    success: true,
    admin: adminRes,
    user: userRes,
    message: "Users seeding completed",
  });
}
