import http from 'http';
import app from './app';
import { env } from '@/config/env';
import { prisma } from '@/infrastructure/database/prisma';
import { SocketService } from '@/infrastructure/websocket/socket.service';
import { JobEventListener } from '@/infrastructure/events/job-event.listener';

const server = http.createServer(app);

// Initialize Socket Service
SocketService.initialize(server);

// Initialize Job Event Listener
new JobEventListener();

const start = async () => {
  try {
    // Check DB Connection
    await prisma.$connect();
    console.log('✅ Database connected');

    server.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
