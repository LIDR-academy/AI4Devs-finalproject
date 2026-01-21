import { Module } from '@nestjs/common';
import { PgService } from './pg.config';
import { OrmDatabaseModule } from './orm.config';

@Module({
    imports: [OrmDatabaseModule],
    providers: [PgService],
    exports: [PgService, OrmDatabaseModule],
})
export class DatabaseModule { }
