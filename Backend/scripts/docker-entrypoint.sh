#!/bin/sh
# Wait for PostgreSQL, run migrations, then start the app. Use LF line endings only.

echo "Waiting for PostgreSQL at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
node -e "
const net = require('net');
const host = process.env.DB_HOST || 'postgres';
const port = parseInt(process.env.DB_PORT || '5432', 10);
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

echo "PostgreSQL is ready. Running migrations..."
npm run migration:run || exit

echo "Starting application..."
exec npm run start:dev
