import { useEffect, useRef, useState } from 'react';
import { mapToUserFriendlyError } from '../utils/errorMessageMapper.js';

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Carga asíncrona con los estados defensivos de UI (cargando / error traducido /
 * dato) y guarda de cancelación: una respuesta que llega después de que el
 * componente se desmontó —o después de que `key` cambió— nunca escribe estado.
 *
 * Extraído (TK-120-FE) tras el gate de duplicación detectar el mismo bloque
 * repetido entre `PreparationWasteReportPanel` y `TemperatureLogReportPanel`
 * (el patrón ya aparecía además en `ReportsDashboard`). El error SIEMPRE pasa por
 * `mapToUserFriendlyError` (Guard 38 / frontend_rules.md §9 regla 2).
 *
 * `key` es la firma serializada de las dependencias (ej. `` `${startDate}|${endDate}` ``):
 * un string en vez de un array evita que `react-hooks/exhaustive-deps` pierda la
 * capacidad de verificar estáticamente las dependencias del efecto.
 */
export function useAsyncData<T>(loader: () => Promise<T>, key: string): AsyncDataState<T> {
  const [state, setState] = useState<AsyncDataState<T>>({ data: null, loading: true, error: null });
  // El loader se redefine en cada render del llamador; guardarlo en una ref evita
  // relanzar la carga por un simple cambio de identidad de función.
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    loaderRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: mapToUserFriendlyError(err).message });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
