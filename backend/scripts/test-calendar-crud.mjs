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

const CALENDAR_IDS = [
  { name: 'dev', id: process.env.GOOGLE_CALENDAR_ID_DEV },
  { name: 'staging', id: process.env.GOOGLE_CALENDAR_ID_STAGING },
  { name: 'prod', id: process.env.GOOGLE_CALENDAR_ID_PROD },
];

let exitCode = 0;

for (const env of CALENDAR_IDS) {
  console.log(`\n=== Testing ${env.name} calendar (${env.id}) ===`);

  try {
    // CREATE
    const created = await calendar.events.insert({
      calendarId: env.id,
      requestBody: {
        summary: 'Test Event (delete me)',
        description: 'Created by test-calendar-crud.mjs',
        start: { dateTime: new Date(Date.now() + 86400000).toISOString(), timeZone: 'UTC' },
        end: { dateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), timeZone: 'UTC' },
      },
    });
    const eventId = created.data.id;
    console.log(`  CREATE: OK (event id: ${eventId})`);

    // READ
    const read = await calendar.events.get({ calendarId: env.id, eventId });
    console.log(`  READ: OK (summary: "${read.data.summary}")`);

    // UPDATE
    await calendar.events.update({
      calendarId: env.id,
      eventId,
      requestBody: { ...read.data, summary: 'Test Event (updated)' },
    });
    const updated = await calendar.events.get({ calendarId: env.id, eventId });
    console.log(`  UPDATE: OK (summary: "${updated.data.summary}")`);

    // DELETE
    await calendar.events.delete({ calendarId: env.id, eventId });
    console.log(`  DELETE: OK`);

    console.log(`  ${env.name}: ALL OPERATIONS PASSED`);
  } catch (err) {
    console.error(`  ${env.name}: FAILED — ${err.message}`);
    exitCode = 1;
  }
}

console.log(`\n${exitCode === 0 ? 'All CRUD tests PASSED.' : 'Some CRUD tests FAILED.'}`);
process.exit(exitCode);
