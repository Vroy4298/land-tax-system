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
            If you didn't request this, you can ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Resend email error:", error);
    throw new Error("Failed to send reset email");
  }
};

export const sendTaxReminderEmail = async (to, ownerName, amount, dueDate) => {
  try {
    await resend.emails.send({
      from: "Land Tax System <onboarding@resend.dev>",
      to,
      subject: "⚠️ Land Tax Payment Due in 30 Days",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc;">
          <div style="background: white; border-radius: 12px; padding: 24px; max-width: 480px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #1a237e; margin-bottom: 8px;">Tax Payment Reminder</h2>
            <p style="color: #6b7280;">Dear <b>${ownerName}</b>,</p>
            <p style="color: #374151;">Your land tax payment of <b style="color: #1a237e;">₹${Number(amount).toLocaleString("en-IN")}</b> is due on <b>${new Date(dueDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</b>.</p>
            <p style="color: #374151;">Please log in and complete your payment to avoid penalties.</p>
            <a href="${process.env.FRONTEND_URL}/properties"
               style="display: inline-block; margin-top: 16px; padding: 10px 22px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Pay Now
            </a>
            <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
              © 2025 Land Tax System. This is an automated reminder.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Tax reminder email error:", error);
  }
};
