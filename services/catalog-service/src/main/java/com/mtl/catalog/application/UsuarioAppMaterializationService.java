package com.mtl.catalog.application;

import com.mtl.catalog.config.CatalogAuditorContext;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Materialización perezosa de {@code usuario_app} desde claims OIDC (ADR-0004), compartida por alta y
 * lecturas colaborador.
 */
@Service
public class UsuarioAppMaterializationService {

  private static final int MAX_EMAIL = 320;
  private static final int MAX_NOMBRE = 255;

  private final UsuarioAppRepository usuarioAppRepository;

  public UsuarioAppMaterializationService(UsuarioAppRepository usuarioAppRepository) {
    this.usuarioAppRepository = usuarioAppRepository;
  }

  @Transactional
  public UsuarioApp materialize(OidcUserProfile profile) {
    String subject = profile.subject() == null ? "" : profile.subject().trim();
    if (subject.isEmpty()) {
      throw new CatalogValidationException("Se requiere el identificador de usuario (subject OIDC).");
    }
    String emailNorm = truncate(blankToNull(profile.email()), MAX_EMAIL);
    if (emailNorm == null) {
      throw new CatalogValidationException(
          "El token de acceso debe incluir el correo electrónico (scope email) para registrar o"
              + " actualizar el usuario de la aplicación.");
    }
    UsuarioApp usuario =
        ensureUsuarioApp(subject, emailNorm, truncate(blankToNull(profile.displayName()), MAX_NOMBRE));
    CatalogAuditorContext.bindUsuarioAppId(usuario.getId());
    return usuario;
  }

  private UsuarioApp ensureUsuarioApp(String subjectOidc, String email, String nombre) {
    Optional<UsuarioApp> existing = usuarioAppRepository.findBySubjectOidc(subjectOidc);
    if (existing.isPresent()) {
      UsuarioApp u = existing.get();
      mergeProfileIfChanged(u, email, nombre);
      return u;
    }
    return insertUsuarioAppOrRecover(subjectOidc, email, nombre);
  }

  private void mergeProfileIfChanged(UsuarioApp usuario, String newEmail, String newNombre) {
    boolean changed =
        !Objects.equals(usuario.getEmail(), newEmail)
            || !Objects.equals(usuario.getNombre(), newNombre);
    if (changed) {
      usuario.setEmail(newEmail);
      usuario.setNombre(newNombre);
      usuario.setModificadoEn(OffsetDateTime.now(ZoneOffset.UTC));
      usuarioAppRepository.save(usuario);
    }
  }

  private UsuarioApp insertUsuarioAppOrRecover(String subjectOidc, String email, String nombre) {
    UsuarioApp nuevo = new UsuarioApp();
    nuevo.setSubjectOidc(subjectOidc);
    nuevo.setEmail(email);
    nuevo.setNombre(nombre);
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    nuevo.setCreadoEn(now);
    nuevo.setModificadoEn(now);
    try {
      return usuarioAppRepository.save(nuevo);
    } catch (DataIntegrityViolationException ex) {
      UsuarioApp recovered =
          usuarioAppRepository
              .findBySubjectOidc(subjectOidc)
              .orElseThrow(
                  () ->
                      new IllegalStateException(
                          "No se pudo resolver usuario_app tras conflicto de inserción concurrente.",
                          ex));
      mergeProfileIfChanged(recovered, email, nombre);
      return recovered;
    }
  }

  private static String blankToNull(String s) {
    if (s == null) {
      return null;
    }
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  private static String truncate(String s, int maxLen) {
    if (s == null) {
      return null;
    }
    return s.length() <= maxLen ? s : s.substring(0, maxLen);
  }
}
