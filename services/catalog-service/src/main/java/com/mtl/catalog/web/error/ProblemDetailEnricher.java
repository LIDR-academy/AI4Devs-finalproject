package com.mtl.catalog.web.error;

import com.mtl.catalog.web.CorrelationIdFilter;
import org.slf4j.MDC;
import org.springframework.http.ProblemDetail;

/** Añade contexto operativo (p. ej. correlación) a {@link ProblemDetail} sin acoplar controladores. */
public final class ProblemDetailEnricher {

  private ProblemDetailEnricher() {}

  public static void enrichWithCorrelationId(ProblemDetail pd) {
    String corr = MDC.get(CorrelationIdFilter.MDC_KEY);
    if (corr != null && !corr.isBlank()) {
      pd.setProperty("correlationId", corr);
    }
  }
}
