"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeographicOptimization1735684800000 = void 0;
class GeographicOptimization1735684800000 {
    name = 'GeographicOptimization1735684800000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "regions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "country" character varying(100) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_regions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_regions_name_country" UNIQUE ("name", "country")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "cities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "region_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_cities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cities_name_region" UNIQUE ("name", "region_id"),
        CONSTRAINT "FK_cities_region" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "barbershops" 
      ADD COLUMN "city_id" uuid,
      ADD COLUMN "neighborhood" character varying(255),
      ADD COLUMN "owner_name" character varying(255)
    `);
        await queryRunner.query(`
      ALTER TABLE "barbershops"
      ADD CONSTRAINT "FK_barbershops_city" 
      FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL
    `);
        await queryRunner.query(`CREATE INDEX "IDX_barbershops_city_id" ON "barbershops" ("city_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_barbershops_neighborhood" ON "barbershops" ("neighborhood")`);
        await queryRunner.query(`CREATE INDEX "IDX_cities_region_id" ON "cities" ("region_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_regions_country" ON "regions" ("country")`);
        await this.insertInitialGeoData(queryRunner);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_barbershops_city_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_barbershops_neighborhood"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cities_region_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_regions_country"`);
        await queryRunner.query(`ALTER TABLE "barbershops" DROP CONSTRAINT IF EXISTS "FK_barbershops_city"`);
        await queryRunner.query(`
      ALTER TABLE "barbershops" 
      DROP COLUMN IF EXISTS "city_id",
      DROP COLUMN IF EXISTS "neighborhood",
      DROP COLUMN IF EXISTS "owner_name"
    `);
        await queryRunner.query(`DROP TABLE IF EXISTS "cities"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "regions"`);
    }
    async insertInitialGeoData(queryRunner) {
        await queryRunner.query(`
      INSERT INTO "regions" ("id", "name", "country") VALUES
      ('11111111-1111-1111-1111-111111111111', 'Ciudad de México', 'México'),
      ('22222222-2222-2222-2222-222222222222', 'Estado de México', 'México'),
      ('33333333-3333-3333-3333-333333333333', 'Jalisco', 'México'),
      ('44444444-4444-4444-4444-444444444444', 'Nuevo León', 'México'),
      ('55555555-5555-5555-5555-555555555555', 'Puebla', 'México'),
      ('66666666-6666-6666-6666-666666666666', 'Guanajuato', 'México'),
      ('77777777-7777-7777-7777-777777777777', 'Veracruz', 'México'),
      ('88888888-8888-8888-8888-888888888888', 'Yucatán', 'México'),
      ('99999999-9999-9999-9999-999999999999', 'Quintana Roo', 'México'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Oaxaca', 'México')
    `);
        await queryRunner.query(`
      INSERT INTO "cities" ("id", "name", "region_id") VALUES
      -- Ciudad de México
      ('c1111111-1111-1111-1111-111111111111', 'Ciudad de México', '11111111-1111-1111-1111-111111111111'),
      -- Estado de México
      ('c2222222-2222-2222-2222-222222222222', 'Toluca', '22222222-2222-2222-2222-222222222222'),
      ('c2222222-2222-2222-2222-222222222223', 'Ecatepec', '22222222-2222-2222-2222-222222222222'),
      ('c2222222-2222-2222-2222-222222222224', 'Naucalpan', '22222222-2222-2222-2222-222222222222'),
      -- Jalisco
      ('c3333333-3333-3333-3333-333333333333', 'Guadalajara', '33333333-3333-3333-3333-333333333333'),
      ('c3333333-3333-3333-3333-333333333334', 'Zapopan', '33333333-3333-3333-3333-333333333333'),
      ('c3333333-3333-3333-3333-333333333335', 'Puerto Vallarta', '33333333-3333-3333-3333-333333333333'),
      -- Nuevo León
      ('c4444444-4444-4444-4444-444444444444', 'Monterrey', '44444444-4444-4444-4444-444444444444'),
      ('c4444444-4444-4444-4444-444444444445', 'San Pedro Garza García', '44444444-4444-4444-4444-444444444444'),
      ('c4444444-4444-4444-4444-444444444446', 'Guadalupe', '44444444-4444-4444-4444-444444444444'),
      -- Puebla
      ('c5555555-5555-5555-5555-555555555555', 'Puebla', '55555555-5555-5555-5555-555555555555'),
      ('c5555555-5555-5555-5555-555555555556', 'Tehuacán', '55555555-5555-5555-5555-555555555555'),
      -- Guanajuato
      ('c6666666-6666-6666-6666-666666666666', 'León', '66666666-6666-6666-6666-666666666666'),
      ('c6666666-6666-6666-6666-666666666667', 'Irapuato', '66666666-6666-6666-6666-666666666666'),
      ('c6666666-6666-6666-6666-666666666668', 'Celaya', '66666666-6666-6666-6666-666666666666'),
      -- Veracruz
      ('c7777777-7777-7777-7777-777777777777', 'Veracruz', '77777777-7777-7777-7777-777777777777'),
      ('c7777777-7777-7777-7777-777777777778', 'Xalapa', '77777777-7777-7777-7777-777777777777'),
      -- Yucatán
      ('c8888888-8888-8888-8888-888888888888', 'Mérida', '88888888-8888-8888-8888-888888888888'),
      -- Quintana Roo
      ('c9999999-9999-9999-9999-999999999999', 'Cancún', '99999999-9999-9999-9999-999999999999'),
      ('c9999999-9999-9999-9999-999999999998', 'Playa del Carmen', '99999999-9999-9999-9999-999999999999'),
      ('c9999999-9999-9999-9999-999999999997', 'Cozumel', '99999999-9999-9999-9999-999999999999'),
      -- Oaxaca
      ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Oaxaca de Juárez', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    `);
        console.log('✅ Datos geográficos iniciales insertados correctamente');
    }
}
exports.GeographicOptimization1735684800000 = GeographicOptimization1735684800000;
//# sourceMappingURL=002-geographic-optimization.js.map