import { Resend } from "resend";

// Initialize Resend with API key from Render environment
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (to, resetLink) => {
  try {
    await resend.emails.send({
      from: "Land Tax System <onboarding@resend.dev>",
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password.</p>
          <p>This link is valid for <b>15 minutes</b>.</p>
          <a href="${resetLink}"
             style="
               display: inline-block;
               margin-top: 15px;
               padding: 10px 20px;
               background: #2563eb;
               color: white;
               text-decoration: none;
               border-radius: 6px;
             ">
             Reset Password
          </a>
          <p style="margin-top: 20px; color: #666;">
            If you didn’t request this, you can ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Resend email error:", error);
    throw new Error("Failed to send reset email");
  }
};
