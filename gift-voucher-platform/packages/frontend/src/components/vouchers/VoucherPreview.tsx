import React from 'react';
import Templates from './templates';

interface VoucherPreviewProps {
  previewData: Record<string, any>;
}

const VoucherPreview: React.FC<VoucherPreviewProps> = ({ previewData }) => {
  const renderTemplate = () => {
    const templateProps = {
      sender_name: previewData.sender_name || 'Sender Name',
      sender_email: previewData.sender_email || 'sender@example.com',
      receiver_name: previewData.receiver_name || 'Receiver Name',
      receiver_email: previewData.receiver_email || 'receiver@example.com',
      message: previewData.message || 'Your personal message will appear here.',
      productName: previewData.productName || 'Product Name',
      storeName: previewData.storeName || 'Store Name',
      storeAddress: previewData.storeAddress || 'Store Address',
      storeEmail: previewData.storeEmail || 'store@example.com',
      storePhone: previewData.storePhone || '+1 234 567 890',
      storeSocial: previewData.storeSocial || '@storename',
      storeLogo: previewData.storeLogo || '',
      expirationDate: previewData.expirationDate || '2023-12-31',
      code: previewData.code || 'GIFT1234',
      qrCode: previewData.qrCode || '',
    };

    switch (previewData.template) {
      case 'template1':
        return <Templates.template1 {...templateProps} />;
      case 'template2':
        return <Templates.template2 {...templateProps} />;
      case 'template3':
        return <Templates.template3 {...templateProps} />;
      case 'template4':
        return <Templates.template4 {...templateProps} />;
      case 'template5':
        return <Templates.template5 {...templateProps} />;
      default:
        return <Templates.template1 {...templateProps} />;
    }
  };

  return (
    <div className="voucher-preview-container">
      <div className="border rounded-md overflow-hidden">
        {renderTemplate()}
      </div>
    </div>
  );
};

export default VoucherPreview; 