import mongoose from 'mongoose';

const STATUSES = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    role: { type: String, enum: ['CUSTOMER'], required: true, default: 'CUSTOMER' },
    status: { type: String, enum: STATUSES, default: 'ACTIVE' },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
