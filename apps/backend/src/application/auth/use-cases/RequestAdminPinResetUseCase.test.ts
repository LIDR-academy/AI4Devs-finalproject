import { describe, it, expect, vi, afterEach } from 'vitest';
import { RequestAdminPinResetUseCase } from './RequestAdminPinResetUseCase.js';
import { InMemoryUserRepository } from '../../../infrastructure/auth/repositories/InMemoryUserRepository.js';
import { ConsoleEmailService } from '../../../infrastructure/notifications/ConsoleEmailService.js';
import { User } from '../../../domain/auth/entities/User.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';

function buildRepoWithAdmin(): InMemoryUserRepository {
  const repo = new InMemoryUserRepository();
  repo.seedUser(
    new User({
      id: 'usr-admin-1',
      name: 'Maria Silva',
      role: 'ADMIN',
      pin: Pin.createFromRaw('1234'),
      email: 'admin@restostock.com',
      status: 'ACTIVE',
      failedAttempts: 0,
    })
  );
  return repo;
}

describe('RequestAdminPinResetUseCase — Expiracion y Resolucion de Origin (AUDIT-DEV-002)', () => {
  const originalClientOrigin = process.env.CLIENT_ORIGIN;

  afterEach(() => {
    if (originalClientOrigin === undefined) {
      delete process.env.CLIENT_ORIGIN;
    } else {
      process.env.CLIENT_ORIGIN = originalClientOrigin;
    }
  });

  it('calcula la expiracion del token en exactamente 15 minutos, ni mas ni menos', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const repo = buildRepoWithAdmin();
    const useCase = new RequestAdminPinResetUseCase(repo, new ConsoleEmailService());

    await useCase.execute({ email: 'admin@restostock.com' });

    const updated = await repo.findById('usr-admin-1');
    // ORACULO ESTADO: exactamente +15min, no +15s ni +15h — mata mutantes aritmeticos
    // sobre `15 * 60 * 1000` que una asercion tipo "> Date.now()" no detecta.
    expect(updated?.resetTokenExpires?.toISOString()).toBe('2026-01-01T00:15:00.000Z');

    vi.useRealTimers();
  });

  it('usa clientOrigin del DTO cuando esta presente, para construir el resetUrl', async () => {
    delete process.env.CLIENT_ORIGIN;
    const repo = buildRepoWithAdmin();
    const emailService = new ConsoleEmailService();
    const useCase = new RequestAdminPinResetUseCase(repo, emailService);

    await useCase.execute({ email: 'admin@restostock.com', clientOrigin: 'https://admin.restostock.com' });

    const lastEmail = emailService.getLastSentEmail();
    expect(lastEmail?.resetUrl.startsWith('https://admin.restostock.com?resetToken=')).toBe(true);
  });

  it('usa CLIENT_ORIGIN del entorno cuando no hay clientOrigin explicito en el DTO', async () => {
    process.env.CLIENT_ORIGIN = 'https://env-origin.example.com';
    const repo = buildRepoWithAdmin();
    const emailService = new ConsoleEmailService();
    const useCase = new RequestAdminPinResetUseCase(repo, emailService);

    await useCase.execute({ email: 'admin@restostock.com' });

    const lastEmail = emailService.getLastSentEmail();
    expect(lastEmail?.resetUrl.startsWith('https://env-origin.example.com?resetToken=')).toBe(true);
  });

  it('usa el fallback http://localhost:8085 cuando no hay clientOrigin ni CLIENT_ORIGIN', async () => {
    delete process.env.CLIENT_ORIGIN;
    const repo = buildRepoWithAdmin();
    const emailService = new ConsoleEmailService();
    const useCase = new RequestAdminPinResetUseCase(repo, emailService);

    await useCase.execute({ email: 'admin@restostock.com' });

    const lastEmail = emailService.getLastSentEmail();
    expect(lastEmail?.resetUrl.startsWith('http://localhost:8085?resetToken=')).toBe(true);
  });
});
