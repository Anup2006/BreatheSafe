import nodemailer from "nodemailer";
import { google } from "googleapis";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  EMAIL_SENDER_ADDRESS, // e.g., updates@breathesafeai.com
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

export const sendMail = async ({ to, subject, html }) => {
  try {
    // 1. Get a fresh Access Token
    const accessTokenObj = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenObj?.token || accessTokenObj;

    // 2. Create the Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_SENDER_ADDRESS,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: true, // Set to false only if testing on localhost with self-signed certs
      },
    });

    // 3. Configure Mail Options
    const mailOptions = {
      from: `"BreatheSafe AI" <${EMAIL_SENDER_ADDRESS}>`,
      to,
      subject,
      html,
    };

    // 4. Send Email
    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", result.messageId);
    return result;

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

 