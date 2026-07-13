import { config } from '../config.js';

export type IncomingWhatsappMessage = {
  name: string;
  phone: string;
  message: string;
  productSku?: string;
};

export type WhatsappListRow = {
  id: string;
  title: string;
  description?: string;
};

export type WhatsappReplyButton = {
  id: string;
  title: string;
};

export function parseMetaWebhook(payload: unknown): IncomingWhatsappMessage[] {
  const messages: IncomingWhatsappMessage[] = [];
  const root = payload as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
          messages?: Array<{
            from?: string;
            text?: { body?: string };
            button?: { text?: string };
            interactive?: {
              button_reply?: { id?: string; title?: string };
              list_reply?: { id?: string; title?: string };
            };
          }>;
        };
      }>;
    }>;
  };

  for (const entry of root.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      const contact = value?.contacts?.[0];
      for (const item of value?.messages || []) {
        const body =
          item.text?.body ||
          item.button?.text ||
          item.interactive?.button_reply?.id ||
          item.interactive?.list_reply?.id ||
          item.interactive?.button_reply?.title ||
          item.interactive?.list_reply?.title ||
          '';

        if (!item.from || !body) continue;

        const productSku = extractProductSku(body);

        messages.push({
          name: contact?.profile?.name || contact?.wa_id || item.from,
          phone: item.from,
          message: body,
          ...(productSku ? { productSku } : {})
        });
      }
    }
  }

  return messages;
}

export function isMetaWebhookPayload(payload: unknown) {
  return Boolean((payload as { object?: string }).object === 'whatsapp_business_account');
}

export async function sendWhatsappText(phone: string, body: string) {
  return sendWhatsappPayload({
    messaging_product: 'whatsapp',
    to: normalizeWhatsappPhone(phone),
    type: 'text',
    text: {
      preview_url: true,
      body
    }
  });
}

export async function sendWhatsappList(phone: string, input: {
  header: string;
  body: string;
  footer?: string;
  button: string;
  rows: WhatsappListRow[];
}) {
  return sendWhatsappPayload({
    messaging_product: 'whatsapp',
    to: normalizeWhatsappPhone(phone),
    type: 'interactive',
    interactive: {
      type: 'list',
      header: {
        type: 'text',
        text: truncateWhatsapp(input.header, 60)
      },
      body: {
        text: truncateWhatsapp(input.body, 1024)
      },
      footer: input.footer ? { text: truncateWhatsapp(input.footer, 60) } : undefined,
      action: {
        button: truncateWhatsapp(input.button, 20),
        sections: [
          {
            title: 'Productos',
            rows: input.rows.slice(0, 10).map((row) => ({
              id: truncateWhatsapp(row.id, 200),
              title: truncateWhatsapp(row.title, 24),
              description: row.description ? truncateWhatsapp(row.description, 72) : undefined
            }))
          }
        ]
      }
    }
  });
}

export async function sendWhatsappReplyButtons(phone: string, body: string, buttons: WhatsappReplyButton[]) {
  return sendWhatsappPayload({
    messaging_product: 'whatsapp',
    to: normalizeWhatsappPhone(phone),
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: truncateWhatsapp(body, 1024)
      },
      action: {
        buttons: buttons.slice(0, 3).map((button) => ({
          type: 'reply',
          reply: {
            id: truncateWhatsapp(button.id, 256),
            title: truncateWhatsapp(button.title, 20)
          }
        }))
      }
    }
  });
}

export async function sendWhatsappCtaUrl(phone: string, input: {
  body: string;
  buttonText: string;
  url: string;
}) {
  return sendWhatsappPayload({
    messaging_product: 'whatsapp',
    to: normalizeWhatsappPhone(phone),
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      body: {
        text: truncateWhatsapp(input.body, 1024)
      },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: truncateWhatsapp(input.buttonText, 20),
          url: input.url
        }
      }
    }
  });
}

async function sendWhatsappPayload(payload: Record<string, unknown>) {
  if (config.whatsappProvider !== 'meta') {
    console.warn('WhatsApp send skipped because WHATSAPP_PROVIDER is not meta', {
      provider: config.whatsappProvider,
      to: maskWhatsappPhone(String(payload.to || ''))
    });
    return { skipped: true, provider: config.whatsappProvider };
  }

  if (!config.metaWhatsappAccessToken || !config.metaWhatsappPhoneNumberId) {
    throw new Error(`Missing Meta WhatsApp credentials: accessToken=${Boolean(config.metaWhatsappAccessToken)} phoneNumberId=${Boolean(config.metaWhatsappPhoneNumberId)}`);
  }

  const response = await fetch(
    `https://graph.facebook.com/${config.metaGraphApiVersion}/${config.metaWhatsappPhoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.metaWhatsappAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(removeUndefined(payload))
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meta WhatsApp send failed: ${response.status} ${error}`);
  }

  const result = await response.json();
  console.info('WhatsApp send accepted by Meta', {
    to: maskWhatsappPhone(String(payload.to || '')),
    type: payload.type,
    messageId: Array.isArray(result.messages) ? result.messages[0]?.id : undefined
  });
  return result;
}

function normalizeWhatsappPhone(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

function maskWhatsappPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length <= 4) return digits ? `***${digits}` : '';
  return `***${digits.slice(-4)}`;
}

function truncateWhatsapp(value: string, maxLength: number) {
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, Math.max(0, maxLength - 3))}...`;
}

function removeUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, removeUndefined(entry)])
  );
}

function extractProductSku(message: string) {
  const explicit = message.match(/(?:sku|ref|producto)\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{2,})/i);
  if (explicit) return explicit[1].toUpperCase();

  const genericSku = message.match(/\b[A-Z]{2,}[A-Z0-9]*-[A-Z0-9-]{2,}\b/i);
  return genericSku?.[0].toUpperCase();
}
