import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class InitialSchema1701234567890 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private createIndexes;
    private createTriggers;
    private insertSeedData;
}
