import nodemailer from "nodemailer";

export const sendResetEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) have requested a password reset for your account.</p>
        <p>Please use the following verification code to reset your password. This code is valid for 15 minutes:</p>
        <div style="font-size: 20px; font-weight: bold; background-color: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; color: #333;">
          ${otp}
        </div>
        <p>If you did not request this, please ignore this email and no changes will be made to your account.</p>
        <hr style="border: none; height: 1px; background-color: #ccc;">
        <p style="font-size: 12px; color: #777;">If you have any questions or need further assistance, feel free to contact our support team.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
