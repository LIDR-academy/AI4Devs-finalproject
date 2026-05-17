package com.mtl.gateway.config;

import com.mtl.gateway.util.DownstreamConnectSupport;
import java.nio.charset.StandardCharsets;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Cuando un microservicio no acepta conexión (p. ej. no arrancado), Netty propaga {@link
 * java.net.ConnectException}. El manejador por defecto del gateway devolvía 500; aquí se traduce a
 * <strong>502</strong> con cuerpo tipo RFC 9457 para que clientes y operadores distingan fallo de
 * infraestructura de error de aplicación.
 */
@Component
public class DownstreamConnectErrorGlobalFilter implements GlobalFilter, Ordered {

  private static final byte[] PROBLEM_JSON =
      "{\"type\":\"about:blank\",\"title\":\"Servicio de destino no disponible\",\"status\":502,\"detail\":\"El API Gateway no pudo conectar con el microservicio aguas abajo. Arranca el servicio correspondiente (p. ej. catalog-service en el puerto 8081 para rutas /api/catalog/**).\"}"
          .getBytes(StandardCharsets.UTF_8);

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    return chain.filter(exchange).onErrorResume(throwable -> translateIfConnectRefused(exchange, throwable));
  }

  private Mono<Void> translateIfConnectRefused(ServerWebExchange exchange, Throwable throwable) {
    if (!DownstreamConnectSupport.isConnectionRefused(throwable)) {
      return Mono.error(throwable);
    }
    if (exchange.getResponse().isCommitted()) {
      return Mono.error(throwable);
    }
    exchange.getResponse().setStatusCode(HttpStatus.BAD_GATEWAY);
    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_PROBLEM_JSON);
    DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(PROBLEM_JSON);
    return exchange.getResponse().writeWith(Mono.just(buffer));
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }
}
