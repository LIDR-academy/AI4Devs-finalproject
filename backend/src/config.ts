import dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  paymentBaseUrl: process.env.PAYMENT_BASE_URL || 'https://payments.example.test/pay'
};

