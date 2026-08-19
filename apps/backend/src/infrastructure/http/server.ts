import { createApp } from './app.js';
import { getEnvironment } from '../config/environment.js';
import { prisma } from '../database/prisma.client.js';
import { buildRepositoriesForEnvironment } from './composition.js';

const env = getEnvironment();
const productionRepositories = buildRepositoriesForEnvironment(env.NODE_ENV, prisma);
const app = createApp({ jwtSecret: env.JWT_SECRET, ...productionRepositories });

app.listen(env.PORT, () => {
  console.log(`🚀 RestoStock Backend corriendo en http://localhost:${env.PORT} en modo [${env.NODE_ENV}]`);
});
