import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestPost() {
  const testEmail = process.argv[2] || "test@example.com";
  const subject = process.argv[3] || "Weekly Finance Digest";
  const body = process.argv[4] || "This is a test digest from Trinit.";

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@trinit.com",
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000;">Trinit</h1>
          <h2 style="color: #333;">${subject}</h2>
          <div style="color: #555; line-height: 1.6;">${body}</div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This is a test email. In production, an unsubscribe link would appear here.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send:", error);
      process.exit(1);
    }

    console.log(`[TEST] Email sent successfully! ID: ${data?.id}`);
    console.log(`To: ${testEmail}`);
    console.log(`Subject: [TEST] ${subject}`);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

sendTestPost();
