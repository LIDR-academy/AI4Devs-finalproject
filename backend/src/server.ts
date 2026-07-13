import { createApp } from './app.js';
import { config } from './config.js';
import { createDatabase } from './db/database.js';

const db = createDatabase();
const app = createApp(db);

const server = app.listen(config.port, () => {
  console.log(`ComercIA backend listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

