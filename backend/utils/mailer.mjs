import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (to, resetLink) => {
  await transporter.sendMail({
    from: `"Land Tax System" <${process.env.EMAIL_USER}>`,
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
};
