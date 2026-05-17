package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TreeDeleteServiceTest {

  @Mock private ArbolRepository arbolRepository;
  @Mock private TreeEnrichmentDeletionPort treeEnrichmentDeletionPort;
  @Mock private CatalogAuditService catalogAuditService;
  @InjectMocks private TreeDeleteService treeDeleteService;

  @Test
  void authorize_colaboradorPropietario_devuelveContexto() {
    when(arbolRepository.findById(42L)).thenReturn(Optional.of(arbol(42L, 7L, 10L, 28L)));

    TreeDeleteAuthorization auth = treeDeleteService.authorize(42L, 7L, false);

    verify(arbolRepository).findById(42L);
    assertThat(auth.treeId()).isEqualTo(42L);
    assertThat(auth.especieId()).isEqualTo(10L);
  }

  @Test
  void authorize_colaboradorAjeno_devuelve403() {
    when(arbolRepository.findById(42L)).thenReturn(Optional.of(arbol(42L, 99L, 10L, 28L)));

    assertThatThrownBy(() -> treeDeleteService.authorize(42L, 7L, false))
        .isInstanceOf(CatalogForbiddenException.class);
  }

  @Test
  void commitPhysicalDelete_borraArbolRegistraAuditoriaYHookMongo() {
    TreeDeleteAuthorization auth = new TreeDeleteAuthorization(42L, 10L, 28L);
    when(arbolRepository.existsById(42L)).thenReturn(true);

    treeDeleteService.commitPhysicalDelete(auth, 7L);

    verify(arbolRepository).deleteById(42L);
    verify(treeEnrichmentDeletionPort).deleteEnrichmentForTree(42L);
    verify(catalogAuditService).recordTreeDeleted(eq(7L), eq(42L), eq(10L), eq(28L));
  }

  @Test
  void authorize_inexistente_devuelve404() {
    when(arbolRepository.findById(999L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> treeDeleteService.authorize(999L, 7L, false))
        .isInstanceOf(CatalogNotFoundException.class);
  }

  private static Arbol arbol(long id, long usuarioAppId, long especieId, long provinciaId) {
    Arbol arbol = new Arbol();
    arbol.setId(id);
    arbol.setUsuarioAppId(usuarioAppId);
    arbol.setEspecieId(especieId);
    arbol.setProvinciaId(provinciaId);
    arbol.setLatitud(BigDecimal.ONE);
    arbol.setLongitud(BigDecimal.ONE);
    return arbol;
  }
}
