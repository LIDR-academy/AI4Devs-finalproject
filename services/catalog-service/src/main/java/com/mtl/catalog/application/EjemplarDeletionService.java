package com.mtl.catalog.application;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.infrastructure.client.media.MediaEjemplarPhotosClient;
import com.mtl.catalog.util.JwtRealmRoles;
import com.mtl.catalog.util.OidcUserProfileExtractor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Orquestación de baja de ficha (TASK-HU-008-07): media → PostgreSQL → hook Mongo (stub). La llamada
 * a media queda fuera de la transacción JPA del catálogo.
 */
@Service
public class EjemplarDeletionService {

  private final UsuarioAppMaterializationService usuarioAppMaterializationService;
  private final EjemplarDeleteService ejemplarDeleteService;
  private final MediaEjemplarPhotosClient mediaEjemplarPhotosClient;

  public EjemplarDeletionService(
      UsuarioAppMaterializationService usuarioAppMaterializationService,
      EjemplarDeleteService ejemplarDeleteService,
      MediaEjemplarPhotosClient mediaEjemplarPhotosClient) {
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
    this.ejemplarDeleteService = ejemplarDeleteService;
    this.mediaEjemplarPhotosClient = mediaEjemplarPhotosClient;
  }

  public void deleteEjemplar(long ejemplarId, Jwt jwt) {
    UsuarioApp actor =
        usuarioAppMaterializationService.materialize(OidcUserProfileExtractor.extract(jwt));
    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    boolean collaborator = JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR");

    if (!admin && !collaborator) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para eliminar fichas de árbol.");
    }

    EjemplarDeleteAuthorization authorization =
        ejemplarDeleteService.authorize(ejemplarId, actor.getId(), admin);

    mediaEjemplarPhotosClient.deleteAllPhotosForEjemplar(ejemplarId, jwt);

    ejemplarDeleteService.commitPhysicalDelete(authorization, actor.getId());
  }

}
