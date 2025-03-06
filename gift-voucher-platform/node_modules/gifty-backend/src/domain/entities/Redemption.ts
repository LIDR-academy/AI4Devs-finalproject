/**
 * Redemption entity representing a voucher redemption
 */
export interface Redemption {
  id: string;
  voucherId: string;
  orderId: string;
  redeemedBy: string;
  redeemedAt: Date;
  merchantId: string;
  amount: number;
  currency: string;
  status: RedemptionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Redemption status enum
 */
export enum RedemptionStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

/**
 * Redemption creation data transfer object
 */
export interface CreateRedemptionDto {
  voucherId: string;
  orderId: string;
  redeemedBy: string;
  merchantId: string;
  notes?: string;
}

/**
 * Redemption update data transfer object
 */
export interface UpdateRedemptionDto {
  status?: RedemptionStatus;
  notes?: string;
}

/**
 * Voucher redemption request data transfer object
 */
export interface RedeemVoucherDto {
  voucherCode: string;
  merchantId: string;
  notes?: string;
} 