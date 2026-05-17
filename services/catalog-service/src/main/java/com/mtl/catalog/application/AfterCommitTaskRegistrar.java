package com.mtl.catalog.application;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Ejecuta una tarea tras el commit de la transacción activa; si no hay transacción (p. ej. tests
 * unitarios), ejecuta en el mismo hilo de forma inmediata.
 */
@Component
public class AfterCommitTaskRegistrar {

  public void runAfterCommit(Runnable task) {
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.registerSynchronization(
          new TransactionSynchronization() {
            @Override
            public void afterCommit() {
              task.run();
            }
          });
    } else {
      task.run();
    }
  }
}
