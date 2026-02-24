import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@contact.trinit.me";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendInvitationEmail({
  to,
  senderName,
  token,
}: {
  to: string;
  senderName: string;
  token: string;
}) {
  const signUpUrl = `${APP_URL}/chat?invite=${token}`;

  const { data, error } = await resend.emails.send({
    from: `Trinit <${FROM_EMAIL}>`,
    to,
    subject: `${senderName} invited you to Trinit`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/trinit_logo.jpg" alt="Trinit" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />
        </div>
        <h1 style="font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 8px; color: #111;">You're invited!</h1>
        <p style="color: #666; text-align: center; margin-bottom: 32px; font-size: 15px;">
          <strong>${senderName}</strong> wants to share transactions with you on Trinit.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${signUpUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #999; text-align: center; font-size: 12px;">
          Or copy this link: <a href="${signUpUrl}" style="color: #666;">${signUpUrl}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
