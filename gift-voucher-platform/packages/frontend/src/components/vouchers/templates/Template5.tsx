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

const Template5: React.FC<TemplateProps> = ({
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
        fontFamily: "'Montserrat', sans-serif",
        margin: 0,
        padding: 0,
        backgroundColor: '#f0f0f0',
        color: '#333',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '20px auto',
          backgroundColor: '#fff',
          overflow: 'hidden',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          borderRadius: '4px',
        }}>
          <div style={{
            background: 'linear-gradient(to right, #00c6ff, #0072ff)',
            color: 'white',
            padding: '30px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Header background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              zIndex: 1,
            }}></div>
            
            <div style={{
              position: 'relative',
              zIndex: 2,
            }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '20px',
              }}>
                <img src={storeLogo || '/placeholder-logo.png'} alt={storeName} style={{
                  height: '40px',
                  display: 'block',
                }} />
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>Gift Voucher</h1>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                margin: 0,
              }}>A special treat awaits you!</p>
            </div>
          </div>
          
          <div style={{ padding: '30px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginBottom: '30px',
              gap: '20px',
            }}>
              <div style={{
                flex: 1,
                minWidth: '200px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: '#0072ff',
                  fontWeight: 600,
                  marginBottom: '10px',
                  letterSpacing: '1px',
                }}>From</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}>{sender_name}</div>
              </div>
              
              <div style={{
                flex: 1,
                minWidth: '200px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: '#0072ff',
                  fontWeight: 600,
                  marginBottom: '10px',
                  letterSpacing: '1px',
                }}>To</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}>{receiver_name}</div>
              </div>
              
              <div style={{
                flex: 1,
                minWidth: '200px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: '#0072ff',
                  fontWeight: 600,
                  marginBottom: '10px',
                  letterSpacing: '1px',
                }}>Gift</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}>{productName}</div>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  marginTop: '10px',
                }}>Valid until {expirationDate}</div>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '20px',
                backgroundColor: '#0072ff',
                color: 'white',
                padding: '5px 15px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderRadius: '20px',
              }}>Personal Message</div>
              <div style={{
                marginTop: '15px',
                lineHeight: 1.6,
              }}>{message}</div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              padding: '20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                flex: '0 0 150px',
                marginRight: '20px',
              }}>
                {qrCode ? (
                  <img src={qrCode} alt="Scan to redeem" style={{
                    width: '100%',
                    borderRadius: '4px',
                  }} />
                ) : (
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    backgroundColor: '#eee',
                    borderRadius: '4px',
                  }}></div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: '#0072ff',
                  fontWeight: 600,
                  marginBottom: '10px',
                  letterSpacing: '1px',
                }}>Redemption Code</div>
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '24px',
                  backgroundColor: '#e9f4ff',
                  padding: '10px',
                  borderRadius: '4px',
                  borderLeft: '4px solid #0072ff',
                  marginBottom: '10px',
                }}>{code}</div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                }}>
                  To redeem your gift, present this voucher at the store or scan the QR code.
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#f9f9f9',
            borderTop: '1px solid #eee',
            padding: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
          }}>
            <div style={{ marginBottom: '10px' }}>{storeName} - {storeAddress}</div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <div style={{
                margin: '0 10px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{ width: '16px', height: '16px', marginRight: '5px', fill: '#0072ff' }} viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                {storeEmail}
              </div>
              <div style={{
                margin: '0 10px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{ width: '16px', height: '16px', marginRight: '5px', fill: '#0072ff' }} viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {storePhone}
              </div>
              <div style={{
                margin: '0 10px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{ width: '16px', height: '16px', marginRight: '5px', fill: '#0072ff' }} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                {storeSocial}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template5; 