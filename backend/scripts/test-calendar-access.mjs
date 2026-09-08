import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env') });

const REQUIRED_ENV_VARS = [
  'GOOGLE_CALENDAR_SA_EMAIL',
  'GOOGLE_CALENDAR_SA_KEY_PATH',
  'GOOGLE_CALENDAR_ID_DEV',
  'GOOGLE_CALENDAR_ID_STAGING',
  'GOOGLE_CALENDAR_ID_PROD',
];

for (const varName of REQUIRED_ENV_VARS) {
  if (!process.env[varName]) {
    console.error(`Missing required env var: ${varName}`);
    process.exit(1);
  }
}

const keyPath = resolve(process.cwd(), process.env.GOOGLE_CALENDAR_SA_KEY_PATH);

if (!existsSync(keyPath)) {
  console.error(`Key file not found at: ${keyPath}`);
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(readFileSync(keyPath, 'utf-8')),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

const CALENDARS = [
  { name: 'dev', id: process.env.GOOGLE_CALENDAR_ID_DEV },
  { name: 'staging', id: process.env.GOOGLE_CALENDAR_ID_STAGING },
  { name: 'prod', id: process.env.GOOGLE_CALENDAR_ID_PROD },
];

let exitCode = 0;

console.log('Verifying access to each system calendar by Calendar ID:\n');

for (const env of CALENDARS) {
  try {
    const res = await calendar.calendars.get({ calendarId: env.id });
    console.log(`  ✓ [${env.name}] Access OK — "${res.data.summary}" (${res.data.id})`);
  } catch (err) {
    console.error(`  ✗ [${env.name}] Access DENIED — ${err.message}`);
    exitCode = 1;
  }
}

console.log();

if (exitCode === 0) {
  console.log('All 3 system calendars accessible. Verification PASSED.');
} else {
  console.error('One or more calendars not accessible. Verification FAILED.');
}

process.exit(exitCode);
