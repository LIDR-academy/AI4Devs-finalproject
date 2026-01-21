import { ClienValue } from './clien.value';
import { ClienEntity } from '../entity/clien.entity';

describe('ClienValue', () => {
  const baseClienteData: ClienEntity = {
    clien_cod_perso: 1,
    clien_cod_ofici: 1,
    clien_ctr_socio: false,
    clien_fec_ingin: new Date('2025-01-01'),
    clien_obs_clien: 'Cliente nuevo',
    created_by: 1,
    updated_by: 1,
  };

  describe('Normalización de datos', () => {
    it('debe normalizar observaciones: trim', () => {
      const data = {
        ...baseClienteData,
        clien_obs_clien: '  Cliente con espacios  ',
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_obs_clien).toBe('Cliente con espacios');
    });

    it('debe manejar observaciones undefined', () => {
      const data = {
        ...baseClienteData,
        clien_obs_clien: undefined,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_obs_clien).toBeUndefined();
    });
  });

  describe('Valores por defecto', () => {
    it('debe establecer clien_ctr_socio como false por defecto', () => {
      const data = {
        ...baseClienteData,
        clien_ctr_socio: undefined as any,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_ctr_socio).toBe(false);
    });

    it('debe mantener clien_ctr_socio cuando se proporciona', () => {
      const data = {
        ...baseClienteData,
        clien_ctr_socio: true,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_ctr_socio).toBe(true);
    });

    it('debe establecer clien_fec_salid como null por defecto', () => {
      const data = {
        ...baseClienteData,
        clien_fec_salid: undefined,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_fec_salid).toBeNull();
    });
  });

  describe('Asignación de ID', () => {
    it('debe usar el ID proporcionado en el constructor', () => {
      const value = new ClienValue(baseClienteData, 123);
      const result = value.toJson();

      expect(result.clien_cod_clien).toBe(123);
    });

    it('debe usar el ID del data si no se proporciona en constructor', () => {
      const data = {
        ...baseClienteData,
        clien_cod_clien: 456,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_cod_clien).toBe(456);
    });

    it('debe priorizar el ID del constructor sobre el ID del data', () => {
      const data = {
        ...baseClienteData,
        clien_cod_clien: 456,
      };

      const value = new ClienValue(data, 789);
      const result = value.toJson();

      expect(result.clien_cod_clien).toBe(789);
    });
  });

  describe('toJson()', () => {
    it('debe retornar solo campos definidos (no incluir undefined)', () => {
      const data = {
        ...baseClienteData,
        clien_obs_clien: undefined,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result).not.toHaveProperty('clien_obs_clien');
    });

    it('debe incluir todos los campos requeridos', () => {
      const value = new ClienValue(baseClienteData);
      const result = value.toJson();

      expect(result).toHaveProperty('clien_cod_perso');
      expect(result).toHaveProperty('clien_cod_ofici');
      expect(result).toHaveProperty('clien_ctr_socio');
      expect(result).toHaveProperty('clien_fec_ingin');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('updated_by');
    });

    it('debe incluir campos opcionales cuando tienen valor', () => {
      const data = {
        ...baseClienteData,
        clien_obs_clien: 'Observaciones del cliente',
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result).toHaveProperty('clien_obs_clien');
      expect(result.clien_obs_clien).toBe('Observaciones del cliente');
    });
  });

  describe('Manejo de fechas', () => {
    it('debe mantener fecha de ingreso', () => {
      const fechaIngreso = new Date('2025-01-15');
      const data = {
        ...baseClienteData,
        clien_fec_ingin: fechaIngreso,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_fec_ingin).toEqual(fechaIngreso);
    });

    it('debe manejar fecha de salida como null', () => {
      const data = {
        ...baseClienteData,
        clien_fec_salid: null,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_fec_salid).toBeNull();
    });

    it('debe mantener fecha de salida cuando se proporciona', () => {
      const fechaSalida = new Date('2025-12-31');
      const data = {
        ...baseClienteData,
        clien_fec_salid: fechaSalida,
      };

      const value = new ClienValue(data);
      const result = value.toJson();

      expect(result.clien_fec_salid).toEqual(fechaSalida);
    });
  });
});

