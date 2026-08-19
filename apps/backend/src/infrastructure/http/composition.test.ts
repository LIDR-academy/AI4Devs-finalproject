import { describe, it, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildRepositoriesForEnvironment } from './composition.js';
import { PrismaStockRepository } from '../stock/repositories/PrismaStockRepository.js';
import { PrismaUserRepository } from '../auth/repositories/PrismaUserRepository.js';
import { PrismaRemanenteQueryRepository } from '../kitchen/repositories/PrismaRemanenteQueryRepository.js';

describe('buildRepositoriesForEnvironment — evita que producción corra silenciosamente en memoria', () => {
  const fakePrisma = {} as PrismaClient;

  it('en NODE_ENV development/test no fuerza ninguna repository (createApp mantiene sus defaults InMemory)', () => {
    expect(buildRepositoriesForEnvironment('development', fakePrisma)).toEqual({});
    expect(buildRepositoriesForEnvironment('test', fakePrisma)).toEqual({});
    expect(buildRepositoriesForEnvironment(undefined, fakePrisma)).toEqual({});
  });

  it('en NODE_ENV=production instancia las 3 repositories Prisma que sí existen (Stock, User, RemanenteQuery)', () => {
    const repos = buildRepositoriesForEnvironment('production', fakePrisma);

    expect(repos.stockRepository).toBeInstanceOf(PrismaStockRepository);
    expect(repos.userRepository).toBeInstanceOf(PrismaUserRepository);
    expect(repos.remanenteQueryRepository).toBeInstanceOf(PrismaRemanenteQueryRepository);
  });

  it('en producción advierte explícitamente (no en silencio) que report/recipe/reconciliation siguen en memoria', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    buildRepositoriesForEnvironment('production', fakePrisma);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/reportRepository|recipeRepository|reconciliationRepository/));
    warnSpy.mockRestore();
  });
});
