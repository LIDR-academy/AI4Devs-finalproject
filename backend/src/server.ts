import { config } from './config.js';
import { createPostgresPool, migratePostgres } from './db/postgres.js';
import { createPostgresApp } from './pgApp.js';

const runtime = await createRuntime();

const server = runtime.app.listen(config.port, () => {
  console.log(`ComercIA backend listening on http://localhost:${config.port} (${runtime.kind})`);
});

function shutdown() {
  server.close(async () => {
    await runtime.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function createRuntime() {
  if (config.databaseUrl) {
    const pool = createPostgresPool();
    await migratePostgres(pool);
    return {
      kind: 'postgres',
      app: createPostgresApp(pool),
      close: () => pool.end()
    };
  }

  const { createDatabase } = await import('./db/database.js');
  const { createApp } = await import('./app.js');
  const db = createDatabase();
  return {
    kind: 'sqlite',
    app: createApp(db),
    close: async () => db.close()
  };
}
