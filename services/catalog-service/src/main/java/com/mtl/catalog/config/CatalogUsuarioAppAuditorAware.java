package com.mtl.catalog.config;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import java.util.Optional;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Auditoría JPA: {@code creado_por} / {@code modificado_por} como {@code usuario_app_id} del JWT
 * actual (subject OIDC → fila {@code usuario_app}). Debe existir fila antes de persistir entidades
 * auditadas en la misma transacción (p. ej. tras {@code ensureUsuarioApp} en alta de árbol).
 */
@Component("catalogUsuarioAppAuditorAware")
public class CatalogUsuarioAppAuditorAware implements AuditorAware<Long> {

  private final UsuarioAppRepository usuarioAppRepository;

  public CatalogUsuarioAppAuditorAware(UsuarioAppRepository usuarioAppRepository) {
    this.usuarioAppRepository = usuarioAppRepository;
  }

  @Override
  public Optional<Long> getCurrentAuditor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      return Optional.empty();
    }
    Object principal = authentication.getPrincipal();
    if (!(principal instanceof Jwt jwt)) {
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
    return usuarioAppRepository.findBySubjectOidc(trimmed).map(UsuarioApp::getId);
  }
}
