import { createDatabase } from './database.js';
import { seedDemoData } from './seedData.js';

const db = createDatabase();
seedDemoData(db);
db.close();

console.log('Demo data ready');

