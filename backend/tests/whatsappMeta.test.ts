import { describe, expect, it } from 'vitest';
import { parseMetaWebhook } from '../src/whatsapp/meta.js';

describe('Meta WhatsApp webhook parser', () => {
  it('uses interactive list ids as actionable messages', () => {
    const messages = parseMetaWebhook({
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [
                  {
                    profile: { name: 'Jean Forero' },
                    wa_id: '573132556327'
                  }
                ],
                messages: [
                  {
                    from: '573132556327',
                    interactive: {
                      list_reply: {
                        id: 'QUIERO COMPRAR AUD-BT-001',
                        title: 'Audifonos Bluetooth Pro'
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    });

    expect(messages).toEqual([
      {
        name: 'Jean Forero',
        phone: '573132556327',
        message: 'QUIERO COMPRAR AUD-BT-001',
        productSku: 'AUD-BT-001'
      }
    ]);
  });

  it('uses interactive button ids as actionable messages', () => {
    const messages = parseMetaWebhook({
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '573132556327',
                    interactive: {
                      button_reply: {
                        id: 'ACEPTO',
                        title: 'Aceptar oferta'
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    });

    expect(messages[0]).toMatchObject({
      phone: '573132556327',
      message: 'ACEPTO'
    });
  });

  it('does not assign a default product when the message has no product reference', () => {
    const messages = parseMetaWebhook({
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '573132556327',
                    text: {
                      body: 'Hola, quiero ver productos'
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    });

    expect(messages[0]).toEqual({
      name: '573132556327',
      phone: '573132556327',
      message: 'Hola, quiero ver productos'
    });
  });
});
