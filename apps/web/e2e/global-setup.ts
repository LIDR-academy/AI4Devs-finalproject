import { execSync } from 'node:child_process';
import path from 'node:path';

export default function globalSetup(): void {
  const apiDir = path.resolve(__dirname, '../../api');

  execSync('npx prisma db seed', {
    cwd: apiDir,
    stdio: 'inherit',
    env: process.env,
  });
}
