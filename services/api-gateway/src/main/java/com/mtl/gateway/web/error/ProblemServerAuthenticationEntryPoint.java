package com.mtl.gateway.web.error;

import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.databind.json.JsonMapper;

/** 401 en el gateway con cuerpo RFC 9457 (sin detalles internos ni stack). */
@Component
public class ProblemServerAuthenticationEntryPoint implements ServerAuthenticationEntryPoint {

  private final JsonMapper jsonMapper;

  public ProblemServerAuthenticationEntryPoint(JsonMapper jsonMapper) {
    this.jsonMapper = jsonMapper;
  }

  @Override
  public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException ex) {
    ProblemDetail pd =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.UNAUTHORIZED, "Se requiere autenticación con un token Bearer válido");
    pd.setTitle("No autenticado");
    pd.setInstance(URI.create(exchange.getRequest().getURI().getPath()));
    ProblemDetailEnricher.enrichWithCorrelationId(exchange, pd);
    return ProblemResponseWriter.write(exchange, jsonMapper, pd);
  }
}
