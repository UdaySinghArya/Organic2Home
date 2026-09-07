import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

otpSchema.index({ phone: 1, role: 1 });

export const Otp = mongoose.model('Otp', otpSchema);
