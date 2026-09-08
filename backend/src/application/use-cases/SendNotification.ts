import type { DeviceTokenRepository } from "../../domain/ports/DeviceTokenRepository.js";
import type { NotificationRepository } from "../../domain/ports/NotificationRepository.js";
import type { NotificationSender } from "../../domain/ports/NotificationSender.js";

export interface SendNotificationInput {
  recipientId: string;
  type: number;
  content: string;
  classId?: string;
  data?: Record<string, string>;
}

export class SendNotification {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly deviceTokenRepo: DeviceTokenRepository,
    private readonly sender: NotificationSender | null,
  ) {}

  async send(input: SendNotificationInput): Promise<void> {
    const record = await this.notificationRepo.create({
      recipientId: input.recipientId,
      type: input.type,
      content: input.content,
      classId: input.classId,
    });

    if (!this.sender) return;

    const tokens = await this.deviceTokenRepo.listActiveTokens(input.recipientId);
    if (tokens.length === 0) return;

    const pushData: Record<string, string> = {
      notificationId: record.id,
      type: String(input.type),
      ...(input.classId ? { classId: input.classId } : {}),
      ...(input.data ?? {}),
    };

    try {
      const outcome = await this.sender.send({ content: input.content, data: pushData }, tokens);

      // US4: deactivate permanently failed tokens
      const permanentFailures = outcome.failed.filter((f) => f.permanent).map((f) => f.token);
      if (permanentFailures.length > 0) {
        try {
          await this.deviceTokenRepo.deactivate(permanentFailures);
        } catch {
          // containment — deactivation failure must not break the flow
        }
      }
    } catch {
      // US3: Failure isolation — never throw to caller
    }
  }
}
