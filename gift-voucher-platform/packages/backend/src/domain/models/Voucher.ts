import mongoose, { Document, Schema } from 'mongoose';

export interface IVoucher extends Document {
  storeId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId | null;
  code: string;
  status: 'active' | 'redeemed' | 'expired';
  expirationDate: Date;
  qrCode: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Store',
      required: [true, 'Store ID is required']
    },
    productId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      default: null
    },
    code: { 
      type: String, 
      required: [true, 'Voucher code is required'],
      unique: true,
      trim: true
    },
    status: { 
      type: String, 
      enum: ['active', 'redeemed', 'expired'],
      required: true,
      default: 'active'
    },
    expirationDate: { 
      type: Date, 
      required: [true, 'Expiration date is required']
    },
    qrCode: { 
      type: String, 
      required: [true, 'QR code is required']
    },
    sender_name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true
    },
    sender_email: {
      type: String,
      required: [true, 'Sender email is required'],
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    receiver_name: {
      type: String,
      required: [true, 'Receiver name is required'],
      trim: true
    },
    receiver_email: {
      type: String,
      required: [true, 'Receiver email is required'],
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot be more than 500 characters']
    },
    template: {
      type: String,
      required: [true, 'Template is required'],
      enum: ['template1', 'template2', 'template3', 'template4', 'template5'],
      default: 'template1'
    }
  },
  { timestamps: true }
);

// Indexes for optimized queries
VoucherSchema.index({ code: 1 }, { unique: true }); // Prevent duplicate voucher codes
VoucherSchema.index({ customerId: 1, status: 1 }); // Fetch vouchers for a user by status
VoucherSchema.index({ storeId: 1 }); // Fetch all vouchers for a store
VoucherSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 }); // Auto-remove expired vouchers
VoucherSchema.index({ sender_email: 1 }); // Fetch vouchers by sender email
VoucherSchema.index({ receiver_email: 1 }); // Fetch vouchers by receiver email

export const Voucher = mongoose.model<IVoucher>('Voucher', VoucherSchema); 