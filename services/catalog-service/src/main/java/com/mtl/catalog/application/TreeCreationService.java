package com.mtl.catalog.application;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.UsuarioAppRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TreeCreationService {

  static final BigDecimal MIN_LAT = new BigDecimal("-90");
  static final BigDecimal MAX_LAT = new BigDecimal("90");
  static final BigDecimal MIN_LON = new BigDecimal("-180");
  static final BigDecimal MAX_LON = new BigDecimal("180");

  private static final int MAX_MUNICIPIO = 255;
  private static final int MAX_VISIBILIDAD = 64;
  private static final int MAX_ESTADO_PUBLICACION = 64;
  private static final int MAX_EMAIL = 320;
  private static final int MAX_NOMBRE = 255;
  private static final Set<String> ALLOWED_VISIBILIDAD_MAPA_PUBLICO = Set.of("PRIVADO", "PUBLICO");
  private static final Set<String> ALLOWED_ESTADO_PUBLICACION = Set.of("BORRADOR", "PUBLICADO");

  private final UsuarioAppRepository usuarioAppRepository;
  private final EspecieReadRepository especieReadRepository;
  private final ProvinciaReadRepository provinciaReadRepository;
  private final ArbolRepository arbolRepository;

  public TreeCreationService(
      UsuarioAppRepository usuarioAppRepository,
      EspecieReadRepository especieReadRepository,
      ProvinciaReadRepository provinciaReadRepository,
      ArbolRepository arbolRepository) {
    this.usuarioAppRepository = usuarioAppRepository;
    this.especieReadRepository = especieReadRepository;
    this.provinciaReadRepository = provinciaReadRepository;
    this.arbolRepository = arbolRepository;
  }

  @Transactional
  public CreatedTreeResult create(CreateTreeCommand command) {
    String subject = command.subjectOidc() == null ? "" : command.subjectOidc().trim();
    if (subject.isEmpty()) {
      throw new CatalogValidationException("Se requiere el identificador de usuario (subject OIDC).");
    }
    if (command.especieId() == null) {
      throw new CatalogValidationException("Se requiere especie_id.");
    }
    if (command.provinciaId() == null) {
      throw new CatalogValidationException("Se requiere provincia_id.");
    }
    validateCoordinates(command.latitud(), command.longitud());

    if (!especieReadRepository.existsById(command.especieId())) {
      throw new CatalogValidationException("La especie indicada no existe en el catálogo.");
    }
    if (!provinciaReadRepository.existsById(command.provinciaId())) {
      throw new CatalogValidationException("La provincia indicada no existe en el catálogo.");
    }

    String emailNorm = truncate(blankToNull(command.email()), MAX_EMAIL);
    if (emailNorm == null) {
      throw new CatalogValidationException(
          "Se requiere correo electrónico en el token para crear el usuario de aplicación.");
    }

    UsuarioApp creator =
        ensureUsuarioApp(subject, emailNorm, truncate(blankToNull(command.nombrePerfil()), MAX_NOMBRE));
    Long creatorId = creator.getId();
    Instant now = Instant.now();

    Arbol arbol = new Arbol();
    arbol.setEspecieId(command.especieId());
    arbol.setProvinciaId(command.provinciaId());
    arbol.setUsuarioAppId(creatorId);
    arbol.setMunicipio(truncate(blankToNull(command.municipio()), MAX_MUNICIPIO));
    arbol.setDescripcion(blankToNull(command.descripcion()));
    arbol.setVisibilidadMapaPublico(
        validateAndNormalizeVisibility(
            truncate(blankToNull(command.visibilidadMapaPublico()), MAX_VISIBILIDAD)));
    arbol.setLatitud(command.latitud());
    arbol.setLongitud(command.longitud());
    arbol.setAltitud(command.altitud());
    arbol.setEstadoPublicacion(
        validateAndNormalizePublicationState(
            truncate(blankToNull(command.estadoPublicacion()), MAX_ESTADO_PUBLICACION)));
    arbol.setCreadoEn(now);
    arbol.setModificadoEn(now);
    arbol.setCreadoPor(creatorId);
    arbol.setModificadoPor(creatorId);

    Arbol saved = arbolRepository.save(arbol);
    return new CreatedTreeResult(saved.getId(), creatorId, saved.getCreadoEn());
  }

  private static void validateCoordinates(BigDecimal latitud, BigDecimal longitud) {
    if (latitud == null || longitud == null) {
      throw new CatalogValidationException("Se requieren latitud y longitud del ejemplar.");
    }
    if (latitud.compareTo(MIN_LAT) < 0 || latitud.compareTo(MAX_LAT) > 0) {
      throw new CatalogValidationException("La latitud debe estar entre -90 y 90.");
    }
    if (longitud.compareTo(MIN_LON) < 0 || longitud.compareTo(MAX_LON) > 0) {
      throw new CatalogValidationException("La longitud debe estar entre -180 y 180.");
    }
  }

  private static String validateAndNormalizeVisibility(String rawValue) {
    if (rawValue == null) {
      return null;
    }
    String normalized = rawValue.toUpperCase(Locale.ROOT);
    if (!ALLOWED_VISIBILIDAD_MAPA_PUBLICO.contains(normalized)) {
      throw new CatalogValidationException(
          "publicMapVisibility debe ser PRIVADO o PUBLICO.");
    }
    return normalized;
  }

  private static String validateAndNormalizePublicationState(String rawValue) {
    if (rawValue == null) {
      return null;
    }
    String normalized = rawValue.toUpperCase(Locale.ROOT);
    if (!ALLOWED_ESTADO_PUBLICACION.contains(normalized)) {
      throw new CatalogValidationException(
          "publicationState debe ser BORRADOR o PUBLICADO.");
    }
    return normalized;
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
        !Objects.equals(usuario.getEmail(), newEmail) || !Objects.equals(usuario.getNombre(), newNombre);
    if (changed) {
      usuario.setEmail(newEmail);
      usuario.setNombre(newNombre);
      usuario.setModificadoEn(Instant.now());
      usuarioAppRepository.save(usuario);
    }
  }

  private UsuarioApp insertUsuarioAppOrRecover(String subjectOidc, String email, String nombre) {
    UsuarioApp nuevo = new UsuarioApp();
    nuevo.setSubjectOidc(subjectOidc);
    nuevo.setEmail(email);
    nuevo.setNombre(nombre);
    Instant now = Instant.now();
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
