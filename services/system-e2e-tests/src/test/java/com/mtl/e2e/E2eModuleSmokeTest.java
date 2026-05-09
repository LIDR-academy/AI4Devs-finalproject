package com.mtl.e2e;

import org.junit.jupiter.api.Test;

/** Evita que Surefire falle por “no hay tests” cuando los E2E están desactivados por entorno. */
class E2eModuleSmokeTest {

  @Test
  void moduleCompiles() {
    // sin aserciones: solo confirma que el módulo tiene tests unitarios mínimos
  }
}
