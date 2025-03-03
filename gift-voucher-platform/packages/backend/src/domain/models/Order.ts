import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for the Order document
 */
export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  paymentDetails: {
    paymentId: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentEmail: string;
    amount: number;
    provider: 'mercadopago' | 'paypal' | 'stripe';
  };
  voucher: {
    storeId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
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
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order Schema
 */
const OrderSchema = new Schema<IOrder>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Customer ID is required'] 
    },
    paymentDetails: {
      paymentId: { 
        type: String, 
        required: [true, 'Payment ID is required'] 
      },
      paymentStatus: { 
        type: String, 
        enum: {
          values: ['pending', 'completed', 'failed'],
          message: 'Payment status must be pending, completed, or failed'
        },
        required: [true, 'Payment status is required'] 
      },
      paymentEmail: { 
        type: String, 
        required: [true, 'Payment email is required'],
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email address'
        ]
      },
      amount: { 
        type: Number, 
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
      },
      provider: { 
        type: String, 
        enum: {
          values: ['mercadopago', 'paypal', 'stripe'],
          message: 'Provider must be mercadopago, paypal, or stripe'
        },
        required: [true, 'Provider is required'] 
      }
    },
    voucher: {
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
    }
  },
  {
    timestamps: true // Automatically manage createdAt and updatedAt
  }
);

// Indexes for optimized queries
OrderSchema.index({ customerId: 1, createdAt: -1 }); // Fetch orders by user, sorted by date
OrderSchema.index({ 'paymentDetails.paymentStatus': 1 }); // Query by payment status
OrderSchema.index({ 'voucher.code': 1 }, { unique: true }); // Ensure voucher codes are unique
OrderSchema.index({ 'voucher.storeId': 1 }); // Query by store
OrderSchema.index({ 'voucher.status': 1 }); // Query by voucher status
OrderSchema.index({ 'voucher.expirationDate': 1 }); // Query by expiration date
OrderSchema.index({ 'voucher.sender_email': 1 }); // Query by sender email
OrderSchema.index({ 'voucher.receiver_email': 1 }); // Query by receiver email

// Create and export the Order model
export const Order = mongoose.model<IOrder>('Order', OrderSchema); 