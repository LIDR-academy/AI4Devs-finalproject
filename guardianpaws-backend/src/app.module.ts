import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import AppDataSource from './config/database.config';
import { ReportModule } from './modules/report/report.module';
import { MascotaModule } from './modules/mascota/mascota.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    MascotaModule,
    ReportModule,
  ],
})
export class AppModule {}