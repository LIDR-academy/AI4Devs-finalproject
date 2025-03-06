/**
 * Voucher entity representing a gift voucher in the system
 */
export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  expiryDate: Date;
  isActive: boolean;
  merchantId: string;
  imageUrl?: string;
  redemptionCount: number;
  maxRedemptions: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Voucher status enum
 */
export enum VoucherStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REDEEMED = 'redeemed',
  INACTIVE = 'inactive'
}

/**
 * Voucher creation data transfer object
 */
export interface CreateVoucherDto {
  name: string;
  description: string;
  amount: number;
  currency: string;
  expiryDate: Date;
  merchantId: string;
  imageUrl?: string;
  maxRedemptions?: number;
}

/**
 * Voucher update data transfer object
 */
export interface UpdateVoucherDto {
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  expiryDate?: Date;
  isActive?: boolean;
  imageUrl?: string;
  maxRedemptions?: number;
}

/**
 * Get voucher status based on its properties
 */
export const getVoucherStatus = (voucher: Voucher): VoucherStatus => {
  if (!voucher.isActive) {
    return VoucherStatus.INACTIVE;
  }
  
  if (voucher.expiryDate < new Date()) {
    return VoucherStatus.EXPIRED;
  }
  
  if (voucher.maxRedemptions > 0 && voucher.redemptionCount >= voucher.maxRedemptions) {
    return VoucherStatus.REDEEMED;
  }
  
  return VoucherStatus.ACTIVE;
}; 