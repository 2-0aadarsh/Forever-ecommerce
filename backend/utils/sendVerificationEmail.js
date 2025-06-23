import transporter from "./emailTransporter.js";
import { getVerifyEmailHTML } from "./verifyEmailTemplate.js";
import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (email, otp, name) => {
  const html = getVerifyEmailHTML(otp, name);

  console.log("sending the email")
  const mailOptions = {
    from: `"Forever" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Verify Your Email - Forever",
    html,
  };

  await transporter.sendMail(mailOptions);
};