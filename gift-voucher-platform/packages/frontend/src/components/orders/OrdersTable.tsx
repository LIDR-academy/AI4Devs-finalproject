import React, { useState } from 'react';
import Link from 'next/link';
import { Order } from '@/hooks/useOrders';
import VoucherPreviewModal from '../ui/VoucherPreviewModal';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

interface OrdersTableProps {
  orders: Order[];
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onDelete,
  isLoading
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isResending, setIsResending] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await onDelete(id);
    }
  };

  const handlePreviewClick = (order: Order) => {
    setSelectedOrder(order);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleResendEmails = async (orderId: string) => {
    try {
      setIsResending(orderId);
      await api.post(`/orders/${orderId}/resend-emails`);
      toast.success('Voucher emails resent successfully');
    } catch (error) {
      console.error('Error resending emails:', error);
      toast.error('Failed to resend emails');
    } finally {
      setIsResending(null);
    }
  };

  const handleDownloadPDF = (orderId: string) => {
    // Open the download URL in a new tab
    window.open(`${api.defaults.baseURL}/orders/${orderId}/download-pdf`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order._id.substring(0, 8)}...</div>
                  <div className="text-xs text-gray-500">Voucher: {order.voucher.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(order.paymentDetails.amount)}</div>
                  <div className="text-sm text-gray-500">{order.paymentDetails.paymentEmail}</div>
                  <div className="text-xs text-gray-500">Provider: {order.paymentDetails.provider}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusBadgeClass(order.paymentDetails.paymentStatus)
                  }`}>
                    {order.paymentDetails.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/orders/${order._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handlePreviewClick(order)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Preview
                  </button>
                  {order.paymentDetails.paymentStatus === 'completed' && (
                    <>
                      <button
                        onClick={() => handleResendEmails(order._id)}
                        disabled={isResending === order._id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {isResending === order._id ? 'Sending...' : 'Resend Email'}
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(order._id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Download PDF
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <VoucherPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={closePreviewModal}
          order={selectedOrder}
        />
      )}
    </>
  );
}; 