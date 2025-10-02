# Product Specifications – MailTuner (MVP)

## 🧭 Flujo funcional principal

1. El usuario entra a la web sin login
2. Pega un correo en el campo de entrada
3. Selecciona un tono de reescritura
4. Hace clic en “Mejorar mi correo”
5. Aparece una nueva versión del mensaje con el tono aplicado
6. El usuario puede:
   - Editar el resultado
   - Copiarlo
   - Regenerarlo (nuevo resultado)
7. Al alcanzar el límite de uso:
   - Se bloquea la acción
   - Aparece un mensaje informativo

---

## 📝 Elementos de la interfaz

### ✉️ Campo de entrada

- Tipo: `textarea` grande
- Placeholder: “Pega aquí tu email…”
- Límite visual: contador de caracteres (máx. 2000)
- Validación: no puede estar vacío

### 🎚️ Selector de tono

- Opciones:
  - Claro
  - Formal
  - Empático
  - Persuasivo
- Diseño: botones o dropdown (decisión de diseño)
- Uno debe estar siempre seleccionado

### 🔘 Botón principal

- Texto: “Mejorar mi correo”
- Estado desactivado si el campo está vacío o límite alcanzado
- Estado de carga mientras espera la respuesta

---

## ✨ Zona de resultado

- Muestra el correo reescrito
- Editable por el usuario
- Incluye:
  - Botón “Copiar”
  - Botón “Regenerar” (misma entrada, nuevo resultado)

---

## ⚠️ Estados y mensajes esperados

| Evento                          | Mensaje en pantalla                             |
|----------------------------------|--------------------------------------------------|
| Éxito                           | “Correo mejorado con éxito”                     |
| Error API                       | “Error al procesar tu correo. Inténtalo más tarde.” |
| Campo vacío                     | “Por favor, pega un correo para continuar.”     |
| Límite de uso alcanzado         | “Has alcanzado tu límite de mejoras gratuitas hoy.” |
| Regenerar sin créditos          | “No puedes regenerar más correos hoy.”          |
| Texto demasiado largo (>2000)   | “Has superado el límite de caracteres.”         |

---

## 🧮 Lógica visible para el usuario

- Contador de mejoras restantes:  
  Ejemplo: “Te quedan 3 mejoras gratis hoy.”
- Contador de caracteres:
  Ejemplo: “1478 / 2000”

---

## 🧑‍💻 Comportamiento adicional

- Al regenerar, se usa la misma entrada y tono actual
- Cada mejora o regeneración **consume un uso**
- El resultado se muestra **debajo** del input (nunca reemplaza el original)
- Al superar el límite diario:
  - Botón principal se desactiva
  - Se muestra un aviso
  - Puede incluir CTA para “Actualizar a Pro” (sin funcionalidad real en MVP)

---

## 📱 Responsivo

- La interfaz debe verse correctamente en móviles:
  - Layout adaptativo
  - Tamaños de fuente y botones accesibles
  - Preferencia por diseño vertical apilado

---

## 🎨 Paleta de colores

| Uso            | Color        | Hex      | Notas                                 |
|----------------|--------------|----------|----------------------------------------|
| Primario       | Índigo       | `#4F46E5` | Moderno, profesional, de confianza      |
| Secundario     | Cyan claro   | `#22D3EE` | Toque fresco, dinámico                 |
| Fondo claro    | Gris muy claro | `#F9FAFB` | Ligero, enfocado a claridad            |
| Texto oscuro   | Gris oscuro  | `#111827` | Legible, elegante                      |

---

## 🔤 Tipografía sugerida

### Fuente para el logo y marca:

- **Manrope**  
  Sans-serif moderna, redondeada, muy legible. Da un toque tech sin parecer robótica.

### Fuente para la interfaz del producto:

- **DM Sans**  
  Ambas son ligeras, amigables y bien renderizadas en todos los dispositivos.

---

## 🔐 Legal

- Debe incluir pie de página con:
  - Aviso legal
  - Política de privacidad
  - Aceptación de cookies (mínimo banner informativo)
