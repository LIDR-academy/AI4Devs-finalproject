# MVP Requirements – MailTuner

## 🔍 Problema que resuelve

Muchas personas pierden tiempo intentando redactar correos con el tono adecuado (empático, profesional, persuasivo…).  
**MailTuner lo soluciona en 1 clic, reescribiendo automáticamente el mensaje en el tono deseado.**

---

## 🌐 Idioma de la app y mensajes

- El leguaje base de la app (UI y todos los mensajes de sistema, errores, etc)han de estar en inglés.

---

## ✅ Objetivo del MVP

Desplegar una app usable sin login que:
- Recibe un correo pegado por el usuario
- Permite seleccionar un tono predefinido
- Devuelve una versión mejorada del mismo mensaje
- Limita su uso diario para controlar costes

---

## 💡 Modelo de negocio inicial (Freemium)

| Plan     | Límite de uso       | Precio |
|----------|---------------------|--------|
| Gratis   | 10 mejoras/día por IP | 0 €    |
| Pro (futuro) | 100/día o ilimitado | ~5 €/mes |

---

## 🔧 Alcance funcional del MVP

- Campo de texto multilinea (máx. 2.000 caracteres)
- Selector de tono entre 4 opciones:  
  `claro`, `formal`, `empático`, `persuasivo`
- Botón “Mejorar” → reescritura vía OpenAI (`gpt-4o`)
- Resultado editable + botón “Copiar”
- Regenerar el resultado (consume crédito)
- Mensajes de sistema:
  - “Correo mejorado con éxito”
  - “Has alcanzado el límite diario”
  - “Error al procesar tu correo”
- Contador de usos restantes visible (ej: “Te quedan 7 mejoras hoy”)
- Rate limit sin login:
  - Por IP (con Upstash Redis)
  - Posible cookie para reforzar
- Compatible con móvil desde el MVP

---

## 🧠 Fuera de alcance en este MVP

- Registro de usuarios o login
- Historial de correos generados
- Multilenguaje
- Planes de pago activos (solo previsto)
- Personalización del tono
- Interfaz avanzada o multi-step
- Métricas internas (visibles solo por equipo)

---

## 🔐 Privacidad y datos

- No se guarda texto del usuario
- No se requiere registro
- Se incluye aviso legal y política de privacidad mínima

---

## ✅ Criterios de éxito del MVP

| Métrica                      | Objetivo mínimo     |
|-----------------------------|---------------------|
| Correos mejorados           | 300 en la semana 1  |
| Duración media de sesión    | +1 minuto           |
| Feedbacks enviados          | 20                  |
| Tasa de rebote              | < 50 %              |
| Usuarios que vuelven (7 días) | > 15 %            |

---

## ❓Decisiones validadas por PO + Socio

- ✅ El resultado aparece debajo del input, no lo reemplaza
- ❌ No se carga ejemplo por defecto (solo placeholder)
- ✅ Se puede regenerar, descontando intento
- ✅ Contador de uso diario visible, pero no tokens ni caracteres
- ✅ Máx. 2.000 caracteres por mejora
- ✅ Uso controlado por IP + cookie
- ✅ Interfaz adaptada a móvil desde el MVP

---

## 📌 Pendientes (marcados para futuras versiones)

- Sistema de cuentas
- Pagos integrados
- Panel de métricas internas
- Personalización avanzada
- Traducción automática
