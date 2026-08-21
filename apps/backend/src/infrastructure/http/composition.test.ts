import { describe, it, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildRepositoriesForEnvironment } from './composition.js';
import { PrismaStockRepository } from '../stock/repositories/PrismaStockRepository.js';
import { PrismaUserRepository } from '../auth/repositories/PrismaUserRepository.js';
import { PrismaRemanenteQueryRepository } from '../kitchen/repositories/PrismaRemanenteQueryRepository.js';
import { PrismaReportRepository } from '../reports/repositories/PrismaReportRepository.js';
import { PrismaRecipeRepository } from '../catalog/repositories/PrismaRecipeRepository.js';
import { PrismaShiftReconciliationRepository } from '../kitchen/repositories/PrismaShiftReconciliationRepository.js';

describe('buildRepositoriesForEnvironment — evita que producción corra silenciosamente en memoria', () => {
  const fakePrisma = {} as PrismaClient;

  it('en NODE_ENV development/test no fuerza ninguna repository (createApp mantiene sus defaults InMemory)', () => {
    expect(buildRepositoriesForEnvironment('development', fakePrisma)).toEqual({});
    expect(buildRepositoriesForEnvironment('test', fakePrisma)).toEqual({});
    expect(buildRepositoriesForEnvironment(undefined, fakePrisma)).toEqual({});
  });

  it('en NODE_ENV=production instancia las 6 repositories Prisma (persistencia completa, TK-048)', () => {
    const repos = buildRepositoriesForEnvironment('production', fakePrisma);

    expect(repos.stockRepository).toBeInstanceOf(PrismaStockRepository);
    expect(repos.userRepository).toBeInstanceOf(PrismaUserRepository);
    expect(repos.remanenteQueryRepository).toBeInstanceOf(PrismaRemanenteQueryRepository);
    expect(repos.reportRepository).toBeInstanceOf(PrismaReportRepository);
    expect(repos.recipeRepository).toBeInstanceOf(PrismaRecipeRepository);
    expect(repos.reconciliationRepository).toBeInstanceOf(PrismaShiftReconciliationRepository);
  });

  it('en producción NO advierte de persistencia parcial — las 6 repositories son Prisma-backed', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    buildRepositoriesForEnvironment('production', fakePrisma);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
