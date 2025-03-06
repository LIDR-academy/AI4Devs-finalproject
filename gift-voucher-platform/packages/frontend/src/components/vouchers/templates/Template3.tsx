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

const Template3: React.FC<TemplateProps> = ({
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
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        margin: 0,
        padding: 0,
        backgroundColor: '#f8f9fa',
        color: '#333',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '20px auto',
          background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          color: 'white',
        }}>
          <div style={{
            padding: '30px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
          }}>
            <div style={{
              backgroundColor: 'white',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              padding: '10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}>
              <img src={storeLogo || '/placeholder-logo.png'} alt={storeName} style={{
                maxWidth: '80px',
                maxHeight: '80px',
              }} />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '1px',
            }}>Gift Voucher</h1>
            <p style={{
              fontSize: '16px',
              opacity: 0.8,
              marginTop: '5px',
            }}>A special gift just for you</p>
          </div>
          
          <div style={{ padding: '30px' }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '25px',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.7,
                  marginBottom: '8px',
                }}>From</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}>{sender_name}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.7,
                  marginBottom: '8px',
                }}>To</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}>{receiver_name}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.7,
                  marginBottom: '8px',
                }}>Gift</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}>{productName}</div>
              </div>
              
              <div style={{ marginBottom: '0' }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.7,
                  marginBottom: '8px',
                }}>Valid Until</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}>{expirationDate}</div>
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              color: '#333',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '25px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '15px',
                color: '#6e8efb',
              }}>Personal Message</div>
              <div style={{
                fontSize: '16px',
                lineHeight: 1.6,
              }}>{message}</div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '25px',
            }}>
              <div style={{
                flex: '0 0 150px',
                marginRight: '25px',
              }}>
                {qrCode ? (
                  <img src={qrCode} alt="Scan to redeem" style={{
                    width: '100%',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    padding: '10px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }} />
                ) : (
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}></div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.7,
                  marginBottom: '8px',
                }}>Redemption Code</div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '20px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  marginTop: '10px',
                  letterSpacing: '2px',
                }}>{code}</div>
                <p>Scan the QR code or use this code to redeem your gift</p>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.1)',
            padding: '20px',
            textAlign: 'center',
            fontSize: '14px',
          }}>
            <div>{storeName} | {storeAddress}</div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '10px',
            }}>
              <div style={{
                margin: '5px 15px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{ marginRight: '8px', opacity: 0.8 }}>✉️</span> {storeEmail}
              </div>
              <div style={{
                margin: '5px 15px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{ marginRight: '8px', opacity: 0.8 }}>📞</span> {storePhone}
              </div>
              <div style={{
                margin: '5px 15px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{ marginRight: '8px', opacity: 0.8 }}>📱</span> {storeSocial}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template3; 