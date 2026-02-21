import { Injectable, Logger } from '@nestjs/common';

export interface OrderAddressSnapshot {
  orderId: string;
  fullAddress: string;
  recipientName: string;
  recipientPhone: string;
}

@Injectable()
export class EcommerceSyncService {
  private readonly logger = new Logger(EcommerceSyncService.name);

  simulateSync(orderId: string, address: OrderAddressSnapshot): void {
    const payload = {
      event: 'ADDRESS_SYNC_MOCK',
      orderId,
      address: {
        full_address: address.fullAddress,
        recipient_name: address.recipientName,
        recipient_phone: address.recipientPhone,
      },
      timestamp: new Date().toISOString(),
    };
    this.logger.log(JSON.stringify(payload));
  }
}
