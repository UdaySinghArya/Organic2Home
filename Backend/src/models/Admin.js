import mongoose from 'mongoose';

const STATUSES = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

const farmProfileSchema = new mongoose.Schema(
  {
    farmName: { type: String, trim: true },
    plot: { type: String, trim: true },
    village: { type: String, trim: true },
    location: { type: String, trim: true },
  },
  { _id: false },
);

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    role: { type: String, enum: ['ADMIN'], required: true, default: 'ADMIN' },
    status: { type: String, enum: STATUSES, default: 'ACTIVE' },
    farmProfile: farmProfileSchema,
  },
  { timestamps: true },
);

export const Admin = mongoose.model('Admin', adminSchema);
