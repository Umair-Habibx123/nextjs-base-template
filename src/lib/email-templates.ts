// src/lib/email-templates.ts
import { sendEmail } from "@/app/utils/emails/sendEmail";
import getDb from "../app/database/db";

export async function getEmailTemplate(name: string) {
  const db = await getDb();

  try {
    const template = db
      .prepare("SELECT * FROM email_templates WHERE name = ?")
      .get(name);

    return template || null;
  } catch (error) {
    console.error("Error loading email template:", error);
    return null;
  }
}

export function renderTemplate(
  templateHtml: string,
  variables: Record<string, any> = {}
) {
  let renderedHtml = templateHtml;

  // Replace all {{variable}} placeholders
  Object.keys(variables).forEach((key) => {
    const placeholder = `{{${key}}}`;
    const value = variables[key] || "";
    renderedHtml = renderedHtml.replace(new RegExp(placeholder, "g"), value);
  });

  // Handle nested user object
  if (variables.user) {
    renderedHtml = renderedHtml.replace(/{{user\.(\w+)}}/g, (match, field) => {
      return variables.user[field] || "";
    });
  }

  // Clean up any unreplaced variables
  renderedHtml = renderedHtml.replace(/\{\{[\w\.]+\}\}/g, "");

  return renderedHtml;
}

export async function sendTemplatedEmail({
  to,
  templateName,
  variables = {},
  subject = null,
}: {
  to: string;
  templateName: string;
  variables?: Record<string, any>;
  subject?: string | null;
}) {
  try {
    // Load template from database
    const template = await getEmailTemplate(templateName);

    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Render template with variables
    const html = renderTemplate(template.html, variables);

    // Determine subject - use template name as fallback
    const emailSubject =
      subject ||
      variables.subject ||
      templateName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Send email using your existing sendEmail function
    const result = await sendEmail(to, emailSubject, html);

    return {
      success: true,
      templateUsed: templateName,
      result,
    };
  } catch (error) {
    console.error("Error sending templated email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
