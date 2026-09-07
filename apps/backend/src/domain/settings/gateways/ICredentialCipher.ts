/**
 * Puerto de cifrado simétrico de credenciales (AUDIT-DEV-012 L-4). Aísla los casos de
 * uso de `settings` del servicio concreto de infraestructura (`CredentialEncryptionService`),
 * igual que el recipe module tras `AUDIT-DEV-007` F-2.
 */
export interface ICredentialCipher {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}
