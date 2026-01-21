import { Test, TestingModule } from '@nestjs/testing';
import { ClienUseCase } from './usecase';
import { CLIEN_REPOSITORY } from '../domain/port';
import { ClienPort } from '../domain/port';
import { ClienEntity, ClienParams } from '../domain/entity/clien.entity';
import { PersoEntity, PersoParams } from '../domain/entity/perso.entity';
import { CldomEntity } from '../../cldom/domain/entity/cldom.entity';
import { ClecoEntity } from '../../cleco/domain/entity/cleco.entity';
import { ClrepEntity } from '../../clrep/domain/entity/clrep.entity';
import { ClcygEntity } from '../../clcyg/domain/entity/clcyg.entity';
import { CllabEntity } from '../../cllab/domain/entity/cllab.entity';
import { ClrefEntity } from '../../clref/domain/entity/clref.entity';
import { ClfinEntity } from '../../clfin/domain/entity/clfin.entity';
import { ClbncEntity } from '../../clbnc/domain/entity/clbnc.entity';
import { ClbenEntity } from '../../clben/domain/entity/clben.entity';
import { ClrfiEntity } from '../../clrfi/domain/entity/clrfi.entity';
import { ClasmEntity } from '../../clasm/domain/entity/clasm.entity';

describe('ClienUseCase', () => {
  let useCase: ClienUseCase;
  let mockRepository: jest.Mocked<ClienPort>;

  // Mock data para Persona
  const mockPersona: PersoEntity = {
    perso_cod_perso: 1,
    perso_cod_tpers: 1, // 1=Natural
    perso_cod_tiden: 1, // 1=Cédula
    perso_ide_perso: '1712345678',
    perso_nom_perso: 'PÉREZ GONZÁLEZ JUAN CARLOS',
    perso_fec_inici: new Date('1990-01-15'),
    perso_cod_sexos: 1, // 1=M
    perso_cod_nacio: 1,
    perso_cod_instr: 1,
    perso_cod_ecivi: 1,
    perso_cod_etnia: null,
    perso_tlf_celul: '0999999999',
    perso_tlf_conve: '022345678',
    perso_dir_email: 'juan.perez@email.com',
    perso_dac_regci: undefined,
    perso_fec_ultrc: undefined,
    perso_cap_socia: undefined,
    perso_fot_perso: undefined,
    perso_fir_perso: undefined,
    perso_fec_ultfo: undefined,
    perso_fec_ultfi: undefined,
    created_by: 1,
    updated_by: 1,
  };

  // Mock data para Cliente
  const mockCliente: ClienEntity = {
    clien_cod_clien: 1,
    clien_cod_perso: 1,
    clien_cod_ofici: 1,
    clien_ctr_socio: false,
    clien_fec_ingin: new Date('2025-01-01'),
    clien_fec_salid: undefined,
    clien_obs_clien: undefined,
    created_by: 1,
    updated_by: 1,
  };

  // Mock data para Domicilio
  const mockDomicilio: CldomEntity = {
    cldom_cod_cldom: 1,
    cldom_cod_clien: 1,
    cldom_cod_provi: '17',
    cldom_cod_canto: '01',
    cldom_cod_parro: '01',
    cldom_dir_domic: 'Calle Principal 123',
    cldom_tlf_domic: '0999999999',
    cldom_sit_refdo: 'Frente al parque',
    created_by: 1,
    updated_by: 1,
  };

  // Mock data para Actividad Económica
  const mockActividadEconomica: ClecoEntity = {
    cleco_cod_cleco: 1,
    cleco_cod_clien: 1,
    cleco_cod_aebce: 'A011112',
    cleco_cod_saebc: '001',
    cleco_cod_dtfin: '001',
    cleco_cod_sebce: 'A',
    cleco_cod_ssgbc: '01',
    created_by: 1,
    updated_by: 1,
  };

  beforeEach(async () => {
    // Crear mock del repositorio con todos los métodos
    mockRepository = {
      // Persona
      findPersonaById: jest.fn(),
      findPersonaByIdentificacion: jest.fn(),
      findAllPersonas: jest.fn(),
      createPersona: jest.fn(),
      updatePersona: jest.fn(),
      deletePersona: jest.fn(),
      // Cliente
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPersonaId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      // Transacciones unificadas
      registrarClienteCompleto: jest.fn(),
      findClienteCompletoById: jest.fn(),
      actualizarClienteCompleto: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienUseCase,
        {
          provide: CLIEN_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ClienUseCase>(ClienUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // ========== PERSONA ==========

  describe('Persona - findPersonaById', () => {
    it('debe retornar una persona cuando existe', async () => {
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);

      const result = await useCase.findPersonaById(1);

      expect(result).toEqual(mockPersona);
      expect(mockRepository.findPersonaById).toHaveBeenCalledWith(1);
    });

    it('debe retornar null cuando no existe', async () => {
      mockRepository.findPersonaById.mockResolvedValue(null);

      const result = await useCase.findPersonaById(999);

      expect(result).toBeNull();
      expect(mockRepository.findPersonaById).toHaveBeenCalledWith(999);
    });
  });

  describe('Persona - findPersonaByIdentificacion', () => {
    it('debe retornar una persona cuando existe', async () => {
      mockRepository.findPersonaByIdentificacion.mockResolvedValue(mockPersona);

      const result = await useCase.findPersonaByIdentificacion('1712345678');

      expect(result).toEqual(mockPersona);
      expect(mockRepository.findPersonaByIdentificacion).toHaveBeenCalledWith('1712345678');
    });

    it('debe retornar null cuando no existe', async () => {
      mockRepository.findPersonaByIdentificacion.mockResolvedValue(null);

      const result = await useCase.findPersonaByIdentificacion('9999999999');

      expect(result).toBeNull();
    });
  });

  describe('Persona - createPersona', () => {
    it('debe crear una persona correctamente', async () => {
      const newPersona: PersoEntity = {
        ...mockPersona,
        perso_cod_perso: undefined,
      };

      mockRepository.createPersona.mockResolvedValue(mockPersona);

      const result = await useCase.createPersona(newPersona);

      expect(result).toEqual(mockPersona);
      expect(mockRepository.createPersona).toHaveBeenCalled();
    });
  });

  describe('Persona - updatePersona', () => {
    it('debe actualizar una persona cuando existe', async () => {
      const updatedPersona: PersoEntity = {
        ...mockPersona,
        perso_nom_perso: 'Juan Carlos',
      };

      mockRepository.findPersonaById.mockResolvedValue(mockPersona);
      mockRepository.updatePersona.mockResolvedValue(updatedPersona);

      const result = await useCase.updatePersona(1, updatedPersona);

      expect(result).toEqual(updatedPersona);
      expect(mockRepository.findPersonaById).toHaveBeenCalledWith(1);
      expect(mockRepository.updatePersona).toHaveBeenCalled();
    });

    it('debe lanzar error cuando la persona no existe', async () => {
      mockRepository.findPersonaById.mockResolvedValue(null);

      await expect(useCase.updatePersona(999, mockPersona)).rejects.toThrow(
        'Persona con id 999 no encontrada'
      );
    });
  });

  describe('Persona - deletePersona', () => {
    it('debe eliminar una persona cuando existe', async () => {
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);
      mockRepository.deletePersona.mockResolvedValue(mockPersona);

      const result = await useCase.deletePersona(1);

      expect(result).toEqual(mockPersona);
      expect(mockRepository.deletePersona).toHaveBeenCalledWith(1);
    });

    it('debe lanzar error cuando la persona no existe', async () => {
      mockRepository.findPersonaById.mockResolvedValue(null);

      await expect(useCase.deletePersona(999)).rejects.toThrow(
        'Persona con id 999 no encontrada'
      );
    });
  });

  // ========== CLIENTE ==========

  describe('Cliente - findById', () => {
    it('debe retornar un cliente cuando existe', async () => {
      mockRepository.findById.mockResolvedValue(mockCliente);

      const result = await useCase.findById(1);

      expect(result).toEqual(mockCliente);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('debe retornar null cuando no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('Cliente - create', () => {
    it('debe crear un cliente correctamente', async () => {
      const newCliente: ClienEntity = {
        ...mockCliente,
        clien_cod_clien: undefined,
      };

      mockRepository.create.mockResolvedValue(mockCliente);

      const result = await useCase.create(newCliente);

      expect(result).toEqual(mockCliente);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('Cliente - update', () => {
    it('debe actualizar un cliente cuando existe', async () => {
      const updatedCliente: ClienEntity = {
        ...mockCliente,
        clien_obs_clien: 'Cliente actualizado',
      };

      mockRepository.findById.mockResolvedValue(mockCliente);
      mockRepository.update.mockResolvedValue(updatedCliente);

      const result = await useCase.update(1, updatedCliente);

      expect(result).toEqual(updatedCliente);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el cliente no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.update(999, mockCliente)).rejects.toThrow(
        'Cliente con id 999 no encontrado'
      );
    });
  });

  describe('Cliente - delete', () => {
    it('debe eliminar un cliente cuando existe', async () => {
      mockRepository.findById.mockResolvedValue(mockCliente);
      mockRepository.delete.mockResolvedValue(mockCliente);

      const result = await useCase.delete(1);

      expect(result).toEqual(mockCliente);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debe lanzar error cuando el cliente no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.delete(999)).rejects.toThrow(
        'Cliente con id 999 no encontrado'
      );
    });
  });

  // ========== TRANSACCIONES UNIFICADAS ==========

  describe('registrarClienteCompleto', () => {
    it('debe registrar un cliente completo con todos los módulos obligatorios', async () => {
      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: mockDomicilio,
        actividadEconomica: mockActividadEconomica,
      };

      mockRepository.registrarClienteCompleto.mockResolvedValue(mockResult);

      const result = await useCase.registrarClienteCompleto(
        mockPersona,
        mockCliente,
        mockDomicilio,
        mockActividadEconomica
      );

      expect(result).toEqual(mockResult);
      expect(mockRepository.registrarClienteCompleto).toHaveBeenCalled();
    });

    it('debe normalizar datos mediante Value Objects antes de registrar', async () => {
      const personaConEspacios: PersoEntity = {
        ...mockPersona,
        perso_nom_perso: '  juan perez  ',
        perso_ide_perso: '  1712345678  ',
      };

      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: mockDomicilio,
        actividadEconomica: mockActividadEconomica,
      };

      mockRepository.registrarClienteCompleto.mockResolvedValue(mockResult);

      await useCase.registrarClienteCompleto(
        personaConEspacios,
        mockCliente,
        mockDomicilio,
        mockActividadEconomica
      );

      // Verificar que se llamó con datos normalizados
      expect(mockRepository.registrarClienteCompleto).toHaveBeenCalled();
      const callArgs = mockRepository.registrarClienteCompleto.mock.calls[0];
      expect(callArgs[0].perso_nom_perso).toBe('JUAN PEREZ'); // Normalizado a uppercase
      expect(callArgs[0].perso_ide_perso).toBe('1712345678'); // Trim aplicado
    });

    it('debe registrar un cliente completo con módulos opcionales', async () => {
      const mockReferencia: ClrefEntity = {
        clref_cod_clref: 1,
        clref_cod_clien: 1,
        clref_cod_tiref: 1, // 1=Personal
        clref_cod_perso: 2,
        clref_tlf_refer: '0998887777',
        created_by: 1,
        updated_by: 1,
      };

      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: mockDomicilio,
        actividadEconomica: mockActividadEconomica,
        referencias: [mockReferencia],
      };

      mockRepository.registrarClienteCompleto.mockResolvedValue(mockResult);

      const result = await useCase.registrarClienteCompleto(
        mockPersona,
        mockCliente,
        mockDomicilio,
        mockActividadEconomica,
        null, // representante
        null, // cónyuge
        null, // información laboral
        [mockReferencia], // referencias
        null, // información financiera
        null, // usuario banca digital
        null, // beneficiarios
        null, // residencia fiscal
        null  // asamblea
      );

      expect(result).toEqual(mockResult);
      expect(mockRepository.registrarClienteCompleto).toHaveBeenCalled();
    });

    it('debe manejar arrays vacíos como null en módulos opcionales', async () => {
      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: mockDomicilio,
        actividadEconomica: mockActividadEconomica,
      };

      mockRepository.registrarClienteCompleto.mockResolvedValue(mockResult);

      await useCase.registrarClienteCompleto(
        mockPersona,
        mockCliente,
        mockDomicilio,
        mockActividadEconomica,
        null,
        null,
        null,
        [], // array vacío debe convertirse a null
        [],
        null,
        [],
        null,
        null
      );

      expect(mockRepository.registrarClienteCompleto).toHaveBeenCalled();
      const callArgs = mockRepository.registrarClienteCompleto.mock.calls[0];
      expect(callArgs[7]).toBeNull(); // referencias
      expect(callArgs[8]).toBeNull(); // información financiera
      expect(callArgs[10]).toBeNull(); // beneficiarios
    });
  });

  describe('findClienteCompletoById', () => {
    it('debe retornar cliente completo con todas las relaciones', async () => {
      const mockClienteCompleto = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: mockDomicilio,
        actividadEconomica: mockActividadEconomica,
        representante: null,
        conyuge: null,
        informacionLaboral: null,
        referencias: [],
        informacionFinanciera: [],
        usuarioBancaDigital: null,
        beneficiarios: [],
        residenciaFiscal: null,
        asamblea: null,
        calculosFinancieros: {
          capacidadPago: 0,
          patrimonio: 0,
          totalIngresos: 0,
          totalGastos: 0,
          totalActivos: 0,
          totalPasivos: 0,
        },
      };

      mockRepository.findClienteCompletoById.mockResolvedValue(mockClienteCompleto);

      const result = await useCase.findClienteCompletoById(1);

      expect(result).toEqual(mockClienteCompleto);
      expect(mockRepository.findClienteCompletoById).toHaveBeenCalledWith(1);
    });

    it('debe retornar null cuando el cliente no existe', async () => {
      mockRepository.findClienteCompletoById.mockResolvedValue(null);

      const result = await useCase.findClienteCompletoById(999);

      expect(result).toBeNull();
    });
  });

  describe('actualizarClienteCompleto', () => {
    it('debe actualizar cliente completo cuando existe', async () => {
      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: mockDomicilio,
        actividadEconomica: mockActividadEconomica,
      };

      mockRepository.findById.mockResolvedValue(mockCliente);
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);
      mockRepository.actualizarClienteCompleto.mockResolvedValue(mockResult);

      const result = await useCase.actualizarClienteCompleto(
        1,
        mockPersona,
        mockCliente,
        mockDomicilio,
        mockActividadEconomica
      );

      expect(result).toEqual(mockResult);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.findPersonaById).toHaveBeenCalledWith(mockCliente.clien_cod_perso);
      expect(mockRepository.actualizarClienteCompleto).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el cliente no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.actualizarClienteCompleto(
          999,
          mockPersona,
          mockCliente,
          mockDomicilio,
          mockActividadEconomica
        )
      ).rejects.toThrow('Cliente con id 999 no encontrado');
    });
  });
});

