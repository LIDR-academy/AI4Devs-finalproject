package com.mtl.gateway.web.error;

import com.mtl.gateway.web.CorrelationIdWebFilter;
import org.springframework.http.ProblemDetail;
import org.springframework.web.server.ServerWebExchange;

public final class ProblemDetailEnricher {

  private ProblemDetailEnricher() {}

  public static void enrichWithCorrelationId(ServerWebExchange exchange, ProblemDetail pd) {
    String corr = exchange.getAttribute(CorrelationIdWebFilter.EXCHANGE_ATTR);
    if (corr != null && !corr.isBlank()) {
      pd.setProperty("correlationId", corr);
    }
  }
}
