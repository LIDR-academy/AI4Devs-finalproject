import crypto from 'crypto';
import { InvalidPinException } from '../errors/InvalidPinException.js';

export class Pin {
  private readonly valueHash: string;

  private constructor(hash: string) {
    this.valueHash = hash;
  }

  public static createFromRaw(rawPin: string): Pin {
    if (!/^\d{4,6}$/.test(rawPin)) {
      throw new InvalidPinException('El PIN debe ser numerico de 4 a 6 digitos.');
    }
    const hash = Pin.hashPin(rawPin);
    return new Pin(hash);
  }

  public static createFromHash(hash: string): Pin {
    return new Pin(hash);
  }

  public static hashPin(rawPin: string): string {
    const salt = 'restostock_pin_salt_static';
    return crypto.scryptSync(rawPin, salt, 32).toString('hex');
  }

  public compareWithRaw(rawPin: string): boolean {
    const computedHash = Pin.hashPin(rawPin);
    return crypto.timingSafeEqual(
      Buffer.from(this.valueHash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );
  }

  public getHash(): string {
    return this.valueHash;
  }
}
