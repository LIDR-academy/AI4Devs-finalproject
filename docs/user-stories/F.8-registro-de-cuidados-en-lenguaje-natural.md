# F.8 - Registro de cuidados en lenguaje natural

**Estado:** Fuera de alcance del MVP / Roadmap

## Historia

**Como** propietario de un vivero
**Quiero** escribir en lenguaje natural lo que he hecho (p. ej. "Hoy he regado la bandeja del fondo")
**Para** registrar el cuidado sin rellenar un formulario.

## Ejemplo

```text
Entrada: "Hoy he regado la bandeja del fondo."

Interpretación:
Ubicación: Bandeja Fondo
Acción: Riego
Fecha: Hoy
```

## Notas

* Complementa a [F.2](F.2-registrar-cuidados-por-lote.md) (cuidados por lote) usando un LLM para interpretar la instrucción en lugar de un formulario estructurado.
