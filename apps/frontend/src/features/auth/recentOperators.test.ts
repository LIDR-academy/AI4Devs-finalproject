import { describe, it, expect, beforeEach } from 'vitest';
import { getRecentOperatorIds, rememberOperatorId } from './recentOperators.js';

describe('TK-113-FE: recentOperators (chips de operario reciente, device-local)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('un dispositivo sin historial no tiene operarios recientes', () => {
    expect(getRecentOperatorIds()).toEqual([]);
  });

  it('recuerda un operario tras un login exitoso', () => {
    rememberOperatorId('op-1');
    expect(getRecentOperatorIds()).toEqual(['op-1']);
  });

  it('el mas reciente va primero', () => {
    rememberOperatorId('op-1');
    rememberOperatorId('op-2');
    expect(getRecentOperatorIds()).toEqual(['op-2', 'op-1']);
  });

  it('sin duplicados: relogear un operario lo mueve al frente en vez de repetirlo', () => {
    rememberOperatorId('op-1');
    rememberOperatorId('op-2');
    rememberOperatorId('op-1');
    expect(getRecentOperatorIds()).toEqual(['op-1', 'op-2']);
  });

  it('conserva como maximo 3 operarios recientes', () => {
    rememberOperatorId('op-1');
    rememberOperatorId('op-2');
    rememberOperatorId('op-3');
    rememberOperatorId('op-4');
    expect(getRecentOperatorIds()).toEqual(['op-4', 'op-3', 'op-2']);
  });

  it('ignora un id vacio o solo espacios', () => {
    rememberOperatorId('   ');
    expect(getRecentOperatorIds()).toEqual([]);
  });

  it('nunca persiste el PIN, solo el id de operario', () => {
    rememberOperatorId('op-1');
    const raw = localStorage.getItem('fefo-recent-operators');
    expect(raw).not.toContain('1234');
    expect(JSON.parse(raw ?? '[]')).toEqual(['op-1']);
  });
});
