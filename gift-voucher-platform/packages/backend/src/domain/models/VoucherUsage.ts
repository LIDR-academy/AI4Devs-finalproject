import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for the VoucherUsage document
 */
export interface IVoucherUsage extends Document {
  _id: mongoose.Types.ObjectId;
  voucherId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  usedAt: Date;
}

/**
 * VoucherUsage Schema
 */
const VoucherUsageSchema = new Schema<IVoucherUsage>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    voucherId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Voucher', 
      required: [true, 'Voucher ID is required'] 
    },
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Store', 
      required: [true, 'Store ID is required'] 
    },
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Customer ID is required'] 
    },
    usedAt: { 
      type: Date, 
      default: Date.now 
    }
  }
);

// Indexes for optimized queries
VoucherUsageSchema.index({ voucherId: 1 }, { unique: true }); // Ensure each voucher is redeemed only once
VoucherUsageSchema.index({ storeId: 1, customerId: 1 }); // Fetch redemption history for a user/store

// Create and export the VoucherUsage model
export const VoucherUsage = mongoose.model<IVoucherUsage>('VoucherUsage', VoucherUsageSchema); 