import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_USE_SSL === "true", // false for TLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});


/**
 * Send an email using a prepared HTML template.
 */
export async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return { success: false, error: error.message };
  }
}