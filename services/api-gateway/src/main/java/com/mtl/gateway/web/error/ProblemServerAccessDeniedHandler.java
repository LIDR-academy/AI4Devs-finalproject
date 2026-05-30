package com.mtl.gateway.web.error;

import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.databind.json.JsonMapper;

/** 403 en el gateway con cuerpo RFC 9457. */
@Component
public class ProblemServerAccessDeniedHandler implements ServerAccessDeniedHandler {

  private final JsonMapper jsonMapper;

  public ProblemServerAccessDeniedHandler(JsonMapper jsonMapper) {
    this.jsonMapper = jsonMapper;
  }

  @Override
  public Mono<Void> handle(ServerWebExchange exchange, AccessDeniedException denied) {
    ProblemDetail pd =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.FORBIDDEN, "No tiene permisos para acceder a este recurso");
    pd.setTitle("Prohibido");
    pd.setInstance(URI.create(exchange.getRequest().getURI().getPath()));
    ProblemDetailEnricher.enrichWithCorrelationId(exchange, pd);
    return ProblemResponseWriter.write(exchange, jsonMapper, pd);
  }
}
