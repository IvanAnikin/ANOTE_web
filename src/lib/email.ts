import nodemailer from "nodemailer";
import type { Submission } from "./submissions";

const transporter =
  process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

export async function sendContactNotification(
  submission: Submission,
  recipients: string[],
): Promise<void> {
  if (!transporter) {
    console.warn(
      "SMTP not configured — skipping email notification. Set SMTP_HOST, SMTP_USER, SMTP_PASS.",
    );
    return;
  }

  const html = `
<h2>Nový kontaktní formulář – ANOTE</h2>
<table style="border-collapse:collapse;">
  <tr><td style="padding:4px 12px;font-weight:bold;">Jméno</td><td style="padding:4px 12px;">${esc(submission.name)}</td></tr>
  <tr><td style="padding:4px 12px;font-weight:bold;">Email</td><td style="padding:4px 12px;">${esc(submission.email)}</td></tr>
  <tr><td style="padding:4px 12px;font-weight:bold;">Telefon</td><td style="padding:4px 12px;">${esc(submission.phone || "—")}</td></tr>
  <tr><td style="padding:4px 12px;font-weight:bold;">Zpráva</td><td style="padding:4px 12px;">${esc(submission.message || "—")}</td></tr>
  <tr><td style="padding:4px 12px;font-weight:bold;">Čas</td><td style="padding:4px 12px;">${submission.timestamp}</td></tr>
</table>
`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: recipients.join(", "),
    subject: `ANOTE – nový kontakt: ${submission.name}`,
    html,
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
