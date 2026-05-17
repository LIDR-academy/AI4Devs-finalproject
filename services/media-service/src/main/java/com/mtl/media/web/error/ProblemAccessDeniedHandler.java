package com.mtl.media.web.error;

import tools.jackson.databind.json.JsonMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class ProblemAccessDeniedHandler implements AccessDeniedHandler {

  private final JsonMapper jsonMapper;

  public ProblemAccessDeniedHandler(JsonMapper jsonMapper) {
    this.jsonMapper = jsonMapper;
  }

  @Override
  public void handle(
      HttpServletRequest request,
      HttpServletResponse response,
      AccessDeniedException accessDeniedException)
      throws IOException {
    ProblemDetail pd =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.FORBIDDEN, "No tiene permisos para acceder a este recurso");
    pd.setTitle("Prohibido");
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    ProblemHttpWriter.write(response, jsonMapper, pd);
  }
}
