package com.ai4devs.wealthtrack.service;

import com.ai4devs.wealthtrack.data.Activo;
import com.ai4devs.wealthtrack.repository.ActivoRepository;
import com.ai4devs.wealthtrack.response.ActivoResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivoService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100L);

    private final ActivoRepository activoRepository;

    public ActivoService(ActivoRepository activoRepository) {
        this.activoRepository = activoRepository;
    }

    public List<ActivoResponse> getActivoById(Long portfolioId) {
        List<Activo> activos = activoRepository.findByPortfolioId(portfolioId);
        return activos.stream().map(ActivoService::mapToActivoResponse).collect(Collectors.toList());
    }

    static ActivoResponse mapToActivoResponse(Activo activo) {
        ActivoResponse response = new ActivoResponse();
        response.setId(activo.getId());
        response.setPortfolioId(activo.getPortfolioId());
        response.setNombre(activo.getNombre());
        response.setTicker(activo.getTicker());
        response.setDivisa(activo.getDivisa());
        response.setTipoCambioDivisaCompra(activo.getTipoCambioDivisaCompra());
        response.setFechaCompra(activo.getFechaCompra());
        response.setNumeroTitulos(activo.getNumeroTitulos());
        response.setPrecioMedioUnitario(activo.getPrecioMedioUnitario());
        response.setCosteComisiones(activo.getCosteComisiones());
        response.setPrecioTotalCoste(activo.getPrecioTotalCoste());
        response.setPrecioActual(activo.getPrecioActual());
        response.setUltimaValorizacion(activo.getUltimaValorizacion());
        response.setFechaActualizacion(activo.getFechaActualizacion());
        response.setTasaInteresNominal(activo.getTasaInteresNominal());
        response.setPlazoInversion(activo.getPlazoInversion());
        response.setPrecioUnitarioVenta(activo.getPrecioUnitarioVenta());
        response.setTipoCambioDivisaVenta(activo.getTipoCambioDivisaVenta());

        BigDecimal ganancia = activo.getUltimaValorizacion().subtract(activo.getPrecioTotalCoste());
        response.setGanancia(ganancia.doubleValue());
        response.setGananciaPorcentaje(
                ganancia.divide(activo.getPrecioTotalCoste(), 6, RoundingMode.HALF_UP)
                        .multiply(HUNDRED)
                        .doubleValue()
        );

        return response;
    }

}
