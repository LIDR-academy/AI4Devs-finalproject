import React, { useEffect, useState } from 'react';
import VoucherPreview from '../vouchers/VoucherPreview';
import { Order } from '@/hooks/useOrders';
import api from '@/services/api';

interface VoucherPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const VoucherPreviewModal: React.FC<VoucherPreviewModalProps> = ({ isOpen, onClose, order }) => {
  const [productName, setProductName] = useState<string>('Product');
  const [storeName, setStoreName] = useState<string>('Store');

  useEffect(() => {
    const fetchProductAndStore = async () => {
      try {
        // Fetch product name
        if (order.voucher.productId) {
          const productResponse = await api.get(`/products/${order.voucher.productId}`);
          if (productResponse.data.success) {
            setProductName(productResponse.data.data.name);
          }
        }

        // Fetch store name
        if (order.voucher.storeId) {
          const storeResponse = await api.get(`/stores/${order.voucher.storeId}`);
          if (storeResponse.data.success) {
            setStoreName(storeResponse.data.data.name);
          }
        }
      } catch (error) {
        console.error('Error fetching product or store details:', error);
      }
    };

    if (isOpen) {
      fetchProductAndStore();
    }
  }, [isOpen, order.voucher.productId, order.voucher.storeId]);

  if (!isOpen) return null;

  // Prepare preview data from order
  const previewData = {
    sender_name: order.voucher.sender_name,
    sender_email: order.voucher.sender_email,
    receiver_name: order.voucher.receiver_name,
    receiver_email: order.voucher.receiver_email,
    message: order.voucher.message,
    productName: productName,
    storeName: storeName,
    template: order.voucher.template,
    expirationDate: order.voucher.expirationDate,
    code: order.voucher.code,
    qrCode: order.voucher.qrCode,
    status: order.voucher.status,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'redeemed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Voucher Preview
                  </h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(previewData.status)}`}>
                    {previewData.status}
                  </span>
                </div>
                
                <div className="mt-2">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Code:</span> {previewData.code}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Expires:</span> {formatDate(previewData.expirationDate)}
                    </p>
                  </div>
                  
                  <VoucherPreview previewData={previewData} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherPreviewModal; 