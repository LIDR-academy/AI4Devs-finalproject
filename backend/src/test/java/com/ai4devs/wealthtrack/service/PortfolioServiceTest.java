package com.ai4devs.wealthtrack.service;

import com.ai4devs.wealthtrack.data.Activo;
import com.ai4devs.wealthtrack.data.Portfolio;
import com.ai4devs.wealthtrack.repository.PortfolioRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PortfolioServiceTest {

    @Mock
    private PortfolioRepository repository = mock(PortfolioRepository.class);

    @Test
    void testGetPortfolioByUsuarioId_AllFields() {
        // Mock del PortfolioRepository
        PortfolioService service = new PortfolioService(repository);
        
        // Creación de Activos asociados
        Activo activo1 = new Activo();
        activo1.setId(101L);
        activo1.setTipo("Acción");
        activo1.setNombre("Apple Inc.");
        activo1.setTicker("AAPL");
        activo1.setDivisa("USD");
        activo1.setTipoCambioDivisaCompra(new BigDecimal("1.0"));
        activo1.setFechaCompra(LocalDate.of(2023, 1, 15));
        activo1.setNumeroTitulos(50);
        activo1.setPrecioMedioUnitario(new BigDecimal("150.00"));
        activo1.setCosteComisiones(new BigDecimal("10.00"));
        activo1.setPrecioTotalCoste(new BigDecimal("7510.00"));
        activo1.setPrecioActual(new BigDecimal("155.00"));
        activo1.setUltimaValorizacion(new BigDecimal("155.00"));
        activo1.setFechaActualizacion(LocalDate.of(2023, 10, 1));
        activo1.setTasaInteresNominal(new BigDecimal("5.00"));
        activo1.setPlazoInversion(12);
        activo1.setPrecioUnitarioVenta(new BigDecimal("155.00"));
        activo1.setTipoCambioDivisaVenta(new BigDecimal("1.0"));
        
        Activo activo2 = new Activo();
        activo2.setId(102L);
        activo2.setTipo("Bonos");
        activo2.setNombre("Gobierno USA");
        activo2.setTicker("T-Bond");
        activo2.setDivisa("USD");
        activo2.setTipoCambioDivisaCompra(new BigDecimal("1.0"));
        activo2.setFechaCompra(LocalDate.of(2022, 6, 10));
        activo2.setNumeroTitulos(100);
        activo2.setPrecioMedioUnitario(new BigDecimal("100.00"));
        activo2.setCosteComisiones(new BigDecimal("20.00"));
        activo2.setPrecioTotalCoste(new BigDecimal("10020.00"));
        activo2.setPrecioActual(new BigDecimal("102.00"));
        activo2.setUltimaValorizacion(new BigDecimal("102.00"));
        activo2.setFechaActualizacion(LocalDate.of(2023, 10, 1));
        activo2.setTasaInteresNominal(new BigDecimal("3.00"));
        activo2.setPlazoInversion(24);
        activo2.setPrecioUnitarioVenta(new BigDecimal("102.00"));
        activo2.setTipoCambioDivisaVenta(new BigDecimal("1.0"));
        
        List<Activo> activos = Arrays.asList(activo1, activo2);
        
        // Creación del Portfolio con todos los campos
        Portfolio portfolio = new Portfolio();
        portfolio.setId(1L);
        portfolio.setNombre("Mi Portfolio");
        portfolio.setDivisaPrincipal("USD");
        portfolio.setFechaCreacion(LocalDate.of(2023, 1, 1));
        portfolio.setValorActual(new BigDecimal("10100.00"));
        portfolio.setActivos(activos);
        
        // Simulación del comportamiento del repositorio
        when(repository.findById(1L)).thenReturn(Optional.of(portfolio));
        
        // Ejecución del método a testear
        Optional<Portfolio> result = service.getPortfolioById(1L);
        
        // Assertions
        assertTrue(result.isPresent());
        Portfolio resultPortfolio = result.get();
        assertEquals(1L, resultPortfolio.getId());
        assertEquals("Mi Portfolio", resultPortfolio.getNombre());
        assertEquals("USD", resultPortfolio.getDivisaPrincipal());
        assertEquals(LocalDate.of(2023, 1, 1), resultPortfolio.getFechaCreacion());
        assertEquals(new BigDecimal("10100.00"), resultPortfolio.getValorActual());
        
        // Verificación de Activos
        assertNotNull(resultPortfolio.getActivos());
        assertEquals(2, resultPortfolio.getActivos().size());
        
        Activo resultActivo1 = resultPortfolio.getActivos().get(0);
        assertEquals(101L, resultActivo1.getId());
        assertEquals("Acción", resultActivo1.getTipo());
        assertEquals("Apple Inc.", resultActivo1.getNombre());
        assertEquals("AAPL", resultActivo1.getTicker());
        assertEquals("USD", resultActivo1.getDivisa());
        assertEquals(new BigDecimal("1.0"), resultActivo1.getTipoCambioDivisaCompra());
        assertEquals(LocalDate.of(2023, 1, 15), resultActivo1.getFechaCompra());
        assertEquals(50, resultActivo1.getNumeroTitulos());
        assertEquals(new BigDecimal("150.00"), resultActivo1.getPrecioMedioUnitario());
        assertEquals(new BigDecimal("10.00"), resultActivo1.getCosteComisiones());
        assertEquals(new BigDecimal("7510.00"), resultActivo1.getPrecioTotalCoste());
        assertEquals(new BigDecimal("155.00"), resultActivo1.getPrecioActual());
        assertEquals(new BigDecimal("155.00"), resultActivo1.getUltimaValorizacion());
        assertEquals(LocalDate.of(2023, 10, 1), resultActivo1.getFechaActualizacion());
        assertEquals(new BigDecimal("5.00"), resultActivo1.getTasaInteresNominal());
        assertEquals(12, resultActivo1.getPlazoInversion());
        assertEquals(new BigDecimal("155.00"), resultActivo1.getPrecioUnitarioVenta());
        assertEquals(new BigDecimal("1.0"), resultActivo1.getTipoCambioDivisaVenta());
        
        Activo resultActivo2 = resultPortfolio.getActivos().get(1);
        assertEquals(102L, resultActivo2.getId());
        assertEquals("Bonos", resultActivo2.getTipo());
        assertEquals("Gobierno USA", resultActivo2.getNombre());
        assertEquals("T-Bond", resultActivo2.getTicker());
        assertEquals("USD", resultActivo2.getDivisa());
        assertEquals(new BigDecimal("1.0"), resultActivo2.getTipoCambioDivisaCompra());
        assertEquals(LocalDate.of(2022, 6, 10), resultActivo2.getFechaCompra());
        assertEquals(100, resultActivo2.getNumeroTitulos());
        assertEquals(new BigDecimal("100.00"), resultActivo2.getPrecioMedioUnitario());
        assertEquals(new BigDecimal("20.00"), resultActivo2.getCosteComisiones());
        assertEquals(new BigDecimal("10020.00"), resultActivo2.getPrecioTotalCoste());
        assertEquals(new BigDecimal("102.00"), resultActivo2.getPrecioActual());
        assertEquals(new BigDecimal("102.00"), resultActivo2.getUltimaValorizacion());
        assertEquals(LocalDate.of(2023, 10, 1), resultActivo2.getFechaActualizacion());
        assertEquals(new BigDecimal("3.00"), resultActivo2.getTasaInteresNominal());
        assertEquals(24, resultActivo2.getPlazoInversion());
        assertEquals(new BigDecimal("102.00"), resultActivo2.getPrecioUnitarioVenta());
        assertEquals(new BigDecimal("1.0"), resultActivo2.getTipoCambioDivisaVenta());
        
        // Verificación del mockito
        verify(repository, times(1)).findById(1L);
    }
}
