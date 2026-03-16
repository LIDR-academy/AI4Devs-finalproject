import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class GeographicOptimization1735684800000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private insertInitialGeoData;
}
