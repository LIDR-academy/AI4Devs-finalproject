package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.Ejemplar;
import com.mtl.catalog.domain.Especie;
import com.mtl.catalog.domain.EstadoPublicacion;
import com.mtl.catalog.domain.Provincia;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EjemplarRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
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
class EjemplarUpdateServiceTest {

  @Mock private EjemplarRepository ejemplarRepository;
  @Mock private EspecieRepository especieRepository;
  @Mock private ProvinciaReadRepository provinciaReadRepository;
  @InjectMocks private EjemplarUpdateService treeUpdateService;

  @Test
  void update_colaboradorPropietario_persisteSinCambiarCreador() {
    Ejemplar ejemplar = ejemplar(42L, 7L, 10L, 28L);
    when(ejemplarRepository.findById(42L)).thenReturn(Optional.of(ejemplar));
    when(especieRepository.existsById(11L)).thenReturn(true);
    when(provinciaReadRepository.existsById(29L)).thenReturn(true);
    when(especieRepository.getReferenceById(11L)).thenReturn(especieRef(11L));
    when(provinciaReadRepository.getReferenceById(29L)).thenReturn(provinciaRef(29L));
    when(ejemplarRepository.save(any(Ejemplar.class))).thenAnswer(inv -> inv.getArgument(0));

    EjemplarUpdateResult result =
        treeUpdateService.update(42L, command(11L, 29L), 7L, false);

    ArgumentCaptor<Ejemplar> captor = ArgumentCaptor.forClass(Ejemplar.class);
    verify(ejemplarRepository).save(captor.capture());
    Ejemplar saved = captor.getValue();
    assertThat(saved.getUsuarioAppId()).isEqualTo(7L);
    assertThat(saved.getEspecieId()).isEqualTo(11L);
    assertThat(saved.getProvinciaId()).isEqualTo(29L);
    assertThat(saved.getEstadoPublicacion()).isEqualTo(EstadoPublicacion.PUBLICADO);
    assertThat(result.especieIdPrev()).isEqualTo(10L);
    assertThat(result.especieIdNew()).isEqualTo(11L);
  }

  @Test
  void update_colaboradorAjeno_devuelve403() {
    when(ejemplarRepository.findById(42L)).thenReturn(Optional.of(ejemplar(42L, 99L, 10L, 28L)));

    assertThatThrownBy(() -> treeUpdateService.update(42L, command(11L, 29L), 7L, false))
        .isInstanceOf(CatalogForbiddenException.class);
  }

  @Test
  void update_adminPuedeModificarAjeno() {
    Ejemplar ejemplar = ejemplar(42L, 99L, 10L, 28L);
    when(ejemplarRepository.findById(42L)).thenReturn(Optional.of(ejemplar));
    when(especieRepository.existsById(11L)).thenReturn(true);
    when(provinciaReadRepository.existsById(29L)).thenReturn(true);
    when(especieRepository.getReferenceById(11L)).thenReturn(especieRef(11L));
    when(provinciaReadRepository.getReferenceById(29L)).thenReturn(provinciaRef(29L));
    when(ejemplarRepository.save(any(Ejemplar.class))).thenAnswer(inv -> inv.getArgument(0));

    treeUpdateService.update(42L, command(11L, 29L), 1L, true);

    verify(ejemplarRepository).save(any(Ejemplar.class));
  }

  @Test
  void update_inexistente_devuelve404() {
    when(ejemplarRepository.findById(999L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> treeUpdateService.update(999L, command(10L, 28L), 7L, false))
        .isInstanceOf(CatalogNotFoundException.class);
  }

  @Test
  void update_especieInexistente_devuelve400() {
    when(ejemplarRepository.findById(42L)).thenReturn(Optional.of(ejemplar(42L, 7L, 10L, 28L)));
    when(especieRepository.existsById(999L)).thenReturn(false);

    assertThatThrownBy(() -> treeUpdateService.update(42L, command(999L, 28L), 7L, false))
        .isInstanceOf(CatalogValidationException.class)
        .hasMessageContaining("especie");
  }

  private static UpdateEjemplarCommand command(long especieId, long provinciaId) {
    return new UpdateEjemplarCommand(
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
