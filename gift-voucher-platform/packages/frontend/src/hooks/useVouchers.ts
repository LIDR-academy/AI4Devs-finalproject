import { useState, useCallback } from 'react';
import api from '@/services/api';

export interface Voucher {
  _id: string;
  storeId: string;
  productId: string;
  customerId: string | null;
  code: string;
  status: 'active' | 'redeemed' | 'expired';
  expirationDate: string;
  qrCode: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export function useVouchers() {
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedCodes, setFetchedCodes] = useState<Set<string>>(new Set());

  /**
   * Get a voucher by its code
   * @param code - The code of the voucher to fetch
   */
  const getVoucherByCode = useCallback(async (code: string): Promise<void> => {
    // Skip if we've already fetched this code and have a result (success or error)
    if (fetchedCodes.has(code) && (currentVoucher?.code === code || error)) {
      console.log(`Skipping fetch for already processed code: ${code}`);
      return;
    }

    try {
      console.log(`Fetching voucher with code: ${code}`);
      setLoading(true);
      setError(null);
      
      const url = `/orders/voucher/${code}`;
      console.log(`Making API request to: ${url}`);
      
      const response = await api.get(url);
      console.log('Voucher API response:', response.data);
      
      if (response.data.success) {
        console.log('Setting current voucher:', response.data.data);
        setCurrentVoucher(response.data.data);
      } else {
        console.error('API returned error:', response.data.error);
        setError(response.data.error || 'Failed to fetch voucher');
      }
    } catch (error: any) {
      console.error('Error fetching voucher:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to fetch voucher');
    } finally {
      setLoading(false);
      // Mark this code as fetched to prevent duplicate requests
      setFetchedCodes(prev => new Set(prev).add(code));
    }
  }, [currentVoucher?.code, error, fetchedCodes]);

  /**
   * Redeem a voucher by its code
   * @param voucherCode - The code of the voucher to redeem
   */
  const redeemVoucher = useCallback(async (voucherCode: string): Promise<boolean> => {
    try {
      console.log(`Redeeming voucher with code: ${voucherCode}`);
      setLoading(true);
      setError(null);
      
      const url = `/orders/voucher/${voucherCode}/redeem`;
      console.log(`Making API request to: ${url}`);
      
      const response = await api.put(url);
      console.log('Redemption API response:', response.data);
      
      if (response.data.success) {
        console.log('Voucher successfully redeemed');
        // Update the current voucher if it matches the redeemed one
        if (currentVoucher && currentVoucher.code === voucherCode) {
          setCurrentVoucher({
            ...currentVoucher,
            status: 'redeemed'
          });
        }
        return true;
      } else {
        console.error('API returned error:', response.data.error);
        setError(response.data.error || 'Failed to redeem voucher');
        return false;
      }
    } catch (error: any) {
      console.error('Error redeeming voucher:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to redeem voucher');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentVoucher]);

  return {
    currentVoucher,
    loading,
    error,
    getVoucherByCode,
    redeemVoucher
  };
} 