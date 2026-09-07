function twilioEnabled() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM,
  );
}

const devOtp = String(process.env.DEV_OTP || '000000');

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/organic2home',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 5),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  twilioEnabled: twilioEnabled(),
  devOtp: /^\d{6}$/.test(devOtp) ? devOtp : '000000',
};
