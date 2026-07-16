export type AuthEmailType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email"
  | "change-password";

const layout = (title: string, message: string, code: string, accent: string) => `
<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden">
      <div style="height:8px;background:${accent}"></div>
      <div style="padding:32px">
        <h1 style="margin:0 0 16px;font-size:24px">${title}</h1>
        <p style="line-height:1.6;color:#52525b">${message}</p>
        <div style="margin:28px 0;padding:18px;text-align:center;background:#f4f4f5;border-radius:12px;font-size:32px;font-weight:700;letter-spacing:8px">${code}</div>
        <p style="font-size:13px;color:#71717a">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    </div>
  </body>
</html>`;

const templates: Record<AuthEmailType, { subject: string; html: (code: string) => string }> = {
  "email-verification": {
    subject: "Verify your AnonChat account",
    html: (code) =>
      layout("Welcome to AnonChat", "Use this code to verify your email and finish creating your account.", code, "#7c3aed"),
  },
  "sign-in": {
    subject: "Your AnonChat login code",
    html: (code) =>
      layout("Sign in to AnonChat", "Enter this one-time code to securely sign in to your account.", code, "#2563eb"),
  },
  "forget-password": {
    subject: "Reset your AnonChat password",
    html: (code) =>
      layout("Password reset requested", "Use this code to choose a new password. Ignore this email if you did not request a reset.", code, "#dc2626"),
  },
  "change-email": {
    subject: "Confirm your new AnonChat email",
    html: (code) =>
      layout("Confirm email change", "Use this code to confirm that this email address belongs to you.", code, "#0891b2"),
  },
  "change-password": {
    subject: "Confirm your AnonChat password change",
    html: (code) =>
      layout("Confirm password change", "Use this code together with your current password to approve the password change.", code, "#d97706"),
  },
};

export function getAuthEmailTemplate(type: AuthEmailType, code: string) {
  const template = templates[type];
  return {
    subject: template.subject,
    html: template.html(code),
    text: `${template.subject}. Your code is ${code}. It expires in 10 minutes.`,
  };
}
