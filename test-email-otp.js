// Test script to verify email OTP functionality
import { sendEmailOtp } from './lib/otpEmail.js';

async function testEmailOtp() {
  console.log('🧪 Testing email OTP functionality...\n');
  
  // Test with a sample email
  const testEmail = 'bhuvanbn01@gmail.com'; // Using the configured SMTP user email
  const testOtp = '123456';
  const testPurpose = 'test registration';
  
  console.log('📧 Configuration check:');
  console.log(`- SMTP_HOST: ${process.env.SMTP_HOST || 'Not set'}`);
  console.log(`- SMTP_USER: ${process.env.SMTP_USER || 'Not set'}`);
  console.log(`- SMTP_PASS: ${process.env.SMTP_PASS ? '✓ Set' : '✗ Not set'}`);
  console.log(`- SMTP_FROM: ${process.env.SMTP_FROM || 'Not set'}`);
  
  console.log(`\n📤 Sending test email to: ${testEmail}`);
  console.log(`🔢 Test OTP: ${testOtp}`);
  
  try {
    const result = await sendEmailOtp(testEmail, testOtp, testPurpose);
    
    if (result) {
      console.log('\n✅ Email sent successfully!');
      console.log('📬 Check your inbox for the test email.');
    } else {
      console.log('\n❌ Email sending failed.');
      console.log('🔍 Check the console logs above for detailed error information.');
      console.log('\n💡 Possible solutions:');
      console.log('   1. Verify Gmail SMTP credentials are correct');
      console.log('   2. Check if Gmail App Password is enabled');
      console.log('   3. Ensure less secure apps are allowed in Gmail settings');
      console.log('   4. Verify network connectivity');
    }
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
  }
}

// Run the test
testEmailOtp();
