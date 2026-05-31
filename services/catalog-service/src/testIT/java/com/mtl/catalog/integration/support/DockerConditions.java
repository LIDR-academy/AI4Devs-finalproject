package com.mtl.catalog.integration.support;

import org.testcontainers.DockerClientFactory;

/** Condiciones JUnit {@code @EnabledIf} para IT con Testcontainers. */
public final class DockerConditions {

  private DockerConditions() {}

  public static boolean dockerDisponible() {
    try {
      DockerClientFactory.instance().client();
      return true;
    } catch (Throwable t) {
      return false;
    }
  }
}
