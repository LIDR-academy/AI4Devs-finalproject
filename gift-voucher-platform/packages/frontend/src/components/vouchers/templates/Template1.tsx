import React from 'react';

interface TemplateProps {
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  productName: string;
  storeName: string;
  storeAddress: string;
  storeEmail: string;
  storePhone: string;
  storeSocial: string;
  storeLogo: string;
  expirationDate: string;
  code: string;
  qrCode: string;
}

const Template1: React.FC<TemplateProps> = ({
  sender_name,
  sender_email,
  receiver_name,
  receiver_email,
  message,
  productName,
  storeName,
  storeAddress,
  storeEmail,
  storePhone,
  storeSocial,
  storeLogo,
  expirationDate,
  code,
  qrCode
}) => {
  return (
    <div className="voucher-preview" style={{ maxHeight: '500px', overflow: 'auto' }}>
      <div style={{
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: 0,
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '20px auto',
          border: '1px solid #ddd',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          display: 'flex',
          backgroundColor: '#fff',
        }}>
          <div style={{
            width: '240px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRight: '1px solid #eee',
          }}>
            <img src={storeLogo || '/placeholder-logo.png'} alt={storeName} style={{
              maxWidth: '150px',
              marginBottom: '20px',
            }} />
            <div style={{
              marginTop: '40px',
              fontSize: '14px',
              lineHeight: 1.5,
            }}>
              <p style={{ margin: '5px 0' }}>{storeAddress}</p>
              <p style={{ margin: '5px 0' }}>{storeEmail}</p>
              <p style={{ margin: '5px 0' }}>{storePhone}</p>
              <p style={{ margin: '5px 0' }}>
                <span style={{ marginRight: '10px', fontSize: '18px' }}>📱</span>
                <span>{storeSocial}</span>
              </p>
            </div>
          </div>
          <div style={{
            flex: 1,
            padding: '20px',
            backgroundColor: '#000',
            color: '#fff',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>FROM:</div>
              <div style={{ fontSize: '16px', marginBottom: '15px' }}>{sender_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>TO:</div>
              <div style={{ fontSize: '16px', marginBottom: '15px' }}>{receiver_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>PRODUCT:</div>
              <div style={{ fontSize: '16px', marginBottom: '15px' }}>{productName}</div>
            </div>
            
            <div style={{ margin: '30px 0', textAlign: 'center', fontSize: '18px', lineHeight: 1.5 }}>
              <div>Message: {message}</div>
            </div>
            
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              {qrCode ? (
                <img src={qrCode} alt="Scan to redeem" style={{ maxWidth: '150px' }} />
              ) : (
                <div style={{ width: '150px', height: '150px', backgroundColor: '#333', margin: '0 auto' }}></div>
              )}
            </div>
            
            <div style={{ fontSize: '14px', marginTop: '20px' }}>expiration date: {expirationDate}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px', textAlign: 'right' }}>code: {code}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template1; 