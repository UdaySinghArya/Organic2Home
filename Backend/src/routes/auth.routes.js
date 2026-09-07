import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  adminRegister,
  adminRequestOtp,
  adminResendOtp,
  adminVerifyOtp,
  customerRequestOtp,
  customerResendOtp,
  customerVerifyOtp,
  getSession,
  logout,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many OTP requests. Try again later.', code: 'RATE_LIMITED' },
  },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many verification attempts. Try again later.', code: 'RATE_LIMITED' },
  },
});

authRouter.post('/otp/request', otpLimiter, customerRequestOtp);
authRouter.post('/otp/resend', otpLimiter, customerResendOtp);
authRouter.post('/otp/verify', verifyLimiter, customerVerifyOtp);

authRouter.post('/admin/register', adminRegister);
authRouter.post('/admin/otp/request', otpLimiter, adminRequestOtp);
authRouter.post('/admin/otp/resend', otpLimiter, adminResendOtp);
authRouter.post('/admin/otp/verify', verifyLimiter, adminVerifyOtp);

authRouter.get('/me', requireAuth, getSession);
authRouter.post('/logout', requireAuth, logout);
