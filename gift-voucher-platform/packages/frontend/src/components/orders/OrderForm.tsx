import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Order, CreateOrderData } from '@/hooks/useOrders';
import api from '@/services/api';
import VoucherPreview from '../vouchers/VoucherPreview';
import { useVouchers } from '@/hooks/useVouchers';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Store {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  storeId: string;
}

interface OrderFormProps {
  initialData?: Order;
  onSubmit: (data: CreateOrderData) => Promise<void>;
  isLoading: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  onSubmit,
  isLoading
}) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialData?.voucher.template || 'template1');
  const [previewData, setPreviewData] = useState<Record<string, any>>({
    sender_name: initialData?.voucher.sender_name || '',
    sender_email: initialData?.voucher.sender_email || '',
    receiver_name: initialData?.voucher.receiver_name || '',
    receiver_email: initialData?.voucher.receiver_email || '',
    message: initialData?.voucher.message || '',
    productName: '',
    storeName: '',
    storeAddress: '123 Main St, City',
    storeEmail: 'store@example.com',
    storePhone: '(123) 456-7890',
    storeSocial: '@storename',
    storeLogo: '/logo.png',
    expirationDate: initialData?.voucher.expirationDate && typeof initialData.voucher.expirationDate === 'string'
      ? new Date(initialData.voucher.expirationDate).toLocaleDateString()
      : '',
    code: initialData?.voucher.code || 'XXXX-XXXX-XXXX',
    qrCode: initialData?.voucher.qrCode || '',
    template: initialData?.voucher.template || 'template1'
  });

  // Add a new state for handling redemption
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CreateOrderData>({
    defaultValues: initialData ? {
      customerId: initialData.customerId,
      paymentDetails: {
        paymentId: initialData.paymentDetails.paymentId,
        paymentStatus: initialData.paymentDetails.paymentStatus,
        paymentEmail: initialData.paymentDetails.paymentEmail,
        amount: initialData.paymentDetails.amount,
        provider: initialData.paymentDetails.provider
      },
      voucher: {
        storeId: initialData.voucher.storeId,
        productId: initialData.voucher.productId,
        expirationDate: initialData.voucher.expirationDate && typeof initialData.voucher.expirationDate === 'string'
          ? initialData.voucher.expirationDate.split('T')[0]
          : new Date().toISOString().split('T')[0],
        sender_name: initialData.voucher.sender_name,
        sender_email: initialData.voucher.sender_email,
        receiver_name: initialData.voucher.receiver_name,
        receiver_email: initialData.voucher.receiver_email,
        message: initialData.voucher.message,
        template: initialData.voucher.template
      }
    } : {
      paymentDetails: {
        paymentStatus: 'pending',
        provider: 'paypal'
      },
      voucher: {
        template: 'template1',
        expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
      }
    }
  });

  // Watch the form values for updates
  const formValues = watch();
  const selectedStoreId = watch('voucher.storeId');
  const selectedProductId = watch('voucher.productId');

  // Set up a single subscription to watch all form fields for preview
  useEffect(() => {
    const subscription = watch((value) => {
      // Update basic form fields in preview data
      setPreviewData(prev => ({
        ...prev,
        sender_name: value.voucher?.sender_name || '',
        sender_email: value.voucher?.sender_email || '',
        receiver_name: value.voucher?.receiver_name || '',
        receiver_email: value.voucher?.receiver_email || '',
        message: value.voucher?.message || '',
        template: value.voucher?.template || 'template1',
        expirationDate: value.voucher?.expirationDate && typeof value.voucher.expirationDate === 'string'
          ? new Date(value.voucher.expirationDate).toLocaleDateString()
          : ''
      }));

      // Update store name if store changes
      if (value.voucher?.storeId) {
        const store = stores.find(s => s._id === value.voucher?.storeId);
        if (store) {
          setPreviewData(prev => ({
            ...prev,
            storeName: store.name
          }));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, stores]);

  // Separate effect for handling product selection and price updates
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p._id === selectedProductId);
      if (product) {
        // Update product name in preview
        setPreviewData(prev => ({
          ...prev,
          productName: product.name
        }));

        // Update the payment amount based on product price
        setValue('paymentDetails.amount', product.price);
      }
    }
  }, [selectedProductId, products, setValue]);

  // Filter products when store changes
  useEffect(() => {
    if (selectedStoreId) {
      const filtered = products.filter(product => product.storeId === selectedStoreId);
      setFilteredProducts(filtered);

      // Clear product selection if the current product doesn't belong to the selected store
      const currentProductId = formValues.voucher?.productId;
      if (currentProductId) {
        const productBelongsToStore = filtered.some(p => p._id === currentProductId);
        if (!productBelongsToStore) {
          setValue('voucher.productId', '');
        }
      }
    } else {
      setFilteredProducts([]);
    }
  }, [selectedStoreId, products, formValues.voucher?.productId, setValue]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        setCustomerError(null);
        const response = await api.get('/users');
        if (response.data.success) {
          // Filter users to only include customers
          const customerUsers = response.data.data.filter(
            (user: User) => user.role === 'customer'
          );
          if (customerUsers.length === 0) {
            setCustomerError('No customers found. Please create a customer user first.');
          }
          setCustomers(customerUsers);

          // If in edit mode, update preview with customer name
          if (initialData) {
            const customer = customerUsers.find((c: User) => c._id === initialData.customerId);
            if (customer) {
              setPreviewData(prev => ({
                ...prev,
                customerName: customer.name
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomerError('Failed to load customers. Please try again.');
      } finally {
        setLoadingCustomers(false);
      }
    };

    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        setStoreError(null);
        const response = await api.get('/stores');
        if (response.data.success) {
          if (response.data.data.length === 0) {
            setStoreError('No stores found. Please create a store first.');
          }
          setStores(response.data.data);

          // If in edit mode, update preview with store name
          if (initialData) {
            const store = response.data.data.find((s: Store) => s._id === initialData.voucher.storeId);
            if (store) {
              setPreviewData(prev => ({
                ...prev,
                storeName: store.name
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        setStoreError('Failed to load stores. Please try again.');
      } finally {
        setLoadingStores(false);
      }
    };

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError(null);
        const response = await api.get('/products');
        if (response.data.success) {
          if (response.data.data.length === 0) {
            setProductError('No products found. Please create products first.');
          }
          setProducts(response.data.data);

          // If in edit mode, update preview with product name and filter products by store
          if (initialData) {
            const product = response.data.data.find((p: Product) => p._id === initialData.voucher.productId);
            if (product) {
              setPreviewData(prev => ({
                ...prev,
                productName: product.name
              }));

              // Also filter products by the store
              const filtered = response.data.data.filter(
                (p: Product) => p.storeId === initialData.voucher.storeId
              );
              setFilteredProducts(filtered);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductError('Failed to load products. Please try again.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCustomers();
    fetchStores();
    fetchProducts();
  }, [initialData]);

  const { redeemVoucher } = useVouchers();

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = e.target.value;
    setSelectedTemplate(template);
    setValue('voucher.template', template);
  };

  const handleFormSubmit = async (data: CreateOrderData) => {
    try {
      // Ensure amount is a number
      const formattedData = {
        ...data,
        paymentDetails: {
          ...data.paymentDetails,
          amount: Number(data.paymentDetails.amount)
        }
      };

      console.log('Submitting unified order data:', formattedData);
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  // Add a function to handle voucher redemption
  const handleRedeemVoucher = async () => {
    if (!initialData || !initialData.voucher.code) return;

    try {
      setIsRedeeming(true);
      setRedemptionError(null);
      setRedemptionSuccess(null);

      const result = await redeemVoucher(initialData.voucher.code);

      if (result) {
        setRedemptionSuccess('Voucher has been successfully redeemed!');

        // Update preview data to reflect the change
        setPreviewData(prev => ({
          ...prev,
          status: 'redeemed'
        }));

        // Refresh the order data after redemption
        if (initialData._id) {
          try {
            const orderResponse = await api.get(`/orders/${initialData._id}`);
            if (orderResponse.data.success) {
              // Notify the parent component that the order has been updated
              onSubmit({
                ...orderResponse.data.data,
                voucher: {
                  ...orderResponse.data.data.voucher,
                  status: 'redeemed'
                }
              });
            }
          } catch (error) {
            console.error('Error refreshing order data:', error);
          }
        }
      } else {
        setRedemptionError('Failed to redeem voucher. It may have already been redeemed or expired.');
      }
    } catch (error: any) {
      console.error('Error redeeming voucher:', error);
      setRedemptionError(error.response?.data?.message || 'An error occurred while redeeming the voucher');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/*Order Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Order Information</h3>

          {/* Customer Selection */}
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <div className="mt-1">
              {initialData ? (
                <div className="block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-gray-700">
                  {loadingCustomers ? 'Loading customer information...' :
                    customers.find(c => c._id === initialData.customerId)?.name ||
                    `Customer ID: ${initialData.customerId}`}
                </div>
              ) : (
                <select
                  id="customerId"
                  {...register('customerId', { required: 'Customer is required' })}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loadingCustomers}
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              )}
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
              )}
              {customerError && (
                <p className="mt-1 text-sm text-red-600">{customerError}</p>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Store Selection */}
            <div>
              <label htmlFor="voucher.storeId" className="block text-sm font-medium text-gray-700">
                Store
              </label>
              <div className="mt-1">
                {initialData ? (
                  <div className="block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-gray-700">
                    {loadingStores ? 'Loading store information...' :
                      stores.find(s => s._id === initialData.voucher.storeId)?.name ||
                      `Store ID: ${initialData.voucher.storeId}`}
                  </div>
                ) : (
                  <select
                    id="voucher.storeId"
                    {...register('voucher.storeId', { required: 'Store is required' })}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={loadingStores}
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.voucher?.storeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.voucher.storeId.message}</p>
                )}
                {storeError && (
                  <p className="mt-1 text-sm text-red-600">{storeError}</p>
                )}
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label htmlFor="voucher.productId" className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <div className="mt-1">
                {initialData ? (
                  <div className="block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-gray-700">
                    {loadingProducts ? 'Loading product information...' :
                      products.find(p => p._id === initialData.voucher.productId)?.name ||
                      `Product ID: ${initialData.voucher.productId}`}
                  </div>
                ) : (
                  <select
                    id="voucher.productId"
                    {...register('voucher.productId', { required: 'Product is required' })}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={loadingProducts || !selectedStoreId}
                  >
                    <option value="">Select a product</option>
                    {filteredProducts.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} (${product.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                )}
                {errors.voucher?.productId && (
                  <p className="mt-1 text-sm text-red-600">{errors.voucher.productId.message}</p>
                )}
                {productError && (
                  <p className="mt-1 text-sm text-red-600">{productError}</p>
                )}
                {!selectedStoreId && !initialData && (
                  <p className="mt-1 text-sm text-amber-600">Please select a store first</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">Payment Details</h4>

            {/* Payment ID */}
            <div>
              <label htmlFor="paymentDetails.paymentId" className="block text-sm font-medium text-gray-700">
                Payment ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="paymentDetails.paymentId"
                  {...register('paymentDetails.paymentId', { required: 'Payment ID is required' })}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter payment ID"
                />
                {errors.paymentDetails?.paymentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentDetails.paymentId.message}</p>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label htmlFor="paymentDetails.paymentStatus" className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <div className="mt-1">
                <select
                  id="paymentDetails.paymentStatus"
                  {...register('paymentDetails.paymentStatus', { required: 'Payment status is required' })}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                {errors.paymentDetails?.paymentStatus && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentDetails.paymentStatus.message}</p>
                )}
              </div>
            </div>

            {/* Payment Email */}
            <div>
              <label htmlFor="paymentDetails.paymentEmail" className="block text-sm font-medium text-gray-700">
                Payment Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="paymentDetails.paymentEmail"
                  {...register('paymentDetails.paymentEmail', {
                    required: 'Payment email is required',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter payment email"
                />
                {errors.paymentDetails?.paymentEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentDetails.paymentEmail.message}</p>
                )}
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label htmlFor="paymentDetails.amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="paymentDetails.amount"
                  {...register('paymentDetails.amount', {
                    required: 'Amount is required',
                    min: {
                      value: 0.01,
                      message: 'Amount must be greater than 0'
                    }
                  })}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                  placeholder="Enter amount"
                  step="0.01"
                  disabled={true}
                />
                {errors.paymentDetails?.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentDetails.amount.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Amount is automatically set based on the selected product</p>
              </div>
            </div>

            {/* Payment Provider */}
            <div>
              <label htmlFor="paymentDetails.provider" className="block text-sm font-medium text-gray-700">
                Payment Provider
              </label>
              <div className="mt-1">
                <select
                  id="paymentDetails.provider"
                  {...register('paymentDetails.provider', { required: 'Payment provider is required' })}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                </select>
                {errors.paymentDetails?.provider && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentDetails.provider.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

         {/* QR Code Display for Edit Mode */}
         <div className="mt-6 border-t border-gray-200 pt-6">
           {initialData && initialData.voucher.qrCode ? (
             <div className="flex flex-col items-center max-w-md mx-auto">
               <div className="mb-4">
                 <img
                   src={initialData.voucher.qrCode}
                   alt="Voucher QR Code"
                   className="w-48 h-48 border rounded-md"
                 />
               </div>

               <p className="text-sm text-gray-600 mb-4 text-center">
                 Scan this QR code to access the redemption page
               </p>

               <div className="text-center mb-6">
                 <p className="text-lg font-bold">{initialData.voucher.code}</p>
               </div>

               <div className="w-full mb-4">
                 <p className="text-sm font-medium text-gray-700 mb-2">Redemption Link:</p>
                 <div className="flex">
                   <input
                     type="text"
                     readOnly
                     value={`${window.location.origin}/vouchers/redeem/${initialData.voucher.code}`}
                     className="flex-1 py-2 px-3 border border-gray-300 bg-gray-50 rounded-l-md text-sm"
                   />
                   <button
                     type="button"
                     onClick={() => {
                       navigator.clipboard.writeText(`${window.location.origin}/vouchers/redeem/${initialData.voucher.code}`);
                       alert('Link copied to clipboard!');
                     }}
                     className="py-2 px-4 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
                   >
                     Copy
                   </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   The QR code contains this link. Share it or let customers scan the QR code to redeem the voucher.
                 </p>
               </div>

               {redemptionSuccess && (
                 <div className="mb-4 w-full bg-green-50 p-3 rounded-md">
                   <p className="text-sm text-green-700">{redemptionSuccess}</p>
                 </div>
               )}

               {redemptionError && (
                 <div className="mb-4 w-full bg-red-50 p-3 rounded-md">
                   <p className="text-sm text-red-700">{redemptionError}</p>
                 </div>
               )}

               <div className="w-full">
                 <button
                   type="button"
                   onClick={handleRedeemVoucher}
                   disabled={isRedeeming || initialData.voucher.status !== 'active'}
                   className={`w-full py-2 px-4 rounded-md text-white font-medium ${initialData.voucher.status === 'active'
                       ? 'bg-blue-600 hover:bg-blue-700'
                       : 'bg-gray-400 cursor-not-allowed'
                     }`}
                 >
                   {isRedeeming
                     ? 'Processing...'
                     : initialData.voucher.status === 'active'
                       ? 'Redeem Voucher'
                       : 'Voucher Already Redeemed'}
                 </button>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center max-w-md mx-auto">
               <div className="w-48 h-48 border rounded-md bg-gray-200 animate-pulse mb-4"></div>
               <p className="text-sm text-gray-600 mb-4 text-center">Loading voucher information...</p>
               <div className="w-full mb-4">
                 <p className="text-sm font-medium text-gray-700 mb-2">Redemption Link:</p>
                 <div className="flex">
                   <input
                     type="text"
                     readOnly
                     value="Loading..."
                     className="flex-1 py-2 px-3 border border-gray-300 bg-gray-50 rounded-l-md text-sm"
                   />
                   <button
                     type="button"
                     disabled
                     className="py-2 px-4 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 cursor-not-allowed"
                   >
                     Copy
                   </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   The QR code contains this link. Share it or let customers scan the QR code to redeem the voucher.
                 </p>
               </div>
             </div>
           )}
         </div>


      </div>

      {/* Voucher Preview */}
      <div className="mt-8 border-t border-gray-200 pt-8">

        {/* Voucher Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Voucher Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              {/* Expiration Date */}
              <div>
                <label htmlFor="voucher.expirationDate" className="block text-sm font-medium text-gray-700">
                  Expiration Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="voucher.expirationDate"
                    {...register('voucher.expirationDate', { required: 'Expiration date is required' })}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.voucher?.expirationDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.voucher.expirationDate.message}</p>
                  )}
                </div>
              </div>

              {/* Sender Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="voucher.sender_name" className="block text-sm font-medium text-gray-700">
                    Sender Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="voucher.sender_name"
                      {...register('voucher.sender_name', { required: 'Sender name is required' })}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter sender name"
                    />
                    {errors.voucher?.sender_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.voucher.sender_name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="voucher.sender_email" className="block text-sm font-medium text-gray-700">
                    Sender Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="voucher.sender_email"
                      {...register('voucher.sender_email', {
                        required: 'Sender email is required',
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter sender email"
                    />
                    {errors.voucher?.sender_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.voucher.sender_email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="voucher.receiver_name" className="block text-sm font-medium text-gray-700">
                    Recipient Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="voucher.receiver_name"
                      {...register('voucher.receiver_name', { required: 'Recipient name is required' })}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter recipient name"
                    />
                    {errors.voucher?.receiver_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.voucher.receiver_name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="voucher.receiver_email" className="block text-sm font-medium text-gray-700">
                    Recipient Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="voucher.receiver_email"
                      {...register('voucher.receiver_email', {
                        required: 'Recipient email is required',
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter recipient email"
                    />
                    {errors.voucher?.receiver_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.voucher.receiver_email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="voucher.message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="voucher.message"
                    {...register('voucher.message', {
                      required: 'Message is required',
                      maxLength: {
                        value: 500,
                        message: 'Message cannot be more than 500 characters'
                      }
                    })}
                    rows={3}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter a personal message for the recipient"
                  />
                  {errors.voucher?.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {typeof errors.voucher.message === 'string'
                        ? errors.voucher.message
                        : errors.voucher.message.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label htmlFor="voucher.template" className="block text-sm font-medium text-gray-700">
                  Voucher Template
                </label>
                <div className="mt-1">
                  <select
                    id="voucher.template"
                    {...register('voucher.template', { required: 'Template is required' })}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    onChange={handleTemplateChange}
                  >
                    <option value="template1">Classic</option>
                    <option value="template2">Modern</option>
                    <option value="template3">Elegant</option>
                    <option value="template4">Festive</option>
                    <option value="template5">Minimalist</option>
                  </select>
                  {errors.voucher?.template && (
                    <p className="mt-1 text-sm text-red-600">{errors.voucher.template.message}</p>
                  )}
                </div>
              </div>
            </section>

            <div className="mt-4">
              <VoucherPreview previewData={previewData} />
            </div>

          </div>

        </div>

       
      </div>

      {/* Submit Button */}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isLoading ? 'Processing...' : initialData ? 'Update Order' : 'Create Order'}
          </button>
        </div>
      </div>
    </form>
  );
}; 