// Setup de variables de entorno antes de importar módulos
import '../setup';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('ClienController - Registrar Cliente Completo (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /clientes/completo', () => {
    it('debe rechazar registro sin datos de persona', () => {
      return request(app.getHttpServer())
        .post('/clientes/completo')
        .send({
          cliente: {
            clien_cod_ofici: 1,
            clien_ctr_socio: false,
            clien_fec_ingin: '2025-01-01',
            created_by: 1,
            updated_by: 1,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar registro sin datos de cliente', () => {
      return request(app.getHttpServer())
        .post('/clientes/completo')
        .send({
          persona: {
            perso_cod_tpers: 1,
            perso_cod_tiden: 1,
            perso_ide_perso: '1712345678',
            perso_nom_perso: 'JUAN PEREZ',
            perso_fec_inici: '1990-01-15',
            perso_cod_sexos: 1,
            perso_cod_nacio: 1,
            perso_cod_instr: 1,
            created_by: 1,
            updated_by: 1,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar registro sin domicilio', () => {
      return request(app.getHttpServer())
        .post('/clientes/completo')
        .send({
          persona: {
            perso_cod_tpers: 1,
            perso_cod_tiden: 1,
            perso_ide_perso: '1712345678',
            perso_nom_perso: 'JUAN PEREZ',
            perso_fec_inici: '1990-01-15',
            perso_cod_sexos: 1,
            perso_cod_nacio: 1,
            perso_cod_instr: 1,
            created_by: 1,
            updated_by: 1,
          },
          cliente: {
            clien_cod_ofici: 1,
            clien_ctr_socio: false,
            clien_fec_ingin: '2025-01-01',
            created_by: 1,
            updated_by: 1,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar registro sin actividad económica', () => {
      return request(app.getHttpServer())
        .post('/clientes/completo')
        .send({
          persona: {
            perso_cod_tpers: 1,
            perso_cod_tiden: 1,
            perso_ide_perso: '1712345678',
            perso_nom_perso: 'JUAN PEREZ',
            perso_fec_inici: '1990-01-15',
            perso_cod_sexos: 1,
            perso_cod_nacio: 1,
            perso_cod_instr: 1,
            created_by: 1,
            updated_by: 1,
          },
          cliente: {
            clien_cod_ofici: 1,
            clien_ctr_socio: false,
            clien_fec_ingin: '2025-01-01',
            created_by: 1,
            updated_by: 1,
          },
          domicilio: {
            cldom_cod_provi: 1,
            cldom_cod_canto: 1,
            cldom_cod_parro: 1,
            cldom_dir_domic: 'Calle Principal 123',
            created_by: 1,
            updated_by: 1,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar registro con identificación inválida', () => {
      return request(app.getHttpServer())
        .post('/clientes/completo')
        .send({
          persona: {
            perso_cod_tpers: 1,
            perso_cod_tiden: 1,
            perso_ide_perso: '123', // Identificación muy corta
            perso_nom_perso: 'JUAN PEREZ',
            perso_fec_inici: '1990-01-15',
            perso_cod_sexos: 1,
            perso_cod_nacio: 1,
            perso_cod_instr: 1,
            created_by: 1,
            updated_by: 1,
          },
          cliente: {
            clien_cod_ofici: 1,
            clien_ctr_socio: false,
            clien_fec_ingin: '2025-01-01',
            created_by: 1,
            updated_by: 1,
          },
          domicilio: {
            cldom_cod_provi: 1,
            cldom_cod_canto: 1,
            cldom_cod_parro: 1,
            cldom_dir_domic: 'Calle Principal 123',
            created_by: 1,
            updated_by: 1,
          },
          actividadEconomica: {
            cleco_cod_aebce: '12345',
            cleco_cod_saebc: '123',
            cleco_cod_dtfin: 1,
            cleco_cod_sebce: '123',
            cleco_cod_ssgbc: '123',
            created_by: 1,
            updated_by: 1,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar registro con nombre vacío', () => {
      return request(app.getHttpServer())
        .post('/clientes/completo')
        .send({
          persona: {
            perso_cod_tpers: 1,
            perso_cod_tiden: 1,
            perso_ide_perso: '1712345678',
            perso_nom_perso: '', // Nombre vacío
            perso_fec_inici: '1990-01-15',
            perso_cod_sexos: 1,
            perso_cod_nacio: 1,
            perso_cod_instr: 1,
            created_by: 1,
            updated_by: 1,
          },
          cliente: {
            clien_cod_ofici: 1,
            clien_ctr_socio: false,
            clien_fec_ingin: '2025-01-01',
            created_by: 1,
            updated_by: 1,
          },
          domicilio: {
            cldom_cod_provi: 1,
            cldom_cod_canto: 1,
            cldom_cod_parro: 1,
            cldom_dir_domic: 'Calle Principal 123',
            created_by: 1,
            updated_by: 1,
          },
          actividadEconomica: {
            cleco_cod_aebce: '12345',
            cleco_cod_saebc: '123',
            cleco_cod_dtfin: 1,
            cleco_cod_sebce: '123',
            cleco_cod_ssgbc: '123',
            created_by: 1,
            updated_by: 1,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    // Nota: Los tests con datos reales y creación exitosa requieren:
    // 1. Base de datos de prueba configurada
    // 2. Datos de catálogos (oficinas, provincias, cantones, parroquias, etc.)
    // 3. Limpieza de datos entre tests
    // 4. Rollback de transacciones
  });
});

