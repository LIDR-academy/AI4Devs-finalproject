package com.mtl.media.infrastructure.client.catalog;

import org.springframework.security.oauth2.jwt.Jwt;

/** Consulta al catálogo si el JWT puede asociar fotografías al árbol y devuelve el {@code usuario_app_id} del actor. */
public interface CatalogMediaPermissionClient {

  long resolveActorUsuarioAppIdForTree(long treeId, Jwt jwt);
}
