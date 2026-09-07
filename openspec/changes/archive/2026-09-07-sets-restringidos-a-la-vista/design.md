## Context

Ver `proposal.md` — Why. Lo que condiciona el enfoque:

- **La rejilla se sirve de la proyección pública para todo el mundo**, con sesión o
  sin ella (`browsePublicCatalog`). Es idéntica para cualquiera y por eso es
  cacheable; la ficha es la que se personaliza.
- **`restricted` está hoy en `NON_PUBLIC_SET_FIELDS`**, junto a `referenceValue` y
  `published`, y un test afirma que ninguno de esos campos aparece en la proyección
  pública. La lista existe para que una fuga sea un fallo de spec y no un descuido.
- **La elegibilidad ya distingue cuatro motivos** y la ficha les da salidas distintas.
  El de antigüedad es el único sin ninguna.
- **`monthsBetween` define qué es un mes completo**: si el día del mes de destino es
  menor que el de origen, el mes no cuenta.

## Goals / Non-Goals

**Goals:**

- Que la restricción se vea antes de abrir la ficha.
- Que el rechazo por antigüedad diga **cuándo** deja de aplicar.
- No mover la frontera de D13 ni convertir la rejilla en una página por usuario.

**Non-Goals:**

- **Ocultar los sets restringidos.** Ver Decisión 1.
- **Permitir encolarse sin la antigüedad.** `joinQueue` exige lo mismo que alquilar, y
  la cola no es una lista de espera para ganar antigüedad. La espera aquí no tiene cola
  que guardar: la fecha llega sola.
- **Avisar cuando llegue la fecha.** Sería un aviso más del motor de notificaciones y
  no hay evento que lo dispare —nadie "cumple antigüedad", simplemente pasa el tiempo—.
  Exigiría un barrido periódico, y el plan Hobby ya gasta sus dos crons.

## Decisions

### 1. Mostrar con la condición, nunca ocultar

**Alternativa descartada:** filtrar del catálogo los sets que el suscriptor todavía no
puede alquilar. Tres cosas la descartan:

1. **Un visitante sin sesión vería más catálogo que un suscriptor.** La proyección
   pública muestra los 35 sets publicados a cualquiera; esconder 9 a quien acaba de
   suscribirse haría que **iniciar sesión reduzca** lo que se ve. La frontera de D13 es
   la disponibilidad, no la existencia.
2. **La antigüedad es un premio, y el premio hay que verlo.** La regla existe para
   recompensar seguir suscrito; un catálogo que esconde la recompensa no la motiva.
3. **Es una cuarta parte del catálogo** con el ajuste por defecto. Recortarlo a quien
   acaba de pagar su primera cuota es la peor primera impresión disponible.

### 2. La marca es del set; la fecha, de quien mira

La condición ("a partir de 3 meses de suscripción") es un **atributo del set**: igual
para todos, sin sesión, sin consultas por usuario. Va en la rejilla.

La fecha depende de cuándo empezó **tu** suscripción. Ponerla en las 24 tarjetas de la
rejilla convertiría una página idéntica para todos en una distinta para cada uno, y
obligaría a resolver la suscripción del usuario para pintar un listado. Va en la ficha,
que ya es personal —calcula elegibilidad, posición en cola y plazas del plan— y que es
donde se toma la decisión.

### 3. `restricted` es público, y eso hay que escribirlo

Sacarlo de `NON_PUBLIC_SET_FIELDS` es el corazón del change, no un detalle de
implementación. El criterio de D13 se mantiene intacto: no sale disponibilidad, ni nada
de nivel `Copy`, ni el valor de referencia. `restricted` no es ninguna de las tres
cosas — es una condición de acceso del catálogo, del mismo tipo que "edad recomendada",
y para el visitante es información de venta: hay sets que se ganan.

### 4. El dominio calcula la fecha; la interfaz la escribe

`restrictedAvailableFrom(startedAt, minMonths)` devuelve un `Date`, no una frase. El
formato —"14 de marzo de 2027"— es de la capa que pinta, que ya tiene sus
`Intl.DateTimeFormat`. El veredicto de elegibilidad lleva el dato estructurado, así que
el mismo cálculo sirve para la ficha, para la API y para cualquier consumidor futuro
sin volver a derivarlo.

### 5. La fecha es la **inversa exacta** de `monthsBetween`, y hay que probarlo

No basta con "sumar meses": la fecha correcta es el **primer instante** en que
`monthsBetween(startedAt, fecha) >= minMonths`. Con un alta el **31 de enero** y 3
meses, el 30 de abril todavía no cumple —el día 30 es menor que el 31, así que el mes
no está completo— y el primer instante bueno es el **1 de mayo**.

**La implementación ingenua no vale, y lo demostró el test, no la lectura.** El barrido
—365 fechas de alta por cuatro umbrales, comprobando que la fecha cumple y que un
milisegundo antes no— tumbó dos versiones antes de la buena:

1. **Sumar meses y dejar que la fecha desborde** llega tarde cuando el día no existe en
   el mes de destino. Alta el 30 de enero, un mes: el 30 de febrero no existe, la suma
   cae en el 2 de marzo, y `monthsBetween` ya da el mes por completo el **1 de marzo**.
   Cuando el día no cabe, la respuesta es el día 1 del mes siguiente.
2. **Conservar la hora del alta** hace esperar medio día de más: `monthsBetween` compara
   año, mes y día e ignora la hora, así que quien se suscribió a mediodía cumple a las
   00:00 de ese día.

La propiedad que fija el test —y no el algoritmo— es lo que sobrevive a un cambio de
implementación en cualquiera de las dos funciones.

## Risks / Trade-offs

- **La fecha se mueve si cancela.** Al volver a contratar, la antigüedad empieza de
  cero (`subscriptions` → "Contratar un plan sin suscripción vigente"). Se calcula al
  pintar, así que nunca miente; pero el texto no debe sonar a promesa contractual.
  Pausar **no** la mueve: `startedAt` no cambia.
- **El admin puede cambiar el umbral** en cualquier momento y con él todas las fechas.
  Es la misma condición que ya tienen la ventana de confirmación y la cadencia de
  recordatorios, y se resuelve igual: leyendo el ajuste al pintar, nunca copiándolo.
- **La rejilla pasa a leer un ajuste** para poder decir "a partir de 3 meses". Es una
  lectura más por página; la alternativa —un texto genérico sin número— dice menos.
