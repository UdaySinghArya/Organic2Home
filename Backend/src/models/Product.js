import mongoose from 'mongoose';

const STATUSES = ['ACTIVE', 'RESTING', 'OUT_OF_STOCK'];
const CATEGORIES = ['vegetables', 'fruits'];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: 'kg' },
    image: { type: String, required: true },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    availability: { type: Boolean, default: true },
    status: { type: String, enum: STATUSES, default: 'ACTIVE', index: true },
    farm: {
      name: String,
      field: String,
      location: String,
    },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', index: true },
  },
  { timestamps: true },
);

export const Product = mongoose.model('Product', productSchema);
export { STATUSES as PRODUCT_STATUSES, CATEGORIES as PRODUCT_CATEGORIES };
