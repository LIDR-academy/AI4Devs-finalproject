package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TreeUpdateServiceTest {

  @Mock private ArbolRepository arbolRepository;
  @Mock private EspecieReadRepository especieReadRepository;
  @Mock private ProvinciaReadRepository provinciaReadRepository;
  @InjectMocks private TreeUpdateService treeUpdateService;

  @Test
  void update_colaboradorPropietario_persisteSinCambiarCreador() {
    Arbol arbol = arbol(42L, 7L, 10L, 28L);
    when(arbolRepository.findById(42L)).thenReturn(Optional.of(arbol));
    when(especieReadRepository.existsById(11L)).thenReturn(true);
    when(provinciaReadRepository.existsById(29L)).thenReturn(true);
    when(arbolRepository.save(any(Arbol.class))).thenAnswer(inv -> inv.getArgument(0));

    TreeUpdateResult result =
        treeUpdateService.update(42L, command(11L, 29L), 7L, false);

    ArgumentCaptor<Arbol> captor = ArgumentCaptor.forClass(Arbol.class);
    verify(arbolRepository).save(captor.capture());
    Arbol saved = captor.getValue();
    assertThat(saved.getUsuarioAppId()).isEqualTo(7L);
    assertThat(saved.getEspecieId()).isEqualTo(11L);
    assertThat(saved.getProvinciaId()).isEqualTo(29L);
    assertThat(saved.getEstadoPublicacion()).isEqualTo("PUBLICADO");
    assertThat(result.especieIdPrev()).isEqualTo(10L);
    assertThat(result.especieIdNew()).isEqualTo(11L);
  }

  @Test
  void update_colaboradorAjeno_devuelve403() {
    when(arbolRepository.findById(42L)).thenReturn(Optional.of(arbol(42L, 99L, 10L, 28L)));

    assertThatThrownBy(() -> treeUpdateService.update(42L, command(11L, 29L), 7L, false))
        .isInstanceOf(CatalogForbiddenException.class);
  }

  @Test
  void update_adminPuedeModificarAjeno() {
    Arbol arbol = arbol(42L, 99L, 10L, 28L);
    when(arbolRepository.findById(42L)).thenReturn(Optional.of(arbol));
    when(especieReadRepository.existsById(11L)).thenReturn(true);
    when(provinciaReadRepository.existsById(29L)).thenReturn(true);
    when(arbolRepository.save(any(Arbol.class))).thenAnswer(inv -> inv.getArgument(0));

    treeUpdateService.update(42L, command(11L, 29L), 1L, true);

    verify(arbolRepository).save(any(Arbol.class));
  }

  @Test
  void update_inexistente_devuelve404() {
    when(arbolRepository.findById(999L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> treeUpdateService.update(999L, command(10L, 28L), 7L, false))
        .isInstanceOf(CatalogNotFoundException.class);
  }

  @Test
  void update_especieInexistente_devuelve400() {
    when(arbolRepository.findById(42L)).thenReturn(Optional.of(arbol(42L, 7L, 10L, 28L)));
    when(especieReadRepository.existsById(999L)).thenReturn(false);

    assertThatThrownBy(() -> treeUpdateService.update(42L, command(999L, 28L), 7L, false))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("especie");
  }

  private static UpdateTreeCommand command(long especieId, long provinciaId) {
    return new UpdateTreeCommand(
        especieId,
        provinciaId,
        new BigDecimal("40.0"),
        new BigDecimal("-3.0"),
        "Madrid",
        "Nota",
        600,
        "PUBLICO",
        "publicado");
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
