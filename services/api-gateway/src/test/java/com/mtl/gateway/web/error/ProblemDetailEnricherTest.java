package com.mtl.gateway.web.error;

import static org.assertj.core.api.Assertions.assertThat;

import com.mtl.gateway.web.CorrelationIdWebFilter;
import org.junit.jupiter.api.Test;
import org.springframework.http.ProblemDetail;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

class ProblemDetailEnricherTest {

  @Test
  void enrichWithCorrelationId_whenPresentInExchange_addsProperty() {
    MockServerWebExchange exchange =
        MockServerWebExchange.from(MockServerHttpRequest.get("/api/catalog/trees").build());
    exchange.getAttributes().put(CorrelationIdWebFilter.EXCHANGE_ATTR, "corr-123");

    ProblemDetail pd = ProblemDetail.forStatus(401);
    ProblemDetailEnricher.enrichWithCorrelationId(exchange, pd);

    assertThat(pd.getProperties().get("correlationId")).isEqualTo("corr-123");
  }

  @Test
  void enrichWithCorrelationId_whenAbsent_doesNotAddProperty() {
    MockServerWebExchange exchange =
        MockServerWebExchange.from(MockServerHttpRequest.get("/api/catalog/trees").build());

    ProblemDetail pd = ProblemDetail.forStatus(401);
    ProblemDetailEnricher.enrichWithCorrelationId(exchange, pd);

    assertThat(pd.getProperties()).isNullOrEmpty();
  }
}
