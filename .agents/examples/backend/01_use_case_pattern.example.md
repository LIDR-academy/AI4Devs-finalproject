# 📐 Patrón Agnóstico: Caso de Uso Puro (Aplicación)

Este documento define la estructura abstracta (pseudocódigo) de un **Caso de Uso** aplicando **Clean Architecture** e **Inversión de Dependencias (DIP)**. Es agnóstico de lenguaje (funciona para TypeScript, Python, Java, Go, C#, etc.).

---

## 🧩 Pseudocódigo de Referencia:

```text
INTERFAZ IPuertoRepositorio:
    FUNCION buscarPorId(id: String) -> ObjetoEntidad o Nulo
    FUNCION guardar(entidad: ObjetoEntidad) -> Vacio

CLASE CasoDeUsoEjemplo:
    // Inyección de Dependencia por Interfaz (DIP)
    CONSTRUCTOR(privado repositorio: IPuertoRepositorio)

    METODO ejecutar(datosEntrada: DTOEntrada) -> DTOSalida:
        // 1. Validar invariantes de entrada
        SI datosEntrada.cantidad <= 0 ENTONCES:
            LANZAR ExcepcionDominio("La cantidad debe ser mayor a cero")

        // 2. Obtener entidad mediante el puerto
        entidad = repositorio.buscarPorId(datosEntrada.id)
        SI entidad ES NULO ENTONCES:
            LANZAR ExcepcionRecursoNoEncontrado("Entidad no encontrada")

        // 3. Modificar entidad con lógica de negocio pura
        entidad.consumir(datosEntrada.cantidad)

        // 4. Persistir a través del puerto
        repositorio.guardar(entidad)

        // 5. Retornar DTO de salida serializable
        RETORNAR DTOSalida(exito = Verdadero, nuevaCantidad = entidad.obtenerCantidadFormateada())
```
