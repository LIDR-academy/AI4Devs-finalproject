# language: es
Característica: Listado y reproducción de meditaciones

  Como usuario autenticado
  Quiero ver el listado de mis meditaciones con su estado
  Y reproducir las que ya están completadas
  Para poder hacer seguimiento y consumir el contenido generado

  Reglas de negocio:
  - Solo se muestran las meditaciones que pertenecen exclusivamente al usuario autenticado
  - Se permite la reproducción únicamente de las meditaciones cuyo estado sea "Completada"
  - El listado debe reflejar el estado más reciente de cada proceso de generación
  - Estados visibles: "En cola", "Generando", "Completada", "Fallida"

  Escenario: Listar las meditaciones del usuario con su estado
    Dado el usuario está autenticado
    Cuando solicita ver el listado de sus meditaciones
    Entonces ve todas sus meditaciones
    Y para cada una ve su estado actual

  Escenario: Reproducir una meditación completada
    Dado el usuario está autenticado
    Y existe una meditación con estado "Completada" en su lista
    Cuando selecciona reproducir esa meditación
    Entonces comienza la reproducción del contenido
