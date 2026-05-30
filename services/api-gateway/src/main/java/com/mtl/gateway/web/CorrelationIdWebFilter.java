package com.mtl.gateway.web;

import java.util.UUID;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Propaga {@value #HEADER_NAME} en peticiones al gateway (OpenAPI / api-security). El valor queda en
 * atributos del exchange para respuestas Problem y en la cabecera de respuesta.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdWebFilter implements WebFilter {

  public static final String HEADER_NAME = "X-Correlation-Id";
  public static final String EXCHANGE_ATTR = "correlationId";

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    String id = exchange.getRequest().getHeaders().getFirst(HEADER_NAME);
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
    }
    exchange.getAttributes().put(EXCHANGE_ATTR, id);
    exchange.getResponse().getHeaders().set(HEADER_NAME, id);
    return chain.filter(exchange);
  }
}
