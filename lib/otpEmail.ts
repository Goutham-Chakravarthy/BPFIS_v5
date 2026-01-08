import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || 'AgriLink <noreply@agrilink.app>';

// Check if all required SMTP environment variables are set
if (!host || !user || !pass) {
  console.error('❌ SMTP environment variables are not fully set. Email OTPs will not send.');
  console.error('Required: SMTP_HOST, SMTP_USER, SMTP_PASS');
  console.error(`Current: HOST=${host ? '✓' : '✗'}, USER=${user ? '✓' : '✗'}, PASS=${pass ? '✓' : '✗'}`);
}

// Create transporter with proper Gmail configuration
const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false, // Use TLS
  auth: user && pass ? { user, pass } : undefined,
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
  logger: process.env.NODE_ENV === 'development' // Enable logger in development
});

// Verify transporter configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('❌ SMTP transporter verification failed:', error);
  } else {
    console.log('✅ SMTP transporter is ready to send emails');
  }
});

export async function sendEmailOtp(to: string, otp: string, purpose: string) {
  if (!host || !user || !pass) {
    console.error('❌ Skipping email send because SMTP environment variables are missing');
    return false;
  }

  const subject = `Your AgriLink OTP for ${purpose}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">AgriLink</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Agricultural Supply Chain Platform</p>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Your One-Time Password (OTP) for <strong>${purpose}</strong> is:</p>
        <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this with anyone.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you didn't request this OTP, please ignore this email.<br>
            This is an automated message from AgriLink.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    console.log(`📧 Sending OTP email to: ${to}`);
    console.log(`🔢 OTP: ${otp} (for ${purpose})`);
    
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: `Your AgriLink OTP is ${otp}. It is valid for 10 minutes.`
    });
    
    console.log('✅ OTP email sent successfully:', {
      messageId: result.messageId,
      to: to,
      response: result.response
    });
    
    return true;
  } catch (err) {
    console.error('❌ Failed to send OTP email:', {
      error: err,
      to: to,
      host: host,
      port: port
    });
    
    // In development, provide more detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.error('Detailed error:', err);
    }
    
    return false;
  }
}
