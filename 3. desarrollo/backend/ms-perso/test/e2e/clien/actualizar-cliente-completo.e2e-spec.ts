// Setup de variables de entorno antes de importar módulos
import '../setup';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('ClienController - Actualizar Cliente Completo (e2e)', () => {
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

  describe('PUT /clientes/:id/completo', () => {
    it('debe rechazar actualización sin ID de cliente', () => {
      return request(app.getHttpServer())
        .put('/clientes/completo')
        .send({
          persona: {
            perso_nom_perso: 'JUAN CARLOS PEREZ',
          },
        })
        .expect(404); // Ruta no encontrada sin ID
    });

    it('debe rechazar actualización con ID inválido', () => {
      return request(app.getHttpServer())
        .put('/clientes/abc/completo')
        .send({
          persona: {
            perso_nom_perso: 'JUAN CARLOS PEREZ',
          },
        })
        .expect(400);
    });

    it('debe rechazar actualización sin datos de persona', () => {
      return request(app.getHttpServer())
        .put('/clientes/1/completo')
        .send({
          cliente: {
            clien_ctr_socio: true,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar actualización sin datos de cliente', () => {
      return request(app.getHttpServer())
        .put('/clientes/1/completo')
        .send({
          persona: {
            perso_nom_perso: 'JUAN CARLOS PEREZ',
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar actualización con cliente inexistente', () => {
      return request(app.getHttpServer())
        .put('/clientes/99999/completo')
        .send({
          persona: {
            perso_nom_perso: 'JUAN CARLOS PEREZ',
            perso_fec_inici: '1990-01-15',
            perso_cod_sexos: 1,
            perso_cod_nacio: 1,
            perso_cod_instr: 1,
            updated_by: 1,
          },
          cliente: {
            clien_cod_ofici: 1,
            clien_ctr_socio: false,
            clien_fec_ingin: '2025-01-01',
            updated_by: 1,
          },
          domicilio: {
            cldom_cod_provi: 1,
            cldom_cod_canto: 1,
            cldom_cod_parro: 1,
            cldom_dir_domic: 'Calle Principal 123',
            updated_by: 1,
          },
          actividadEconomica: {
            cleco_cod_aebce: '12345',
            cleco_cod_saebc: '123',
            cleco_cod_dtfin: 1,
            cleco_cod_sebce: '123',
            cleco_cod_ssgbc: '123',
            updated_by: 1,
          },
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar actualización con nombre de persona vacío', () => {
      return request(app.getHttpServer())
        .put('/clientes/1/completo')
        .send({
          persona: {
            perso_nom_perso: '', // Nombre vacío
            perso_fec_inici: '1990-01-15',
            perso_cod_sexos: 1,
            perso_cod_nacio: 1,
            perso_cod_instr: 1,
            updated_by: 1,
          },
          cliente: {
            clien_cod_ofici: 1,
            clien_ctr_socio: false,
            clien_fec_ingin: '2025-01-01',
            updated_by: 1,
          },
          domicilio: {
            cldom_cod_provi: 1,
            cldom_cod_canto: 1,
            cldom_cod_parro: 1,
            cldom_dir_domic: 'Calle Principal 123',
            updated_by: 1,
          },
          actividadEconomica: {
            cleco_cod_aebce: '12345',
            cleco_cod_saebc: '123',
            cleco_cod_dtfin: 1,
            cleco_cod_sebce: '123',
            cleco_cod_ssgbc: '123',
            updated_by: 1,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    // Nota: Los tests con datos reales y actualización exitosa requieren:
    // 1. Base de datos de prueba configurada
    // 2. Cliente creado previamente
    // 3. Datos de catálogos (oficinas, provincias, cantones, parroquias, etc.)
    // 4. Limpieza de datos entre tests
    // 5. Verificación de actualización de todas las relaciones
  });
});

