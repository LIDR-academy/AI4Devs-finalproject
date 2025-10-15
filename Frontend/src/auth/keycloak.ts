import Keycloak from 'keycloak-js';
import { env } from '../env';

function computeBaseUrl(issuer: string): string {
  const match = issuer.match(/^(.*)\/realms\/[^/]+$/);
  return match ? match[1] : issuer;
}

function computeRealm(issuer: string): string {
  const parts = issuer.split('/realms/');
  return parts[1] ?? '';
}

let keycloakSingleton: Keycloak | null | undefined;

export function getKeycloak(): Keycloak | null {
  if (keycloakSingleton !== undefined) return keycloakSingleton;
  const issuer = env.oidcIssuer;
  const clientId = env.oidcClientId;
  if (!issuer || !clientId) {
    keycloakSingleton = null;
    return keycloakSingleton;
  }
  keycloakSingleton = new Keycloak({
    url: computeBaseUrl(issuer),
    realm: computeRealm(issuer),
    clientId,
  });
  return keycloakSingleton;
}

