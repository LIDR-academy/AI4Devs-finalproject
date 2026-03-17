import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    https: getHttpsConfig()
  }
});

function getHttpsConfig(): false | { key: Buffer; cert: Buffer } {
  const enable = process.env.VITE_HTTPS === 'true';
  if (!enable) return false;
  const certDir = process.env.VITE_HTTPS_CERT_DIR || path.resolve(__dirname, 'certs');
  const keyPath = process.env.VITE_HTTPS_KEY || path.join(certDir, 'localhost-key.pem');
  const certPath = process.env.VITE_HTTPS_CERT || path.join(certDir, 'localhost.pem');
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }
  return false;
}

