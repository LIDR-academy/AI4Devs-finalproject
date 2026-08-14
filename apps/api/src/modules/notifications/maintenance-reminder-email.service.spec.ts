import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MaintenanceReminderEmailService } from './maintenance-reminder-email.service';
import { EMAIL_PORT, type EmailPort } from './ports/email.port';

describe('MaintenanceReminderEmailService', () => {
  let service: MaintenanceReminderEmailService;
  let emailPort: { send: jest.Mock };
  let config: Record<string, string | undefined>;

  const baseInput = {
    ownerFullName: 'Juan Pérez',
    ownerEmail: 'juan@email.com',
    licensePlate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2018,
    daysSinceVisit: 200,
    actorEmail: 'admin@taller.com',
  };

  beforeEach(async () => {
    emailPort = { send: jest.fn().mockResolvedValue({ messageId: 'm1' }) };
    config = {
      EMAIL_ENABLED: 'true',
      WORKSHOP_NAME: 'Taller Centro',
      WORKSHOP_PHONE: '2222-3333',
      WORKSHOP_ADMIN_EMAIL: 'taller@workshop.com',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceReminderEmailService,
        { provide: EMAIL_PORT, useValue: emailPort as EmailPort },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => config[key],
          },
        },
      ],
    }).compile();

    service = module.get(MaintenanceReminderEmailService);
  });

  it('returns skipped_disabled when EMAIL_ENABLED is not true', async () => {
    config.EMAIL_ENABLED = 'false';
    const result = await service.send(baseInput);
    expect(result.emailStatus).toBe('skipped_disabled');
    expect(emailPort.send).not.toHaveBeenCalled();
  });

  it('returns skipped_no_email when owner email is missing', async () => {
    const result = await service.send({ ...baseInput, ownerEmail: null });
    expect(result.emailStatus).toBe('skipped_no_email');
    expect(emailPort.send).not.toHaveBeenCalled();
  });

  it('sends via EmailPort and returns sent', async () => {
    const result = await service.send(baseInput);
    expect(result.emailStatus).toBe('sent');
    expect(emailPort.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'juan@email.com',
        subject: expect.stringContaining('ABC123'),
      }),
    );
  });

  it('returns failed when EmailPort throws', async () => {
    emailPort.send.mockRejectedValueOnce(new Error('smtp down'));
    const result = await service.send(baseInput);
    expect(result.emailStatus).toBe('failed');
  });
});
