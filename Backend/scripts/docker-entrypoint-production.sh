#!/bin/sh
# Production entrypoint: wait for PostgreSQL, run migrations, start the app. Use LF line endings only.

node -e "
const net = require('net');
let host = process.env.DB_HOST;
let port = parseInt(process.env.DB_PORT || '5432', 10);
if (process.env.DATABASE_URL) {
  const u = new URL(process.env.DATABASE_URL);
  host = u.hostname;
  port = parseInt(u.port || '5432', 10);
}
host = host || 'postgres';
console.log('Waiting for PostgreSQL at ' + host + ':' + port + '...');
const tryConnect = () => {
  const socket = net.createConnection(port, host, () => {
    socket.destroy();
    process.exit(0);
  });
  socket.on('error', () => {
    setTimeout(tryConnect, 1000);
  });
};
tryConnect();
" || exit
echo "PostgreSQL is ready."

echo "PostgreSQL is ready."

if [ -n "$RUN_MIGRATION_ONLY" ]; then
  echo "Running migrations only (RUN_MIGRATION_ONLY set)..."
  npm run migration:run || exit
  exit 0
fi

echo "Running migrations..."
npm run migration:run || exit

echo "Starting application..."
# Nest compila main.ts bajo sourceRoot 'src', por lo que el entrypoint es dist/src/main.js
exec node dist/src/main.js
