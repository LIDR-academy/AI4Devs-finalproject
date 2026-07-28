# F.9 - Asistente de tareas diarias

**Estado:** Fuera de alcance del MVP / Roadmap

## Historia

**Como** propietario de un vivero
**Quiero** preguntarle al sistema "¿qué tengo que hacer hoy?"
**Para** recibir un resumen de las tareas prioritarias sin tener que revisar planta por planta.

## Ejemplo

```text
Hoy deberías:
- Regar 18 plantas.
- Hay 6 Mammillarias sin revisar desde hace 3 semanas.
- Dos plantas llevan demasiado tiempo en cuarentena.
```

## Notas

* Se apoyaría en un LLM con contexto sobre el estado de la colección (historial, cuidados pendientes), sin necesitar modelos de machine learning entrenados a medida.
* Relacionada con [F.3](F.3-consultar-cuidados-pendientes.md), pero en formato conversacional en vez de dashboard.
