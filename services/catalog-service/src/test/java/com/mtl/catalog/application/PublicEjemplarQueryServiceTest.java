package com.mtl.catalog.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.PublicEjemplarReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.PublicEjemplarDetailRow;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.PublicEjemplarListRow;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class PublicEjemplarQueryServiceTest {

  @Mock private PublicEjemplarReadRepository publicEjemplarReadRepository;
  @InjectMocks private PublicEjemplarQueryService publicEjemplarQueryService;

  @Test
  void listPublishedEjemplares_sinJwtFuerzaScopePublicoYPublicado() {
    PublicEjemplarListRow row = new PublicEjemplarListRowStub(42L, "Encina", "Quercus ilex", "Madrid", "Madrid");
    Page<PublicEjemplarListRow> page = new PageImpl<>(List.of(row));
    when(publicEjemplarReadRepository.findPublicEjemplarRows(
            any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
        .thenReturn(page);

    PublicEjemplarQueryService.PublicEjemplarFilters filters =
        new PublicEjemplarQueryService.PublicEjemplarFilters(
            "Quercus", "Madrid", "Madrid", "BORRADOR", "PRIVADO");

    var response = publicEjemplarQueryService.listPublishedEjemplares(0, 20, "especie,asc", filters, null);

    ArgumentCaptor<String> estadoCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<String> visibilidadCaptor = ArgumentCaptor.forClass(String.class);
    verify(publicEjemplarReadRepository)
        .findPublicEjemplarRows(
            any(),
            any(),
            any(),
            estadoCaptor.capture(),
            visibilidadCaptor.capture(),
            eq("especie"),
            eq("asc"),
            any(Pageable.class));

    assertEquals("PUBLICADO", estadoCaptor.getValue());
    assertEquals("PUBLICO", visibilidadCaptor.getValue());
    assertEquals(1, response.content().size());
    assertEquals("PUBLICADO", response.content().getFirst().estado());
    assertEquals("PUBLICO", response.content().getFirst().visibilidad());
  }

  @Test
  void getPublishedEjemplarDetail_sinJwtFiltraPublicablesYDevuelve404SiNoExisteONoPublicado() {
    when(publicEjemplarReadRepository.findPublicEjemplarDetailRow(999L, "PUBLICADO", "PUBLICO"))
        .thenReturn(Optional.empty());

    assertThrows(
        CatalogNotFoundException.class,
        () -> publicEjemplarQueryService.getPublishedEjemplarDetail(999L, null));
  }

  @Test
  void getPublishedEjemplarDetail_sinJwtDevuelveDetalleSiPublicado() {
    when(publicEjemplarReadRepository.findPublicEjemplarDetailRow(42L, "PUBLICADO", "PUBLICO"))
        .thenReturn(
            Optional.of(
                new PublicEjemplarDetailRowStub(
                    42L,
                    "Encina",
                    "Quercus ilex",
                    "Madrid",
                    "Madrid",
                    "PUBLICADO",
                    "PUBLICO",
                    "Detalle",
                    new BigDecimal("40.4168"),
                    new BigDecimal("-3.7038"),
                    667)));

    var detail = publicEjemplarQueryService.getPublishedEjemplarDetail(42L, null);

    assertEquals(42L, detail.ejemplarId());
    assertEquals("PUBLICADO", detail.estado());
    assertEquals("PUBLICO", detail.visibilidad());
  }

  private record PublicEjemplarListRowStub(
      Long ejemplarId, String nombreComun, String nombreCientifico, String provincia, String municipio)
      implements PublicEjemplarListRow {
    @Override
    public String getEstado() {
      return "PUBLICADO";
    }

    @Override
    public String getVisibilidad() {
      return "PUBLICO";
    }

    @Override
    public Long getEjemplarId() {
      return ejemplarId;
    }

    @Override
    public String getNombreComun() {
      return nombreComun;
    }

    @Override
    public String getNombreCientifico() {
      return nombreCientifico;
    }

    @Override
    public String getProvincia() {
      return provincia;
    }

    @Override
    public String getMunicipio() {
      return municipio;
    }
  }

  private record PublicEjemplarDetailRowStub(
      Long ejemplarId,
      String nombreComun,
      String nombreCientifico,
      String provincia,
      String municipio,
      String estado,
      String visibilidad,
      String descripcion,
      BigDecimal latitud,
      BigDecimal longitud,
      Integer altura)
      implements PublicEjemplarDetailRow {
    @Override
    public Long getEjemplarId() {
      return ejemplarId;
    }

    @Override
    public String getNombreComun() {
      return nombreComun;
    }

    @Override
    public String getNombreCientifico() {
      return nombreCientifico;
    }

    @Override
    public String getProvincia() {
      return provincia;
    }

    @Override
    public String getMunicipio() {
      return municipio;
    }

    @Override
    public String getEstado() {
      return estado;
    }

    @Override
    public String getVisibilidad() {
      return visibilidad;
    }

    @Override
    public String getDescripcion() {
      return descripcion;
    }

    @Override
    public BigDecimal getLatitud() {
      return latitud;
    }

    @Override
    public BigDecimal getLongitud() {
      return longitud;
    }

    @Override
    public Integer getAltura() {
      return altura;
    }
  }
}
