package com.mtl.media.web.error;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import tools.jackson.databind.json.JsonMapper;

public final class ProblemHttpWriter {

  private ProblemHttpWriter() {}

  public static void write(HttpServletResponse response, JsonMapper jsonMapper, ProblemDetail detail)
      throws IOException {
    response.setStatus(detail.getStatus());
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    jsonMapper.writeValue(response.getOutputStream(), detail);
  }
}
