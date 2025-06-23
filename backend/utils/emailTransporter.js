import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create and export a reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL, // Your email
    pass: process.env.SMTP_PASSWORD, // Your app password
  },
});

export default transporter;
