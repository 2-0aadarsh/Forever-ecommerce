export const getVerifyEmailHTML = (otp, name = "User") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f5f7fa;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      padding: 30px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header img {
      max-height: 48px;
    }
    .title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .message {
      font-size: 16px;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .otp-box {
      background: #f0f0f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      font-size: 28px;
      letter-spacing: 6px;
      font-weight: bold;
      color: #111;
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #999;
      margin-top: 24px;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1c1c1e;
        color: #f2f2f7;
      }
      .container {
        background-color: #2c2c2e;
        color: #f2f2f7;
      }
      .otp-box {
        background: #444;
        color: #fff;
      }
      .footer {
        color: #888;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://yourapp.com/logo.png" alt="Logo" />
    </div>
    <div class="title">Verify your email</div>
    <div class="message">
      Hello <strong>${name}</strong>,<br/>
      Thank you for signing up! Please verify your email using the OTP below:
    </div>
    <div class="otp-box">${otp}</div>
    <div class="message">
      This OTP is valid for 10 minutes. Do not share it with anyone.
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} YourAppName. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
