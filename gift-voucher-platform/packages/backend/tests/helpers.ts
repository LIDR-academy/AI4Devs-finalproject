import mongoose from 'mongoose';
import { User } from '../src/domain/models/User';
import { Store } from '../src/domain/models/Store';
import { Product } from '../src/domain/models/Product';
import { Voucher } from '../src/domain/models/Voucher';
import { Order } from '../src/domain/models/Order';
import { VoucherUsage } from '../src/domain/models/VoucherUsage';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to create a test user
export const createTestUser = async (
  userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'customer'
  }
) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = new User({
    ...userData,
    password: hashedPassword
  });
  await user.save();
  return user;
};

// Helper function to create a test admin user
export const createTestAdmin = async () => {
  return createTestUser({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
};

// Helper function to create a test store manager
export const createTestStoreManager = async () => {
  return createTestUser({
    name: 'Store Manager',
    email: 'manager@example.com',
    password: 'manager123',
    role: 'store_manager'
  });
};

// Helper function to create a test store
export const createTestStore = async (ownerId: mongoose.Types.ObjectId) => {
  const store = new Store({
    name: 'Test Store',
    ownerId,
    email: 'store@example.com',
    phone: '+1234567890',
    address: '123 Test St, Test City'
  });
  await store.save();
  return store;
};

// Helper function to create a test product
export const createTestProduct = async (storeId: mongoose.Types.ObjectId) => {
  const product = new Product({
    storeId,
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    isActive: true
  });
  await product.save();
  return product;
};

// Helper function to create a test voucher
export const createTestVoucher = async (
  storeId: mongoose.Types.ObjectId,
  productId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId
) => {
  const voucher = new Voucher({
    storeId,
    productId,
    customerId,
    code: `TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: 'active',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    qrCode: 'data:image/png;base64,testqrcode'
  });
  await voucher.save();
  return voucher;
};

// Helper function to create a test order
export const createTestOrder = async (
  customerId: mongoose.Types.ObjectId,
  voucherId: mongoose.Types.ObjectId
) => {
  const order = new Order({
    customerId,
    voucherId,
    paymentDetails: {
      paymentId: 'TEST-PAYMENT-123',
      paymentStatus: 'completed',
      paymentEmail: 'customer@example.com',
      amount: 99.99,
      provider: 'test_provider'
    }
  });
  await order.save();
  return order;
};

// Helper function to create a test voucher usage
export const createTestVoucherUsage = async (
  voucherId: mongoose.Types.ObjectId,
  storeId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId
) => {
  const voucherUsage = new VoucherUsage({
    voucherId,
    storeId,
    customerId,
    usedAt: new Date()
  });
  await voucherUsage.save();
  return voucherUsage;
};

// Helper function to generate a JWT token for a user
export const generateToken = (userId: mongoose.Types.ObjectId, role: string) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test_jwt_secret',
    { expiresIn: '1h' }
  );
};

// Helper function to generate auth header with token
export const getAuthHeader = (token: string) => {
  return { Authorization: `Bearer ${token}` };
}; 