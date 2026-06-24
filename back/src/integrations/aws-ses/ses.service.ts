import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Injectable, Logger } from "@nestjs/common";
import type { SesPort } from "../../modules/notifications/ports/notification-ports";

@Injectable()
export class SesService implements SesPort {
  private readonly logger = new Logger(SesService.name);
  private readonly ses: SESClient;
  private readonly fromAddress = process.env.AWS_SES_FROM_ADDRESS ?? "";

  constructor() {
    this.ses = new SESClient({ region: process.env.AWS_REGION ?? "eu-west-1" });
  }

  async sendEmail(params: { to: string; subject: string; htmlBody: string }): Promise<void> {
    try {
      await this.ses.send(
        new SendEmailCommand({
          Source: this.fromAddress,
          Destination: { ToAddresses: [params.to] },
          Message: {
            Subject: { Data: params.subject },
            Body: { Html: { Data: params.htmlBody } },
          },
        }),
      );
    } catch (error) {
      this.logger.error(
        `ses_send_failed to=${params.to}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
