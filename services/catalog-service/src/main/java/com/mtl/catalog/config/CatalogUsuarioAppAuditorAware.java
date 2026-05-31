package com.mtl.catalog.config;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.FlushModeType;
import java.util.Optional;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Auditoría JPA: {@code creado_por} / {@code modificado_por} como {@code usuario_app_id} del JWT
 * actual (subject OIDC → fila {@code usuario_app}). Debe existir fila antes de persistir entidades
 * auditadas en la misma transacción (p. ej. tras {@code ensureUsuarioApp} en Alta de ejemplar).
 */
@Component("catalogUsuarioAppAuditorAware")
public class CatalogUsuarioAppAuditorAware implements AuditorAware<UsuarioApp> {

  private final UsuarioAppRepository usuarioAppRepository;
  private final EntityManager entityManager;

  public CatalogUsuarioAppAuditorAware(
      UsuarioAppRepository usuarioAppRepository, EntityManager entityManager) {
    this.usuarioAppRepository = usuarioAppRepository;
    this.entityManager = entityManager;
  }

  @Override
  public Optional<UsuarioApp> getCurrentAuditor() {
    Optional<Long> bound = CatalogAuditorContext.currentUsuarioAppId();
    if (bound.isPresent()) {
      return Optional.of(entityManager.getReference(UsuarioApp.class, bound.get()));
    }

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      return Optional.empty();
    }
    Jwt jwt = resolveJwt(authentication);
    if (jwt == null) {
      return Optional.empty();
    }
    String subject = jwt.getSubject();
    if (subject == null) {
      return Optional.empty();
    }
    String trimmed = subject.trim();
    if (trimmed.isEmpty()) {
      return Optional.empty();
    }
    FlushModeType previousFlushMode = entityManager.getFlushMode();
    entityManager.setFlushMode(FlushModeType.COMMIT);
    try {
      return usuarioAppRepository.findBySubjectOidc(trimmed);
    } finally {
      entityManager.setFlushMode(previousFlushMode);
    }
  }

  private static Jwt resolveJwt(Authentication authentication) {
    if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
      return jwtAuthenticationToken.getToken();
    }
    if (authentication.getPrincipal() instanceof Jwt jwtPrincipal) {
      return jwtPrincipal;
    }
    return null;
  }
}
