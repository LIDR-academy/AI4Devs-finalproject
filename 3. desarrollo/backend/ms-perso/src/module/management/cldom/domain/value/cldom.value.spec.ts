import { CldomValue } from './cldom.value';
import { CldomEntity } from '../entity/cldom.entity';

describe('CldomValue', () => {
  const baseCldomData: CldomEntity = {
    cldom_cod_clien: 1,
    cldom_cod_provi: '17',
    cldom_cod_canto: '01',
    cldom_cod_parro: '01',
    cldom_dir_domic: 'Calle Principal 123',
    created_by: 1,
    updated_by: 1,
  };

  describe('Normalización de códigos GEO', () => {
    it('debe normalizar código provincia: trim y padStart con ceros (2 dígitos)', () => {
      const data = {
        ...baseCldomData,
        cldom_cod_provi: '  17  ',
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_cod_provi).toBe('17');
    });

    it('debe agregar ceros a la izquierda si código provincia tiene menos de 2 dígitos', () => {
      const data = {
        ...baseCldomData,
        cldom_cod_provi: '7',
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_cod_provi).toBe('07');
    });

    it('debe normalizar código cantón: trim y padStart con ceros (4 dígitos)', () => {
      const data = {
        ...baseCldomData,
        cldom_cod_canto: '  1  ',
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_cod_canto).toBe('0001');
    });

    it('debe normalizar código parroquia: trim y padStart con ceros (6 dígitos)', () => {
      const data = {
        ...baseCldomData,
        cldom_cod_parro: '  1  ',
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_cod_parro).toBe('000001');
    });
  });

  describe('Normalización de dirección', () => {
    it('debe normalizar dirección: trim y mayúsculas', () => {
      const data = {
        ...baseCldomData,
        cldom_dir_domic: '  calle principal 123  ',
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_dir_domic).toBe('CALLE PRINCIPAL 123');
    });
  });

  describe('Normalización de teléfono y referencia', () => {
    it('debe normalizar teléfono: trim', () => {
      const data = {
        ...baseCldomData,
        cldom_tlf_domic: '  0999999999  ',
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_tlf_domic).toBe('0999999999');
    });

    it('debe manejar teléfono como null cuando es undefined', () => {
      const data = {
        ...baseCldomData,
        cldom_tlf_domic: undefined,
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_tlf_domic).toBeNull();
    });

    it('debe normalizar referencia: trim y mayúsculas', () => {
      const data = {
        ...baseCldomData,
        cldom_sit_refdo: '  frente al parque  ',
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_sit_refdo).toBe('FRENTE AL PARQUE');
    });

    it('debe manejar referencia como null cuando es undefined', () => {
      const data = {
        ...baseCldomData,
        cldom_sit_refdo: undefined,
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_sit_refdo).toBeNull();
    });
  });

  describe('Coordenadas GPS', () => {
    it('debe mantener coordenadas cuando se proporcionan', () => {
      const data = {
        ...baseCldomData,
        cldom_lat_coord: -0.180653,
        cldom_lon_coord: -78.467834,
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_lat_coord).toBe(-0.180653);
      expect(result.cldom_lon_coord).toBe(-78.467834);
    });

    it('debe manejar coordenadas como null cuando son undefined', () => {
      const data = {
        ...baseCldomData,
        cldom_lat_coord: undefined,
        cldom_lon_coord: undefined,
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_lat_coord).toBeNull();
      expect(result.cldom_lon_coord).toBeNull();
    });
  });

  describe('Asignación de ID', () => {
    it('debe usar el ID proporcionado en el constructor', () => {
      const value = new CldomValue(baseCldomData, 123);
      const result = value.toJson();

      expect(result.cldom_cod_cldom).toBe(123);
    });

    it('debe usar el ID del data si no se proporciona en constructor', () => {
      const data = {
        ...baseCldomData,
        cldom_cod_cldom: 456,
      };

      const value = new CldomValue(data);
      const result = value.toJson();

      expect(result.cldom_cod_cldom).toBe(456);
    });
  });

  describe('toJson()', () => {
    it('debe retornar todos los campos de la entidad', () => {
      const value = new CldomValue(baseCldomData);
      const result = value.toJson();

      expect(result).toHaveProperty('cldom_cod_clien');
      expect(result).toHaveProperty('cldom_cod_provi');
      expect(result).toHaveProperty('cldom_cod_canto');
      expect(result).toHaveProperty('cldom_cod_parro');
      expect(result).toHaveProperty('cldom_dir_domic');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('updated_by');
    });
  });
});

