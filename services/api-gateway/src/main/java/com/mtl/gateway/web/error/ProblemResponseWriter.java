package com.mtl.gateway.web.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.databind.json.JsonMapper;

/** Escritura reactiva de {@link ProblemDetail} como {@code application/problem+json} (RFC 9457). */
public final class ProblemResponseWriter {

  private ProblemResponseWriter() {}

  public static Mono<Void> write(
      ServerWebExchange exchange, JsonMapper jsonMapper, ProblemDetail detail) {
    HttpStatus status = HttpStatus.valueOf(detail.getStatus());
    exchange.getResponse().setStatusCode(status);
    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_PROBLEM_JSON);
    byte[] body;
    try {
      body = jsonMapper.writeValueAsBytes(detail);
    } catch (Exception ex) {
      return Mono.error(ex);
    }
    return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
  }
}
