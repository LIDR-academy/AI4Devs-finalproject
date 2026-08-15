# 📐 Patrón Agnóstico: Controlador REST e Infraestructura

Este documento define la estructura abstracta (pseudocódigo) de un **Controlador HTTP REST** con sanitización activa de entradas y manejo de errores. Es 100% agnóstico de lenguaje y framework web.

---

## 🧩 Pseudocódigo de Referencia:

```text
ESQUEMA_SANITIZACION EsquemaEntradaHTTP:
    campo "id": StringRequerido(FormatoUUID)
    campo "cantidad": StringRequerido(FormatoDecimal)

CLASE ControladorHTTPEjemplo:
    // Inyección del Caso de Uso (SRP)
    CONSTRUCTOR(privado casoDeUso: CasoDeUsoEjemplo)

    METODO manejarPeticion(solicitudHTTP, respuestaHTTP):
        TRATAR:
            // 1. Sanitización activa con Esquema
            datosSanitizados = EsquemaEntradaHTTP.validar({
                id: solicitudHTTP.parametrosRuta.id,
                cantidad: solicitudHTTP.cuerpo.cantidad
            })

            // 2. Delegar ejecución al Caso de Uso
            resultado = casoDeUso.ejecutar(datosSanitizados)

            // 3. Responder con código HTTP 200 OK
            RETORNAR respuestaHTTP.enviarJSON(codigo = 200, datos = resultado)

        CAPTURAR ExcepcionValidacion COMO errorValidacion:
            RETORNAR respuestaHTTP.enviarJSON(codigo = 400, error = errorValidacion.mensaje)

        CAPTURAR ExcepcionDominio COMO errorNegocio:
            RETORNAR respuestaHTTP.enviarJSON(codigo = 422, error = errorNegocio.mensaje)

        CAPTURAR CualquierError COMO errorInesperado:
            DELEGAR AL MANEJADOR_GLOBAL_DE_ERRORES(errorInesperado)
```
