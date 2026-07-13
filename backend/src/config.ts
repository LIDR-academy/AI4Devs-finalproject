import dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });
dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const configuredPaymentBaseUrl = process.env.PAYMENT_BASE_URL?.replace(/\/$/, '');
const placeholderPaymentBaseUrl = 'https://payments.example.test/pay';

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  frontendUrl,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || frontendUrl)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  paymentBaseUrl:
    configuredPaymentBaseUrl && configuredPaymentBaseUrl !== placeholderPaymentBaseUrl
      ? configuredPaymentBaseUrl
      : `${frontendUrl.replace(/\/$/, '')}/pay`,
  defaultStoreName: process.env.DEFAULT_STORE_NAME || 'ComercIA Demo Store',
  defaultStorePhone: process.env.DEFAULT_STORE_PHONE || '+573001112233',
  whatsappProvider: process.env.WHATSAPP_PROVIDER || 'simulator',
  metaGraphApiVersion: process.env.META_GRAPH_API_VERSION || 'v20.0',
  metaWhatsappVerifyToken: process.env.META_WHATSAPP_VERIFY_TOKEN || '',
  metaWhatsappAccessToken: process.env.META_WHATSAPP_ACCESS_TOKEN || '',
  metaWhatsappPhoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
  metaAppSecret: process.env.META_APP_SECRET || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-5.5',
  conversationCloseAfterMinutes: Number(process.env.CONVERSATION_CLOSE_AFTER_MINUTES || 60)
};
