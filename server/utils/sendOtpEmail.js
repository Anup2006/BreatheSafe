import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import User from '../models/user.model.js';


     

const sendOtpEmail = async (email, otp) => {
  const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  EMAIL_SENDER_ADDRESS,  
} = process.env;
 
// Setup OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
const accessTokenObj = await oAuth2Client.getAccessToken();
const accessToken = accessTokenObj?.token || accessTokenObj;
console.log(accessToken);

  
  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_SENDER_ADDRESS,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    tls: {
        rejectUnauthorized: true
    }
    });

const mailOptions = {
  from: `"BreatheSafeAI" <${EMAIL_SENDER_ADDRESS}>`,
  to: email,
  subject: '🔑 Your One-Time Password (OTP) – BreatheSafeAI',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
      <h2 style="color: #333; text-align: center;">BreatheSafeAI Verification</h2>
      <p style="font-size: 16px; color: #555;">
        Hello,
      </p>
      <p style="font-size: 16px; color: #555;">
        Use the following One-Time Password (OTP) to complete your verification process. This OTP is valid for <strong>10 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2c3e50; background: #e1e1e1; padding: 10px 20px; border-radius: 6px; display: inline-block;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #999; text-align: center;">
        If you did not request this OTP, please ignore this email or contact our support.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        © ${new Date().getFullYear()} BreatheSafeAI. All rights reserved.
      </p>
    </div>
  `
};

 
    const result = await transporter.sendMail(mailOptions);
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();
    console.log("Email sent ", result.response);
    return result;
  } catch (err) {
    console.error(' Email sending failed:', err.message);
    throw new Error('Failed to send OTP email');
  }
};

export default sendOtpEmail;
