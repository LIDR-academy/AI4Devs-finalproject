import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SecurityController } from './security.controller';
import { BackupService } from './services/backup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [SecurityController],
  providers: [BackupService],
  exports: [BackupService],
})
export class SecurityModule {}
