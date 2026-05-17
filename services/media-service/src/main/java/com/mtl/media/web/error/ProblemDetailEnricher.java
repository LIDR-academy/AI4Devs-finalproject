package com.mtl.media.web.error;

import com.mtl.media.web.CorrelationIdFilter;
import org.slf4j.MDC;
import org.springframework.http.ProblemDetail;

public final class ProblemDetailEnricher {

  private ProblemDetailEnricher() {}

  public static void enrichWithCorrelationId(ProblemDetail pd) {
    String corr = MDC.get(CorrelationIdFilter.MDC_KEY);
    if (corr != null && !corr.isBlank()) {
      pd.setProperty("correlationId", corr);
    }
  }
}
