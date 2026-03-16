import { ClbncValue } from './clbnc.value';
import { ClbncEntity } from '../entity/clbnc.entity';

describe('ClbncValue', () => {
  const baseClbncData: ClbncEntity = {
    clbnc_cod_clien: 1,
    clbnc_usr_banca: 'usuario@email.com',
    clbnc_pwd_banca: '$2b$12$hashedpassword',
    clbnc_fec_regis: new Date('2025-01-01'),
    clbnc_ctr_activ: true,
    clbnc_ctr_termi: true,
    clbnc_lim_diario: 1000.00,
    clbnc_lim_mensu: 15000.00,
    created_by: 1,
    updated_by: 1,
  };

  describe('Normalización de username', () => {
    it('debe normalizar username: trim, lowercase y máximo 150 caracteres', () => {
      const data = {
        ...baseClbncData,
        clbnc_usr_banca: '  Usuario@EMAIL.COM  ',
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_usr_banca).toBe('usuario@email.com');
    });

    it('debe truncar username si excede 150 caracteres', () => {
      const longUsername = 'a'.repeat(200);
      const data = {
        ...baseClbncData,
        clbnc_usr_banca: longUsername,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_usr_banca).toHaveLength(150);
      expect(result.clbnc_usr_banca).toBe('a'.repeat(150));
    });
  });

  describe('Normalización de tokens', () => {
    it('debe normalizar token de sesión: trim y máximo 250 caracteres', () => {
      const data = {
        ...baseClbncData,
        clbnc_tok_sesio: '  token123  ',
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_tok_sesio).toBe('token123');
    });

    it('debe truncar token de sesión si excede 250 caracteres', () => {
      const longToken = 'a'.repeat(300);
      const data = {
        ...baseClbncData,
        clbnc_tok_sesio: longToken,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_tok_sesio).toHaveLength(250);
    });

    it('debe manejar token de sesión como null cuando es undefined', () => {
      const data = {
        ...baseClbncData,
        clbnc_tok_sesio: undefined,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_tok_sesio).toBeNull();
    });
  });

  describe('Normalización de dispositivo', () => {
    it('debe normalizar IMEI: trim y máximo 100 caracteres', () => {
      const data = {
        ...baseClbncData,
        clbnc_imei_disp: '  123456789012345  ',
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_imei_disp).toBe('123456789012345');
    });

    it('debe normalizar nombre dispositivo: trim, uppercase y máximo 150 caracteres', () => {
      const data = {
        ...baseClbncData,
        clbnc_nom_dispo: '  iphone 13 pro  ',
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_nom_dispo).toBe('IPHONE 13 PRO');
    });

    it('debe normalizar detalles dispositivo: trim y máximo 250 caracteres', () => {
      const data = {
        ...baseClbncData,
        clbnc_det_dispo: '  iOS 15.0 / iPhone 13 Pro  ',
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_det_dispo).toBe('iOS 15.0 / iPhone 13 Pro');
    });
  });

  describe('Normalización de coordenadas GPS', () => {
    it('debe redondear latitud a 6 decimales', () => {
      const data = {
        ...baseClbncData,
        clbnc_lat_ultin: -0.180653123456,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lat_ultin).toBe(-0.180653);
    });

    it('debe redondear longitud a 6 decimales', () => {
      const data = {
        ...baseClbncData,
        clbnc_lon_ultin: -78.467834789012,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lon_ultin).toBe(-78.467835);
    });

    it('debe manejar coordenadas como null cuando son undefined', () => {
      const data = {
        ...baseClbncData,
        clbnc_lat_ultin: undefined,
        clbnc_lon_ultin: undefined,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lat_ultin).toBeNull();
      expect(result.clbnc_lon_ultin).toBeNull();
    });
  });

  describe('Normalización de geocoder', () => {
    it('debe normalizar geocoder: trim, uppercase y máximo 250 caracteres', () => {
      const data = {
        ...baseClbncData,
        clbnc_geo_ultin: '  av. amazonas n34-123, quito  ',
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_geo_ultin).toBe('AV. AMAZONAS N34-123, QUITO');
    });
  });

  describe('Normalización de IP', () => {
    it('debe normalizar IP: trim y máximo 50 caracteres', () => {
      const data = {
        ...baseClbncData,
        clbnc_ipa_ultin: '  192.168.1.100  ',
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_ipa_ultin).toBe('192.168.1.100');
    });
  });

  describe('Valores por defecto', () => {
    it('debe establecer clbnc_ctr_activ como true por defecto', () => {
      const data = {
        ...baseClbncData,
        clbnc_ctr_activ: undefined as any,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_ctr_activ).toBe(true);
    });

    it('debe establecer clbnc_ctr_termi como false por defecto', () => {
      const data = {
        ...baseClbncData,
        clbnc_ctr_termi: undefined as any,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_ctr_termi).toBe(false);
    });

    it('debe establecer clbnc_lim_diario como 1000 por defecto', () => {
      const data = {
        ...baseClbncData,
        clbnc_lim_diario: undefined as any,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lim_diario).toBe(1000);
    });

    it('debe establecer clbnc_lim_mensu como 15000 por defecto', () => {
      const data = {
        ...baseClbncData,
        clbnc_lim_mensu: undefined as any,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lim_mensu).toBe(15000);
    });
  });

  describe('Normalización de límites', () => {
    it('debe redondear límite diario a 2 decimales', () => {
      const data = {
        ...baseClbncData,
        clbnc_lim_diario: 1234.567,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lim_diario).toBe(1234.57);
    });

    it('debe redondear límite mensual a 2 decimales', () => {
      const data = {
        ...baseClbncData,
        clbnc_lim_mensu: 12345.678,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lim_mensu).toBe(12345.68);
    });

    it('debe establecer límite diario mínimo en 0', () => {
      const data = {
        ...baseClbncData,
        clbnc_lim_diario: -100,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lim_diario).toBe(0);
    });

    it('debe establecer límite mensual mínimo en 0', () => {
      const data = {
        ...baseClbncData,
        clbnc_lim_mensu: -500,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_lim_mensu).toBe(0);
    });
  });

  describe('Asignación de ID', () => {
    it('debe usar el ID proporcionado en el constructor', () => {
      const value = new ClbncValue(baseClbncData, 123);
      const result = value.toJson();

      expect(result.clbnc_cod_clbnc).toBe(123);
    });

    it('debe usar el ID del data si no se proporciona en constructor', () => {
      const data = {
        ...baseClbncData,
        clbnc_cod_clbnc: 456,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_cod_clbnc).toBe(456);
    });
  });

  describe('Fecha de registro', () => {
    it('debe usar fecha actual si no se proporciona', () => {
      const data = {
        ...baseClbncData,
        clbnc_fec_regis: undefined as any,
      };

      const before = new Date();
      const value = new ClbncValue(data);
      const after = new Date();
      const result = value.toJson();

      expect(result.clbnc_fec_regis).toBeInstanceOf(Date);
      expect(result.clbnc_fec_regis!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.clbnc_fec_regis!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('debe mantener fecha de registro cuando se proporciona', () => {
      const fechaRegistro = new Date('2025-01-15');
      const data = {
        ...baseClbncData,
        clbnc_fec_regis: fechaRegistro,
      };

      const value = new ClbncValue(data);
      const result = value.toJson();

      expect(result.clbnc_fec_regis).toEqual(fechaRegistro);
    });
  });

  describe('toJson()', () => {
    it('debe retornar todos los campos de la entidad', () => {
      const value = new ClbncValue(baseClbncData);
      const result = value.toJson();

      expect(result).toHaveProperty('clbnc_cod_clien');
      expect(result).toHaveProperty('clbnc_usr_banca');
      expect(result).toHaveProperty('clbnc_pwd_banca');
      expect(result).toHaveProperty('clbnc_fec_regis');
      expect(result).toHaveProperty('clbnc_ctr_activ');
      expect(result).toHaveProperty('clbnc_ctr_termi');
      expect(result).toHaveProperty('clbnc_lim_diario');
      expect(result).toHaveProperty('clbnc_lim_mensu');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('updated_by');
    });
  });
});

