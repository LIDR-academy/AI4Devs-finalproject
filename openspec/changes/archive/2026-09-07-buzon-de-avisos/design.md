## Context

Ver `proposal.md` — Why. La capability `notifications` cubre la **emisión** de avisos y
guarda silencio sobre el buzón donde se leen, aunque el buzón existe desde que se
construyó el portal. Este change no añade comportamiento: pone por escrito el que hay,
que es lo que permite que romperlo sea romper una spec.

## Goals / Non-Goals

**Goals:**

- Fijar las reglas que protegen el buzón de terceros y las que definen qué significa
  "todos".
- Dejar registrada la asimetría entre marcar uno y marcar todos, que hasta ahora solo
  vivía en un comentario del código.

**Non-Goals:**

- **Cambiar comportamiento.** Si algo de lo escrito no coincidiera con lo implementado,
  sería un fallo a corregir, no una spec a relajar.
- **Borrar o archivar avisos.** Hoy solo se marcan como leídos. Un buzón que crece sin
  límite es una deuda conocida, pero inventar aquí una papelera sería spec sin uso.
- **Preferencias de aviso** (elegir qué avisos recibir, o recibirlos por correo). Está
  fuera del MVP y no depende del buzón.

## Decisions

### 1. La identidad del dueño no viaja en la petición

Ni para listar, ni para contar, ni para marcar. El `userId` se resuelve desde la sesión
y entra en la consulta —en el `WHERE`, no en un `if` previo—, de modo que "marcar el
aviso de otro" no es una operación rechazada: es una operación que **no se puede
expresar**. La spec lo pide así y no solo "que se compruebe el propietario", porque una
comprobación es algo que se puede olvidar en el endpoint siguiente.

### 2. Marcar uno y marcar todos responden distinto al "no había nada", y está bien

Marcar un aviso concreto que ya estaba leído se rechaza; vaciar un buzón que ya estaba
vacío, no. No es una incoherencia: son dos peticiones con forma distinta. La primera
**señala una fila** y espera que exista y esté pendiente; la segunda pide un **estado
final** —"sin pendientes"— y ese estado se cumple igual si ya se cumplía.

La consecuencia práctica es la que importa: el botón de "marcar todos" nunca produce un
error por llegar tarde, aunque otra pestaña se haya adelantado.

### 3. Los tres rechazos del marcado individual son indistinguibles

No existe, no es tuyo y ya estaba leído responden lo mismo. Distinguirlos convertiría el
endpoint en una forma de averiguar qué identificadores de aviso existen y de quién son.
Es el mismo criterio que ya rige en el login y en el enlace de restablecimiento.

### 4. "Todos" no puede significar "los que se ven"

La lista está paginada. Si "marcar todos" recorriera lo que la pantalla enseña, alguien
con sesenta avisos pulsaría, vería el buzón seguir con pendientes y no entendería por
qué. La spec fija el significado —todos los del usuario— y la interfaz se ajusta a él
diciendo **cuántos** va a marcar, en vez de al revés.
