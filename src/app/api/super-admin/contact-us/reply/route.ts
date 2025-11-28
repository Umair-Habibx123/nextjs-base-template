import getDb from "../../../../database/db";
import { sendEmail } from "../../../../utils/emails/sendEmail";
import { requireAuth } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Only superadmins can reply to contact messages
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { contact_id, subject, body, template_name, html } = await req.json();

    if (!contact_id || !subject || (!body && !html)) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Fetch contact
    const contact = db
      .prepare(`SELECT * FROM contacts WHERE id = ?`)
      .get(contact_id);

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    // Save reply
    db.prepare(
      `INSERT INTO contact_replies (contact_id, subject, body, createdAt)
       VALUES (?, ?, ?, ?)`
    ).run(contact_id, subject, html || "(HTML email)", Date.now());

    // Mark contact as replied
    db.prepare(`UPDATE contacts SET replied = 1 WHERE id = ?`).run(contact_id);

    // Load email template
    const selectedName = template_name || "Default";
    const template = db
      .prepare(`SELECT html FROM email_templates WHERE name = ?`)
      .get(selectedName);

    if (!template) {
      console.error(`❌ Template "${selectedName}" not found`);
      return NextResponse.json(
        {
          success: false,
          message: `Email template "${selectedName}" not found.`,
        },
        { status: 404 }
      );
    }

    // Prepare HTML
    const finalHTML =
      html && html.trim().length > 0
        ? html
        : template.html
            .replace(/{{name}}/g, contact.name || "")
            .replace(/{{body}}/g, body || "")
            .replace(/{{subject}}/g, subject || "");

    // Send email
    const emailResult = await sendEmail(contact.email, subject, finalHTML);

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? "Reply sent successfully!"
        : "Reply saved, but email delivery failed.",
    });
  } catch (err: any) {
    console.error("Reply save error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save or send reply" },
      { status: 500 }
    );
  }
}

// 🔐 SECURE GET (View replies for one contact)
export async function GET(req: NextRequest) {
  // Only superadmins can view replies
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contact_id");

    if (!contactId) {
      return NextResponse.json(
        { success: false, message: "Missing contact_id" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const replies = db
      .prepare(
        `SELECT * FROM contact_replies 
         WHERE contact_id = ?
         ORDER BY createdAt DESC`
      )
      .all(contactId);

    return NextResponse.json({ success: true, data: replies });
  } catch (err: any) {
    console.error("Failed to load replies:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load replies" },
      { status: 500 }
    );
  }
}
