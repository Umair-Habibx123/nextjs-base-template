import getDb from "../../../database/db";
import { sendEmail } from "../../../utils/emails/sendEmail";


export async function POST(req) {
  try {
    const { subject, body, template_name, html, emails } = await req.json();

    if (!subject || (!body && !html)) {
      return Response.json(
        { success: false, message: "Subject and content are required." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // ✅ If specific emails provided
    let subscribers;
    if (emails && Array.isArray(emails) && emails.length > 0) {
      subscribers = emails.map((email) => ({ email }));
    } else {
      // Otherwise send to all
      subscribers = db
        .prepare("SELECT email FROM newsletter_subscribers")
        .all();
    }

    if (!subscribers || subscribers.length === 0) {
      return Response.json(
        { success: false, message: "No valid subscribers found." },
        { status: 404 }
      );
    }

    // ✅ Load template
    const selectedName = template_name || "Default";
    const template = db
      .prepare("SELECT html FROM email_templates WHERE name = ?")
      .get(selectedName);

    if (!template) {
      return Response.json(
        { success: false, message: `Template '${selectedName}' not found.` },
        { status: 404 }
      );
    }

    // ✅ Send emails
    let sentCount = 0;
    for (const { email } of subscribers) {
      const finalHTML =
        html && html.trim().length > 0
          ? html
          : template.html
              .replace(/{{body}}/g, body || "")
              .replace(/{{subject}}/g, subject || "");

      const res = await sendEmail(email, subject, finalHTML);
      if (res.success) sentCount++;
    }

    return Response.json({
      success: true,
      message: `Newsletter sent to ${sentCount}/${subscribers.length} selected subscribers.`,
    });
  } catch (err) {
    console.error("Newsletter send error:", err);
    return Response.json(
      { success: false, message: "Failed to send newsletter." },
      { status: 500 }
    );
  }
}
