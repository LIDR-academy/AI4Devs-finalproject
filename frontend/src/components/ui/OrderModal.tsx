import { CheckCircle, CreditCard, Package, Truck, X } from 'lucide-react';
import React from 'react';

interface OrderDetails {
  orderNumber: string;
  status: string;
  items: Array<{product: string, quantity: number, price: number, subtotal: number}>;
  total: number;
  currency: string;
  estimatedDelivery: string;
  customerInfo: any;
  paymentMethod: string;
  shippingMethod: string;
  notes: string;
  timestamp: string;
}

interface OrderModalProps {
  order: OrderDetails;
  onClose: () => void;
  isVisible: boolean;
}

export const OrderModal: React.FC<OrderModalProps> = ({ order, onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">ORDINE IN ARRIVO!</h2>
                <p className="text-green-100">Ordine confermato con successo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Number */}
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-green-600">#{order.orderNumber}</h3>
            <p className="text-gray-600 mt-1">{new Date(order.timestamp).toLocaleString('en-US')}</p>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Ordered Products
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-800">{item.product}</span>
                      <p className="text-sm text-gray-600">€{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="font-bold text-green-600">€{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-300 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-green-600">€{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Delivery */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Information
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery}</p>
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                <p><strong>Shipping Method:</strong> {order.shippingMethod}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Informazioni pagamento
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-purple-700">
                  <strong>Metodo:</strong> {order.paymentMethod}
                </p>
                <p className="text-purple-700">
                  <strong>Cliente:</strong> {order.customerInfo.name || 'Cliente'}
                </p>
                <p className="text-purple-700">
                  <strong>Email:</strong> {order.customerInfo.email || 'da.specificare@email.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Note:</h4>
              <p className="text-yellow-700">{order.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Perfect! 🎉</h3>
            <p className="text-gray-600 mb-6">
              Your order has been successfully processed and will be delivered soon.
            </p>
            
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 