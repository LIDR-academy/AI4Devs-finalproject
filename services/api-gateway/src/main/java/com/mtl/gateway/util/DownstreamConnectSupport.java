package com.mtl.gateway.util;

import java.net.ConnectException;

/** Detección de fallos de conexión TCP hacia microservicios (Netty / Reactor). */
public final class DownstreamConnectSupport {

  private DownstreamConnectSupport() {}

  public static boolean isConnectionRefused(Throwable throwable) {
    for (Throwable current = throwable; current != null; current = current.getCause()) {
      if (current instanceof ConnectException) {
        return true;
      }
      String message = current.getMessage();
      if (message != null && message.contains("Connection refused")) {
        return true;
      }
    }
    return false;
  }
}
