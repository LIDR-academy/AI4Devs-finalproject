import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from './errors';
import { AxiosError } from 'axios';

describe('getApiErrorMessage', () => {
  it('debería devolver response.data.message cuando es string', () => {
    const err = new AxiosError(
      'Bad Request',
      '400',
      undefined,
      undefined,
      {
        data: { message: 'Conflicto de horario en el quirófano.' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      },
    );
    expect(getApiErrorMessage(err, 'Fallback')).toBe('Conflicto de horario en el quirófano.');
  });

  it('debería unir response.data.message cuando es array', () => {
    const err = new AxiosError(
      'Bad Request',
      '400',
      undefined,
      undefined,
      {
        data: { message: ['Campo requerido', 'Formato inválido'] },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      },
    );
    expect(getApiErrorMessage(err, 'Fallback')).toBe('Campo requerido, Formato inválido');
  });

  it('debería devolver error.message cuando no hay response.data.message', () => {
    const err = new Error('Network error');
    expect(getApiErrorMessage(err, 'Fallback')).toBe('Network error');
  });

  it('debería devolver fallback cuando error es null o undefined', () => {
    expect(getApiErrorMessage(null, 'Algo falló')).toBe('Algo falló');
    expect(getApiErrorMessage(undefined, 'Algo falló')).toBe('Algo falló');
  });

  it('debería devolver error.message cuando AxiosError tiene response.data sin message', () => {
    const err = new AxiosError('Bad Request', '400', undefined, undefined, {
      data: {},
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    });
    expect(getApiErrorMessage(err, 'Algo falló')).toBe('Bad Request');
  });
});
