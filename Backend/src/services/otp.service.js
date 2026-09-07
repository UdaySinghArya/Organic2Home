import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { Otp } from '../models/Otp.js';
import { createHttpError } from '../middleware/errorHandler.js';

export async function sendOtp(phone, code, role) {
  console.log(`[dev OTP] ${phone} (${role}): ${code}`);

  // Twilio — enable later. Do not send OTP in API responses.
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   to: `+91${phone}`,
  //   from: process.env.TWILIO_FROM,
  //   body: `Your Organic2Home OTP is ${code}. It expires in ${env.otpExpiryMinutes} minutes.`,
  // });
}

function generateOtpCode() {
  if (env.twilioEnabled) return String(crypto.randomInt(100000, 1000000));
  return env.devOtp;
}

export async function issueOtp(phone, role) {
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

  await Otp.deleteMany({ phone, role });
  await Otp.create({ phone, codeHash, role, expiresAt });
  await sendOtp(phone, code, role);

  return { phone, role, expiresInMinutes: env.otpExpiryMinutes };
}

export async function consumeOtp(phone, role, otp) {
  if (!/^\d{6}$/.test(otp)) {
    throw createHttpError(400, 'Invalid OTP. Please try again.', 'INVALID_OTP');
  }

  if (!env.twilioEnabled && otp === env.devOtp) {
    await Otp.deleteMany({ phone, role }).catch(() => {});
    return;
  }

  const record = await Otp.findOne({ phone, role }).sort({ createdAt: -1 });
  if (!record) {
    throw createHttpError(400, 'OTP expired. Request a new one.', 'OTP_EXPIRED');
  }
  if (record.attempts >= 5) {
    await record.deleteOne();
    throw createHttpError(429, 'Too many invalid OTP attempts', 'OTP_LOCKED');
  }

  const matches = await bcrypt.compare(otp, record.codeHash);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    throw createHttpError(400, 'Invalid OTP. Please try again.', 'INVALID_OTP');
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await record.deleteOne();
    throw createHttpError(400, 'OTP expired. Request a new one.', 'OTP_EXPIRED');
  }

  await record.deleteOne();
}
