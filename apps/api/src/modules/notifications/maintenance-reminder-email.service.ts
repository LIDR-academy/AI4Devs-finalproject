import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildMaintenanceReminderEmail } from './templates/maintenance-reminder';
import {
  EMAIL_PORT,
  type EmailPort,
  type EmailStatus,
} from './ports/email.port';

export type MaintenanceReminderSendInput = {
  ownerFullName: string;
  ownerEmail: string | null;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  daysSinceVisit: number;
  actorEmail: string | null;
};

export type MaintenanceReminderSendResult = {
  emailStatus: EmailStatus;
  warning: string | null;
};

@Injectable()
export class MaintenanceReminderEmailService {
  constructor(
    @Inject(EMAIL_PORT) private readonly emailPort: EmailPort,
    private readonly configService: ConfigService,
  ) {}

  async send(
    input: MaintenanceReminderSendInput,
  ): Promise<MaintenanceReminderSendResult> {
    if (this.configService.get<string>('EMAIL_ENABLED') !== 'true') {
      return {
        emailStatus: 'skipped_disabled',
        warning: 'Email sending is disabled in this environment',
      };
    }

    const to = input.ownerEmail?.trim() ?? '';
    if (!to) {
      return {
        emailStatus: 'skipped_no_email',
        warning: 'Owner has no email registered',
      };
    }

    const workshopName =
      this.configService.get<string>('WORKSHOP_NAME')?.trim() || 'Taller';
    const workshopPhone =
      this.configService.get<string>('WORKSHOP_PHONE')?.trim() || null;
    const adminEmail =
      this.configService.get<string>('WORKSHOP_ADMIN_EMAIL')?.trim() || null;

    const content = buildMaintenanceReminderEmail({
      ownerFullName: input.ownerFullName,
      licensePlate: input.licensePlate,
      brand: input.brand,
      model: input.model,
      year: input.year,
      daysSinceVisit: input.daysSinceVisit,
      workshopName,
      workshopPhone,
    });

    const cc = Array.from(
      new Set(
        [adminEmail, input.actorEmail?.trim() || null].filter(
          (value): value is string => Boolean(value) && value !== to,
        ),
      ),
    );

    try {
      await this.emailPort.send({
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });
      return { emailStatus: 'sent', warning: null };
    } catch {
      return {
        emailStatus: 'failed',
        warning: 'Failed to send email; you can retry',
      };
    }
  }
}
