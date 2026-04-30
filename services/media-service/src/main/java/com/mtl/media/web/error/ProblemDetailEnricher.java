package com.mtl.media.web.error;

import org.slf4j.MDC;
import org.springframework.http.ProblemDetail;

public final class ProblemDetailEnricher {

  private ProblemDetailEnricher() {}

  public static void enrichWithCorrelationId(ProblemDetail pd) {
    String corr = MDC.get("correlationId");
    if (corr != null && !corr.isBlank()) {
      pd.setProperty("correlationId", corr);
    }
  }
}
