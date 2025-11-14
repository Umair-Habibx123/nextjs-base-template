import getDb from "../../../database/db";
import { sendEmail } from "../../../utils/emails/sendEmail";

export async function POST(req) {
  try {
    const { contact_id, subject, body, template_name, html } = await req.json();

    // ✅ Allow sending either raw body or full HTML
    if (!contact_id || !subject || (!body && !html)) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // ✅ Fetch contact info
    const contact = db
      .prepare(`SELECT * FROM contacts WHERE id = ?`)
      .get(contact_id);

    if (!contact) {
      return Response.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    db.prepare(
      `INSERT INTO contact_replies (contact_id, subject, body, createdAt)
   VALUES (?, ?, ?, ?)`
    ).run(contact_id, subject, html || "(HTML email)", Date.now());

    db.prepare(`UPDATE contacts SET replied = 1 WHERE id = ?`).run(contact_id);

    // ✅ Load selected template
    const selectedName = template_name || "Default";
    const template = db
      .prepare(`SELECT html FROM email_templates WHERE name = ?`)
      .get(selectedName);

    if (!template) {
      console.error(`❌ Template "${selectedName}" not found in DB`);
      return Response.json(
        {
          success: false,
          message: `Email template "${selectedName}" not found.`,
        },
        { status: 404 }
      );
    }

    // ✅ Prepare final HTML content
    const finalHTML =
      html && html.trim().length > 0
        ? html // use live-edited HTML from modal
        : template.html
            .replace(/{{name}}/g, contact.name || "")
            .replace(/{{body}}/g, body || "")
            .replace(/{{subject}}/g, subject || "");

    // ✅ Send email
    const emailResult = await sendEmail(contact.email, subject, finalHTML);

    return Response.json({
      success: true,
      message: emailResult.success
        ? "Reply sent and email delivered successfully!"
        : "Reply saved, but email delivery failed.",
    });
  } catch (err) {
    console.error("Reply save error:", err);
    return Response.json(
      { success: false, message: "Failed to save or send reply" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contact_id");

    if (!contactId) {
      return Response.json(
        { success: false, message: "Missing contact_id" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const replies = db
      .prepare(
        `SELECT * FROM contact_replies WHERE contact_id = ? ORDER BY createdAt DESC`
      )
      .all(contactId);

    return Response.json({ success: true, data: replies });
  } catch (err) {
    console.error("Failed to load replies:", err);
    return Response.json(
      { success: false, message: "Failed to load replies" },
      { status: 500 }
    );
  }
}
