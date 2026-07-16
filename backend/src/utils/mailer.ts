import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!gmailUser || !gmailAppPassword) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be configured");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `AnonChat <${gmailUser}>`,
    ...options,
  });
}

export async function verifyMailerConnection(): Promise<boolean> {
  if (!gmailUser || !gmailAppPassword) return false;

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("[Mailer] connection check failed", error);
    return false;
  }
}
