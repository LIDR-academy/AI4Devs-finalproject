package com.mtl.catalog.application;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.MediaSubmissionPermissionResponse;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import java.util.List;
import java.util.Map;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TreeMediaSubmissionPermissionService {

  private final ArbolRepository arbolRepository;
  private final UsuarioAppRepository usuarioAppRepository;

  public TreeMediaSubmissionPermissionService(
      ArbolRepository arbolRepository, UsuarioAppRepository usuarioAppRepository) {
    this.arbolRepository = arbolRepository;
    this.usuarioAppRepository = usuarioAppRepository;
  }

  @Transactional(readOnly = true)
  public MediaSubmissionPermissionResponse resolve(long treeId, Jwt jwt) {
    Arbol arbol =
        arbolRepository
            .findById(treeId)
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No existe un árbol con el identificador indicado."));

    UsuarioApp actor =
        usuarioAppRepository
            .findBySubjectOidc(jwt.getSubject())
            .orElseThrow(
                () ->
                    new CatalogForbiddenException(
                        "No existe un usuario de aplicación asociado a este token."));

    boolean admin = hasRealmRole(jwt, "ADMIN");
    if (admin) {
      return new MediaSubmissionPermissionResponse(treeId, actor.getId());
    }

    if (!hasRealmRole(jwt, "COLABORADOR")) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para asociar fotografías a un árbol.");
    }

    if (!arbol.getUsuarioAppId().equals(actor.getId())) {
      throw new CatalogForbiddenException(
          "Solo el colaborador creador del árbol puede asociar fotografías a esta ficha.");
    }

    return new MediaSubmissionPermissionResponse(treeId, actor.getId());
  }

  private static boolean hasRealmRole(Jwt jwt, String role) {
    Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
    if (realmAccess == null) {
      return false;
    }
    Object rolesObj = realmAccess.get("roles");
    if (!(rolesObj instanceof List<?> roles)) {
      return false;
    }
    return roles.stream().filter(String.class::isInstance).map(String.class::cast).anyMatch(role::equals);
  }
}
