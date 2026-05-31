package com.mtl.e2e.support;

import tools.jackson.databind.json.JsonMapper;

/** {@link JsonMapper} compartido por cliente HTTP y aserciones E2E. */
final class E2eTestJson {

  static final JsonMapper MAPPER = JsonMapper.builder().build();

  private E2eTestJson() {}
}
