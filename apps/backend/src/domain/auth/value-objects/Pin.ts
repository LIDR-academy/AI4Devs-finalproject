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
    const saltHex = crypto.randomBytes(16).toString('hex');
    const hashHex = Pin.hashPin(rawPin, saltHex);
    return new Pin(`${saltHex}:${hashHex}`);
  }

  public static createFromHash(hash: string): Pin {
    return new Pin(hash);
  }

  public static hashPin(rawPin: string, saltHex: string): string {
    return crypto.scryptSync(rawPin, Buffer.from(saltHex, 'hex'), 32).toString('hex');
  }

  public compareWithRaw(rawPin: string): boolean {
    const [saltHex, storedHashHex] = this.valueHash.split(':');
    const computedHashHex = Pin.hashPin(rawPin, saltHex);
    return crypto.timingSafeEqual(
      Buffer.from(storedHashHex, 'hex'),
      Buffer.from(computedHashHex, 'hex')
    );
  }

  public getHash(): string {
    return this.valueHash;
  }
}
