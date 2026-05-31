package com.mtl.media.web.error;

import tools.jackson.databind.json.JsonMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private final JsonMapper jsonMapper;

  public ProblemAuthenticationEntryPoint(JsonMapper jsonMapper) {
    this.jsonMapper = jsonMapper;
  }

  @Override
  public void commence(
      HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
      throws IOException {
    ProblemDetail pd =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.UNAUTHORIZED, "Se requiere autenticación con un token Bearer válido");
    pd.setTitle("No autenticado");
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    ProblemHttpWriter.write(response, jsonMapper, pd);
  }
}
