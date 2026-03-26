/**
 * E2E test setup. Loads env so test overrides (e.g. DB_NAME) win.
 * .env.test is loaded last so DB_NAME=travelsplit_test is used when file exists.
 */
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });
config({ path: '.env.test' });
