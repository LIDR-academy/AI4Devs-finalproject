/**
 * Prisma seed entrypoint.
 * Delegates to development seed only. Production container startup must never
 * invoke this file automatically (see docker-entrypoint.sh / US-010).
 */
import 'dotenv/config';
import { DevSeedError } from '../src/common/utils/admin-bootstrap';
import { runDevSeed } from './seed-dev';

runDevSeed().catch((error: unknown) => {
  if (error instanceof DevSeedError) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
