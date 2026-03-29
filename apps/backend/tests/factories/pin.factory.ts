import { Pin } from '@/domain/entities/pin.entity';

export class PinFactory {
  static create(overrides: Partial<Pin> = {}): Pin {
    return new Pin(
      overrides.id || 'pin-test-id',
      overrides.layerId || 'layer-test-id',
      overrides.xCoord ?? 0.5,
      overrides.yCoord ?? 0.5,
      overrides.status || 'OPEN',
      overrides.createdBy || 'user-test-id',
      overrides.guestName || null,
      overrides.createdAt || new Date(),
      overrides.updatedAt || new Date(),
      overrides.deletedAt || null
    );
  }

  static createGuest(overrides: Partial<Pin> = {}): Pin {
    return PinFactory.create({
      ...overrides,
      createdBy: null,
      guestName: 'Test Guest',
    });
  }
}
