import { ClecoValue } from './cleco.value';
import { ClecoEntity } from '../entity/cleco.entity';

describe('ClecoValue', () => {
  const baseClecoData: ClecoEntity = {
    cleco_cod_clien: 1,
    cleco_cod_aebce: 'A011112',
    cleco_cod_saebc: '001',
    cleco_cod_dtfin: '001',
    cleco_cod_sebce: 'A',
    cleco_cod_ssgbc: '01',
    created_by: 1,
    updated_by: 1,
  };

  describe('Normalización de códigos BCE', () => {
    it('debe normalizar código actividad económica BCE: trim, uppercase y máximo 10 caracteres', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_aebce: '  a011112  ',
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_aebce).toBe('A011112');
    });

    it('debe truncar código actividad económica si excede 10 caracteres', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_aebce: 'A'.repeat(15),
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_aebce).toHaveLength(10);
    });

    it('debe normalizar código subactividad BCE: trim, uppercase y máximo 10 caracteres', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_saebc: '  001  ',
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_saebc).toBe('001');
    });

    it('debe normalizar código detalle financiero BCE: trim, uppercase y máximo 10 caracteres', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_dtfin: '  001  ',
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_dtfin).toBe('001');
    });

    it('debe normalizar código sector BCE: trim, uppercase y máximo 10 caracteres', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_sebce: '  a  ',
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_sebce).toBe('A');
    });

    it('debe normalizar código subsegmento BCE: trim, uppercase y máximo 10 caracteres', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_ssgbc: '  01  ',
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_ssgbc).toBe('01');
    });
  });

  describe('Manejo de valores vacíos', () => {
    it('debe manejar códigos BCE vacíos como string vacío', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_aebce: '',
        cleco_cod_saebc: '',
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_aebce).toBe('');
      expect(result.cleco_cod_saebc).toBe('');
    });

    it('debe manejar códigos BCE undefined como string vacío', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_aebce: undefined as any,
        cleco_cod_saebc: undefined as any,
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_aebce).toBe('');
      expect(result.cleco_cod_saebc).toBe('');
    });
  });

  describe('Asignación de ID', () => {
    it('debe usar el ID proporcionado en el constructor', () => {
      const value = new ClecoValue(baseClecoData, 123);
      const result = value.toJson();

      expect(result.cleco_cod_cleco).toBe(123);
    });

    it('debe usar el ID del data si no se proporciona en constructor', () => {
      const data = {
        ...baseClecoData,
        cleco_cod_cleco: 456,
      };

      const value = new ClecoValue(data);
      const result = value.toJson();

      expect(result.cleco_cod_cleco).toBe(456);
    });
  });

  describe('toJson()', () => {
    it('debe retornar todos los campos de la entidad', () => {
      const value = new ClecoValue(baseClecoData);
      const result = value.toJson();

      expect(result).toHaveProperty('cleco_cod_clien');
      expect(result).toHaveProperty('cleco_cod_aebce');
      expect(result).toHaveProperty('cleco_cod_saebc');
      expect(result).toHaveProperty('cleco_cod_dtfin');
      expect(result).toHaveProperty('cleco_cod_sebce');
      expect(result).toHaveProperty('cleco_cod_ssgbc');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('updated_by');
    });
  });
});

