package com.mtl.media.infrastructure.client.catalog;

import org.springframework.security.oauth2.jwt.Jwt;

/** Consulta al catálogo si el JWT puede asociar fotografías al ejemplar y devuelve el {@code usuario_app_id} del actor. */
public interface CatalogMediaPermissionClient {

  long resolveActorUsuarioAppIdForEjemplar(long ejemplarId, Jwt jwt);

  /**
   * {@code true} si el actor puede ver fotografías {@code PRIVATE} del ejemplar (misma regla que subida:
   * propietario COLABORADOR o ADMIN).
   */
  boolean hasPhotoManagementPermission(long ejemplarId, Jwt jwt);
}
