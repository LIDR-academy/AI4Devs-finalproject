import { Injectable } from '@nestjs/common';

export interface OrderAddressSnapshot {
  orderId: string;
  fullAddress: string;
  recipientName: string;
  recipientPhone: string;
}

@Injectable()
export class EcommerceSyncService {
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
    console.log('[EcommerceSync Mock]', JSON.stringify(payload));
  }
}
