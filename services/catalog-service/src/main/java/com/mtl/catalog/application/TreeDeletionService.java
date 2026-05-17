package com.mtl.catalog.application;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.infrastructure.client.media.MediaTreePhotosClient;
import com.mtl.catalog.util.JwtRealmRoles;
import com.mtl.catalog.util.OidcUserProfileExtractor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Orquestación de baja de ficha (TASK-HU-008-07): media → PostgreSQL → hook Mongo (stub). La llamada
 * a media queda fuera de la transacción JPA del catálogo.
 */
@Service
public class TreeDeletionService {

  private final UsuarioAppMaterializationService usuarioAppMaterializationService;
  private final TreeDeleteService treeDeleteService;
  private final MediaTreePhotosClient mediaTreePhotosClient;

  public TreeDeletionService(
      UsuarioAppMaterializationService usuarioAppMaterializationService,
      TreeDeleteService treeDeleteService,
      MediaTreePhotosClient mediaTreePhotosClient) {
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
    this.treeDeleteService = treeDeleteService;
    this.mediaTreePhotosClient = mediaTreePhotosClient;
  }

  public void deleteTree(long treeId, Jwt jwt) {
    UsuarioApp actor =
        usuarioAppMaterializationService.materialize(OidcUserProfileExtractor.extract(jwt));
    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    boolean collaborator = JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR");

    if (!admin && !collaborator) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para eliminar fichas de árbol.");
    }

    TreeDeleteAuthorization authorization =
        treeDeleteService.authorize(treeId, actor.getId(), admin);

    mediaTreePhotosClient.deleteAllPhotosForTree(treeId, jwt);

    treeDeleteService.commitPhysicalDelete(authorization, actor.getId());
  }

}
