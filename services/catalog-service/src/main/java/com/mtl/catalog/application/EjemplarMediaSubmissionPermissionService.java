package com.mtl.catalog.application;

import com.mtl.catalog.domain.Ejemplar;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.MediaSubmissionPermissionResponse;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EjemplarRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import com.mtl.catalog.util.JwtRealmRoles;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EjemplarMediaSubmissionPermissionService {

  private final EjemplarRepository ejemplarRepository;
  private final UsuarioAppRepository usuarioAppRepository;

  public EjemplarMediaSubmissionPermissionService(
      EjemplarRepository ejemplarRepository, UsuarioAppRepository usuarioAppRepository) {
    this.ejemplarRepository = ejemplarRepository;
    this.usuarioAppRepository = usuarioAppRepository;
  }

  @Transactional(readOnly = true)
  public MediaSubmissionPermissionResponse resolve(long ejemplarId, Jwt jwt) {
    Ejemplar ejemplar =
        ejemplarRepository
            .findById(ejemplarId)
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

    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    if (admin) {
      return new MediaSubmissionPermissionResponse(ejemplarId, actor.getId());
    }

    if (!JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR")) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para asociar fotografías a un árbol.");
    }

    if (!ejemplar.getUsuarioAppId().equals(actor.getId())) {
      throw new CatalogForbiddenException(
          "Solo el colaborador creador del árbol puede asociar fotografías a esta ficha.");
    }

    return new MediaSubmissionPermissionResponse(ejemplarId, actor.getId());
  }
}
