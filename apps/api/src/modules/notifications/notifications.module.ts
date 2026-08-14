import { Module } from '@nestjs/common';
import { ConsoleEmailAdapter } from './adapters/console-email.adapter';
import { MaintenanceReminderEmailService } from './maintenance-reminder-email.service';
import { EMAIL_PORT } from './ports/email.port';

@Module({
  providers: [
    {
      provide: EMAIL_PORT,
      useClass: ConsoleEmailAdapter,
    },
    MaintenanceReminderEmailService,
  ],
  exports: [EMAIL_PORT, MaintenanceReminderEmailService],
})
export class NotificationsModule {}
