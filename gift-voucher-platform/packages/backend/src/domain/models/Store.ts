import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: { 
      type: String, 
      required: [true, 'Store name is required'],
      trim: true
    },
    ownerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: [true, 'Store owner is required']
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: { 
      type: String, 
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: { 
      type: String, 
      required: [true, 'Address is required'],
      trim: true
    }
  },
  { timestamps: true }
);

// Indexes for optimized queries
StoreSchema.index({ ownerId: 1 }); // Fetch all stores by owner
StoreSchema.index({ email: 1 }, { unique: true }); // Fast lookup by email

export const Store = mongoose.model<IStore>('Store', StoreSchema); 