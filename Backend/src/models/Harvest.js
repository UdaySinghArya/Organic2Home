import mongoose from 'mongoose';

const harvestSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    date: { type: Date, required: true, index: true },
    requiredQuantity: { type: Number, required: true, min: 0, default: 0 },
    pickedQuantity: { type: Number, required: true, min: 0, default: 0 },
    packedQuantity: { type: Number, required: true, min: 0, default: 0 },
    relatedOrderCount: { type: Number, default: 0 },
    status: {
      type: String, enum: ['PENDING', 'PICKED', 'PACKED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

harvestSchema.index({ productId: 1, date: 1 }, { unique: true });
harvestSchema.index({ farmerId: 1, date: 1 });

export const Harvest = mongoose.model('Harvest', harvestSchema);
export const HARVEST_STATUSES = ['PENDING', 'PICKED', 'PACKED'];
