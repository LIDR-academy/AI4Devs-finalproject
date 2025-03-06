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

const Template2: React.FC<TemplateProps> = ({
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
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        margin: 0,
        padding: 0,
        backgroundColor: '#f0f0f0',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '20px auto',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        }}>
          <div style={{
            backgroundColor: '#4a154b',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
          }}>
            <img src={storeLogo || '/placeholder-logo.png'} alt={storeName} style={{
              maxWidth: '120px',
              marginBottom: '10px',
            }} />
            <h1 style={{ margin: 0 }}>Gift Voucher</h1>
          </div>
          
          <div style={{
            display: 'flex',
            backgroundColor: 'white',
          }}>
            <div style={{
              flex: 2,
              padding: '25px',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '5px',
                }}>From</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 500,
                }}>{sender_name}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '5px',
                }}>To</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 500,
                }}>{receiver_name}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '5px',
                }}>Product</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 500,
                }}>{productName}</div>
              </div>
              
              <div style={{
                margin: '25px 0',
                padding: '15px',
                backgroundColor: '#f0f7ff',
                borderRadius: '8px',
                borderLeft: '4px solid #4a90e2',
              }}>
                <div style={{
                  fontWeight: 600,
                  marginBottom: '10px',
                  color: '#4a90e2',
                }}>Personal Message</div>
                <div style={{
                  lineHeight: 1.6,
                }}>{message}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '5px',
                }}>Expiration Date</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 500,
                }}>{expirationDate}</div>
              </div>
            </div>
            
            <div style={{
              flex: 1,
              padding: '25px',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '15px',
              }}>
                {qrCode ? (
                  <img src={qrCode} alt="Scan to redeem" style={{ maxWidth: '150px' }} />
                ) : (
                  <div style={{ width: '150px', height: '150px', backgroundColor: '#ddd', margin: '0 auto' }}></div>
                )}
              </div>
              <div>Scan to redeem</div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                backgroundColor: '#eee',
                padding: '8px 15px',
                borderRadius: '4px',
                marginTop: '10px',
              }}>{code}</div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
          }}>
            <div>{storeName} - {storeAddress}</div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '10px',
            }}>
              <div style={{ margin: '0 10px' }}>{storeEmail}</div>
              <div style={{ margin: '0 10px' }}>{storePhone}</div>
              <div style={{ margin: '0 10px' }}>{storeSocial}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template2; 