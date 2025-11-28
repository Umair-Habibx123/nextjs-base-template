import Database from "better-sqlite3";
import path from "path";
import { auth } from "@/lib/auth";

export async function seedDatabase() {
  const dbDir = path.join(process.cwd(), "database");
  const dbPath = path.join(dbDir, "database.sqlite");

  const db = new Database(dbPath);

  try {
 
    // Seed announcement settings
    const announcementSettingsCount = db
      .prepare("SELECT COUNT(*) AS c FROM announcement_settings")
      .get();

    if (announcementSettingsCount.c === 0) {
      db.prepare(
        `INSERT INTO announcement_settings (theme, bg_color, text_color, speed) 
         VALUES ('scroll-left', '#2563eb', '#ffffff', 25)`
      ).run();
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
    }

    // Seed email templates
    await seedEmailTemplates(db);

    // Seed default content (blogs, projects, etc.)
    await seedDefaultContent(db);

    // Seed users
    await seedUsers();

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

    {
      name: "magic-link",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f6f9fc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header { 
      text-align: center; 
      padding: 20px 0;
      border-bottom: 1px solid #eaeaea;
    }
    .button { 
      display: inline-block; 
      padding: 14px 28px; 
      background-color: #007bff; 
      color: white; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 25px 0;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
    }
    .security-notice { 
      background-color: #fff3cd; 
      border: 1px solid #ffeaa7; 
      padding: 15px; 
      border-radius: 6px; 
      margin: 20px 0;
      font-size: 14px;
    }
    .footer { 
      margin-top: 30px; 
      font-size: 12px; 
      color: #666; 
      text-align: center;
      border-top: 1px solid #eaeaea;
      padding-top: 20px;
    }
    .expiry-notice { 
      background-color: #e7f3ff; 
      border: 1px solid #b3d9ff; 
      padding: 12px; 
      border-radius: 4px; 
      margin: 15px 0;
      text-align: center;
    }
    .code-container {
      background-color: #f8f9fa;
      border: 1px dashed #dee2e6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      word-break: break-all;
      font-family: monospace;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #2c3e50;">Magic Link Sign In</h2>
    </div>
    
    <p>Hello,</p>
    
    <p>You requested a magic link to sign in to your account. Click the button below to securely log in:</p>
    
    <div style="text-align: center;">
      <a href="{{url}}" class="button">Sign In Securely</a>
    </div>

    <div class="expiry-notice">
      <p style="margin: 0;"><strong>This magic link will expire in 5 minutes</strong> for security reasons.</p>
    </div>

    <div class="security-notice">
      <p style="margin: 0 0 10px 0;"><strong>Security Notice:</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>This link can only be used once</li>
        <li>Never share this link with anyone</li>
        <li>If you didn't request this sign in, please ignore this email</li>
      </ul>
    </div>

    <p><strong>Alternative method:</strong> If the button doesn't work, copy and paste this URL into your browser:</p>
    
    <div class="code-container">
      {{url}}
    </div>

    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; ${new Date().getFullYear()} ${
        "Your App"
      }. All rights reserved.</p>
    </div>
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
            content: "Magic Link Sign In",
            fontSize: "28px",
            color: "#2c3e50",
            backgroundColor: "#ffffff",
            alignment: "center",
            fontStyles: ["bold"],
            paddingTop: 30,
            paddingRight: 20,
            paddingBottom: 15,
            paddingLeft: 20,
          },
          {
            id: 2,
            name: "Text",
            type: "element",
            content: "Hello,",
            fontSize: "16px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 3,
            name: "Text",
            type: "element",
            content:
              "You requested a magic link to sign in to your account. Click the button below to securely log in:",
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
            content: "Sign In Securely",
            fontSize: "16px",
            buttonColor: "#007bff",
            buttonShape: "rounded-lg",
            buttonUrl: "{{url}}",
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
            content:
              "This magic link will expire in 5 minutes for security reasons.",
            fontSize: "14px",
            color: "#004085",
            backgroundColor: "#e7f3ff",
            alignment: "center",
            fontStyles: [],
            paddingTop: 15,
            paddingRight: 20,
            paddingBottom: 15,
            paddingLeft: 20,
          },
          {
            id: 6,
            name: "Text",
            type: "element",
            content: "Security Notice:",
            fontSize: "16px",
            color: "#856404",
            backgroundColor: "#fff3cd",
            alignment: "left",
            fontStyles: ["bold"],
            paddingTop: 15,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 7,
            name: "Text",
            type: "element",
            content:
              "• This link can only be used once\n• Never share this link with anyone\n• If you didn't request this sign in, please ignore this email",
            fontSize: "14px",
            color: "#856404",
            backgroundColor: "#fff3cd",
            alignment: "left",
            fontStyles: [],
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 15,
            paddingLeft: 20,
          },
          {
            id: 8,
            name: "Text",
            type: "element",
            content:
              "Alternative method: If the button doesn't work, copy and paste this URL into your browser:",
            fontSize: "14px",
            color: "#333333",
            backgroundColor: "#ffffff",
            alignment: "left",
            fontStyles: [],
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
          },
          {
            id: 9,
            name: "Text",
            type: "element",
            content: "{{url}}",
            fontSize: "12px",
            color: "#000000",
            backgroundColor: "#f8f9fa",
            alignment: "center",
            fontStyles: [],
            paddingTop: 15,
            paddingRight: 20,
            paddingBottom: 15,
            paddingLeft: 20,
          },
          {
            id: 10,
            name: "Text",
            type: "element",
            content:
              "This is an automated email. Please do not reply to this message.",
            fontSize: "12px",
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
        nextId: 11,
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

}

async function seedUsers() {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const adminName = process.env.SUPER_ADMIN_NAME;

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
      app_role: "superadmin",
      emailVerified: true,
      image:
        "https://tse4.mm.bing.net/th/id/OIP.5-Bgjm2pNzA2mLrHsB6V3gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  });

  // const userRes = await createSafeUser({
  //   email: userEmail,
  //   password: userPassword,
  //   name: userName,
  //   role: "user",
  //   app_role: "user",
  //   data: {
  //     image:
  //       "https://tse3.mm.bing.net/th/id/OIP.N6HHUrNv4bsSKj5VVZXsMAHaHQ?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
  //   },
  // });

  return Response.json({
    success: true,
    admin: adminRes,
    // user: userRes,
    message: "Users seeding completed",
  });
}
