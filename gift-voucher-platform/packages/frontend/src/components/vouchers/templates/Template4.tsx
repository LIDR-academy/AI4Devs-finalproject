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

const Template4: React.FC<TemplateProps> = ({
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
        fontFamily: "'Georgia', serif",
        margin: 0,
        padding: 0,
        backgroundColor: '#f5f5f5',
        color: '#333',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '20px auto',
          backgroundColor: '#fff',
          border: '2px solid #d4af37',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative corners */}
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            backgroundColor: '#d4af37',
            top: '-50px',
            left: '-50px',
            transform: 'rotate(45deg)',
          }}></div>
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            backgroundColor: '#d4af37',
            top: '-50px',
            right: '-50px',
            transform: 'rotate(45deg)',
          }}></div>
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            backgroundColor: '#d4af37',
            bottom: '-50px',
            left: '-50px',
            transform: 'rotate(45deg)',
          }}></div>
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            backgroundColor: '#d4af37',
            bottom: '-50px',
            right: '-50px',
            transform: 'rotate(45deg)',
          }}></div>
          
          <div style={{
            textAlign: 'center',
            padding: '30px 20px',
            borderBottom: '1px solid #d4af37',
            position: 'relative',
          }}>
            <img src={storeLogo || '/placeholder-logo.png'} alt={storeName} style={{
              maxWidth: '120px',
              marginBottom: '15px',
            }} />
            <h1 style={{
              fontSize: '32px',
              color: '#d4af37',
              margin: 0,
              fontWeight: 'normal',
              letterSpacing: '2px',
            }}>GIFT VOUCHER</h1>
            <p style={{
              fontStyle: 'italic',
              color: '#666',
              marginTop: '5px',
            }}>A token of appreciation</p>
          </div>
          
          <div style={{
            padding: '30px',
            position: 'relative',
          }}>
            {/* Watermark */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-30deg)',
              fontSize: '120px',
              color: 'rgba(212, 175, 55, 0.1)',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>GIFT</div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
              marginBottom: '30px',
            }}>
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    fontStyle: 'italic',
                  }}>From</div>
                  <div style={{
                    fontSize: '18px',
                    color: '#333',
                    borderBottom: '1px dotted #d4af37',
                    paddingBottom: '5px',
                  }}>{sender_name}</div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    fontStyle: 'italic',
                  }}>Gift</div>
                  <div style={{
                    fontSize: '18px',
                    color: '#333',
                    borderBottom: '1px dotted #d4af37',
                    paddingBottom: '5px',
                  }}>{productName}</div>
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    fontStyle: 'italic',
                  }}>To</div>
                  <div style={{
                    fontSize: '18px',
                    color: '#333',
                    borderBottom: '1px dotted #d4af37',
                    paddingBottom: '5px',
                  }}>{receiver_name}</div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    fontStyle: 'italic',
                  }}>Valid Until</div>
                  <div style={{
                    fontSize: '18px',
                    color: '#333',
                    borderBottom: '1px dotted #d4af37',
                    paddingBottom: '5px',
                  }}>{expirationDate}</div>
                </div>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#f9f7f0',
              border: '1px solid #d4af37',
              padding: '20px',
              margin: '30px 0',
              position: 'relative',
            }}>
              <div style={{
                fontStyle: 'italic',
                lineHeight: 1.6,
                paddingLeft: '30px',
                position: 'relative',
                zIndex: 1,
              }}>{message}</div>
              {/* Quote mark */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontSize: '60px',
                color: 'rgba(212, 175, 55, 0.2)',
                fontFamily: 'Georgia, serif',
                lineHeight: 1,
              }}>"</div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#f9f7f0',
              border: '1px solid #d4af37',
            }}>
              <div style={{
                flex: '0 0 150px',
                marginRight: '20px',
              }}>
                {qrCode ? (
                  <img src={qrCode} alt="Scan to redeem" style={{
                    width: '100%',
                    border: '1px solid #d4af37',
                    padding: '5px',
                    backgroundColor: 'white',
                  }} />
                ) : (
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    border: '1px solid #d4af37',
                    padding: '5px',
                    backgroundColor: 'white',
                  }}></div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '5px',
                  fontStyle: 'italic',
                }}>Redemption Code</div>
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '24px',
                  color: '#d4af37',
                  letterSpacing: '2px',
                  margin: '10px 0',
                }}>{code}</div>
                <p>Present this voucher or scan the QR code to redeem your gift</p>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#f9f7f0',
            borderTop: '1px solid #d4af37',
            padding: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
          }}>
            <div>{storeName}</div>
            <div style={{
              height: '1px',
              background: 'linear-gradient(to right, transparent, #d4af37, transparent)',
              margin: '10px 0',
            }}></div>
            <div>{storeAddress} | {storeEmail} | {storePhone}</div>
            <div>{storeSocial}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template4; 