// sendOtpEmail.js

const { Resend } = require('resend');

// ✅ Create a Resend instance with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(email, otp) {
  try {
    // ✅ Attempt to send the email
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',  // ⚠️ Change this if not verified on Resend
      to: 'balayadav836@gmail.com',
      subject: 'Your OTP Code',
      html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });

    console.log("📨 Raw Resend Response:", result);

    // ✅ Check if Resend returned a valid email ID
    if (!result?.data?.id) {
      console.error("❌ Resend rejected the request:", result.error || "Unknown error");
      return false;
    }

    console.log("✅ Email sent successfully:", result.data.id);
    return true;
  } catch (error) {
    // ❌ Catch runtime or API errors
    console.error("❌ Exception when sending OTP email:", error.message || error);
    return false;
  }
}

module.exports = sendOtpEmail;
