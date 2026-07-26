import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  let credential: admin.ServiceAccount;
  try {
    credential = JSON.parse(serviceAccount) as admin.ServiceAccount;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be a valid JSON string');
  }

  admin.initializeApp({
    credential: admin.credential.cert(credential),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
