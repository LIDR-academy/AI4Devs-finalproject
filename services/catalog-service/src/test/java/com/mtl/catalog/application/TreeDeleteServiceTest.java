package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Ejemplar;
import com.mtl.catalog.domain.Especie;
import com.mtl.catalog.domain.Provincia;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EjemplarRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TreeDeleteServiceTest {

  @Mock private EjemplarRepository ejemplarRepository;
  @Mock private EjemplarEnrichmentDeletionPort ejemplarEnrichmentDeletionPort;
  @Mock private CatalogAuditService catalogAuditService;
  @InjectMocks private EjemplarDeleteService ejemplarDeleteService;

  @Test
  void authorize_ownerCollaborator_returnsContext() {
    when(ejemplarRepository.findById(42L)).thenReturn(Optional.of(ejemplar(42L, 7L, 10L, 28L)));

    EjemplarDeleteAuthorization auth = ejemplarDeleteService.authorize(42L, 7L, false);

    verify(ejemplarRepository).findById(42L);
    assertThat(auth.treeId()).isEqualTo(42L);
    assertThat(auth.especieId()).isEqualTo(10L);
  }

  @Test
  void authorize_otherCollaborator_returns403() {
    when(ejemplarRepository.findById(42L)).thenReturn(Optional.of(ejemplar(42L, 99L, 10L, 28L)));

    assertThatThrownBy(() -> ejemplarDeleteService.authorize(42L, 7L, false))
        .isInstanceOf(CatalogForbiddenException.class);
  }

  @Test
  void commitPhysicalDelete_borrarTreeRegistraAuditoriaYHookMongo() {
    EjemplarDeleteAuthorization auth = new EjemplarDeleteAuthorization(42L, 10L, 28L);
    when(ejemplarRepository.existsById(42L)).thenReturn(true);

    ejemplarDeleteService.commitPhysicalDelete(auth, 7L);

    verify(ejemplarRepository).deleteById(42L);
    verify(ejemplarEnrichmentDeletionPort).deleteEnrichmentForEjemplar(42L);
    verify(catalogAuditService).recordEjemplarDeleted(eq(7L), eq(42L), eq(10L), eq(28L));
  }

  @Test
  void authorize_notFound_returns404() {
    when(ejemplarRepository.findById(999L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> ejemplarDeleteService.authorize(999L, 7L, false))
        .isInstanceOf(CatalogNotFoundException.class);
  }

  private static Ejemplar ejemplar(long id, long usuarioAppId, long especieId, long provinciaId) {
    Ejemplar ejemplar = new Ejemplar();
    ejemplar.setId(id);
    ejemplar.setUsuarioApp(usuarioAppRef(usuarioAppId));
    ejemplar.setEspecie(especieRef(especieId));
    ejemplar.setProvincia(provinciaRef(provinciaId));
    ejemplar.setLatitud(BigDecimal.ONE);
    ejemplar.setLongitud(BigDecimal.ONE);
    return ejemplar;
  }

  private static UsuarioApp usuarioAppRef(long id) {
    UsuarioApp u = new UsuarioApp();
    u.setId(id);
    return u;
  }

  private static Especie especieRef(long id) {
    Especie e = new Especie();
    e.setId(id);
    return e;
  }

  private static Provincia provinciaRef(long id) {
    Provincia p = new Provincia();
    p.setId(id);
    return p;
  }
}
