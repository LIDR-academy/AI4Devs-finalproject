import { PersoValue } from './perso.value';
import { PersoEntity } from '../entity/perso.entity';

describe('PersoValue', () => {
  const basePersonaData: PersoEntity = {
    perso_cod_tpers: 1, // 1=Natural
    perso_cod_tiden: 1, // 1=Cédula
    perso_ide_perso: '1712345678',
    perso_nom_perso: 'Juan Carlos Pérez',
    perso_fec_inici: new Date('1990-01-15'),
    perso_cod_sexos: 1, // 1=M
    perso_cod_nacio: 1,
    perso_cod_instr: 1,
    perso_cod_ecivi: 1,
    perso_tlf_celul: '0999999999',
    perso_tlf_conve: '022345678',
    perso_dir_email: 'Juan.Perez@EMAIL.COM',
    created_by: 1,
    updated_by: 1,
  };

  describe('Normalización de datos', () => {
    it('debe normalizar identificación: trim y mayúsculas', () => {
      const data = {
        ...basePersonaData,
        perso_ide_perso: '  1712345678  ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_ide_perso).toBe('1712345678');
    });

    it('debe normalizar nombre: trim y mayúsculas', () => {
      const data = {
        ...basePersonaData,
        perso_nom_perso: '  juan carlos pérez  ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_nom_perso).toBe('JUAN CARLOS PÉREZ');
    });

    it('debe normalizar email: trim y minúsculas', () => {
      const data = {
        ...basePersonaData,
        perso_dir_email: '  Juan.Perez@EMAIL.COM  ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_dir_email).toBe('juan.perez@email.com');
    });

    it('debe normalizar teléfono celular: trim', () => {
      const data = {
        ...basePersonaData,
        perso_tlf_celul: '  0999999999  ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_tlf_celul).toBe('0999999999');
    });

    it('debe normalizar teléfono convencional: trim', () => {
      const data = {
        ...basePersonaData,
        perso_tlf_conve: '  022345678  ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_tlf_conve).toBe('022345678');
    });

    it('debe normalizar DAC Registro Civil: trim', () => {
      const data = {
        ...basePersonaData,
        perso_dac_regci: '  ABC123  ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_dac_regci).toBe('ABC123');
    });
  });

  describe('Manejo de valores opcionales', () => {
    it('debe manejar campos opcionales como undefined', () => {
      const data = {
        ...basePersonaData,
        perso_tlf_celul: undefined,
        perso_dir_email: undefined,
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_tlf_celul).toBeUndefined();
      expect(result.perso_dir_email).toBeUndefined();
    });

    it('debe manejar campos opcionales como null', () => {
      const data = {
        ...basePersonaData,
        perso_cod_ecivi: null,
        perso_cod_etnia: null,
        perso_fec_ultrc: null,
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_cod_ecivi).toBeNull();
      expect(result.perso_cod_etnia).toBeNull();
      expect(result.perso_fec_ultrc).toBeNull();
    });

    it('debe establecer valores por defecto para campos opcionales null', () => {
      const data = {
        ...basePersonaData,
        perso_cod_ecivi: undefined,
        perso_cod_etnia: undefined,
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_cod_ecivi).toBeNull();
      expect(result.perso_cod_etnia).toBeNull();
    });
  });

  describe('Asignación de ID', () => {
    it('debe usar el ID proporcionado en el constructor', () => {
      const value = new PersoValue(basePersonaData, 123);
      const result = value.toJson();

      expect(result.perso_cod_perso).toBe(123);
    });

    it('debe usar el ID del data si no se proporciona en constructor', () => {
      const data = {
        ...basePersonaData,
        perso_cod_perso: 456,
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_cod_perso).toBe(456);
    });

    it('debe priorizar el ID del constructor sobre el ID del data', () => {
      const data = {
        ...basePersonaData,
        perso_cod_perso: 456,
      };

      const value = new PersoValue(data, 789);
      const result = value.toJson();

      expect(result.perso_cod_perso).toBe(789);
    });
  });

  describe('toJson()', () => {
    it('debe retornar solo campos definidos (no incluir undefined)', () => {
      const data = {
        ...basePersonaData,
        perso_tlf_celul: undefined,
        perso_dir_email: undefined,
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result).not.toHaveProperty('perso_tlf_celul');
      expect(result).not.toHaveProperty('perso_dir_email');
    });

    it('debe incluir todos los campos requeridos', () => {
      const value = new PersoValue(basePersonaData);
      const result = value.toJson();

      expect(result).toHaveProperty('perso_cod_tpers');
      expect(result).toHaveProperty('perso_cod_tiden');
      expect(result).toHaveProperty('perso_ide_perso');
      expect(result).toHaveProperty('perso_nom_perso');
      expect(result).toHaveProperty('perso_fec_inici');
      expect(result).toHaveProperty('perso_cod_sexos');
      expect(result).toHaveProperty('perso_cod_nacio');
      expect(result).toHaveProperty('perso_cod_instr');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('updated_by');
    });

    it('debe incluir campos opcionales cuando tienen valor', () => {
      const data = {
        ...basePersonaData,
        perso_tlf_celul: '0999999999',
        perso_dir_email: 'test@email.com',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result).toHaveProperty('perso_tlf_celul');
      expect(result).toHaveProperty('perso_dir_email');
      expect(result.perso_tlf_celul).toBe('0999999999');
      expect(result.perso_dir_email).toBe('test@email.com');
    });
  });

  describe('Casos edge', () => {
    it('debe manejar strings vacíos después de trim (no incluir en toJson)', () => {
      const data = {
        ...basePersonaData,
        perso_tlf_celul: '   ',
        perso_dir_email: '   ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      // toJson() no incluye campos undefined/vacíos
      expect(result.perso_tlf_celul).toBeUndefined();
      expect(result.perso_dir_email).toBeUndefined();
    });

    it('debe manejar identificación con espacios y convertir a mayúsculas', () => {
      const data = {
        ...basePersonaData,
        perso_ide_perso: '  17abc1234  ',
      };

      const value = new PersoValue(data);
      const result = value.toJson();

      expect(result.perso_ide_perso).toBe('17ABC1234');
    });
  });
});

