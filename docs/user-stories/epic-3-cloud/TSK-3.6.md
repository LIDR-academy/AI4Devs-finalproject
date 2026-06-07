# TSK-3.6: Generador de Enlace de Pago Bizum y Plantilla de Mensajes

- **Historia de Usuario Relacionada:** [US-10: Códigos QR de Cobro Bizum Personalizados y Plantillas de Mensajes Dinámicos](US-10.md)
- **Épica:** Epic 3: Cloud Convenience & Connectivity Flow
- **Capa:** Backend e Integraciones (Serverless)
- **Complejidad:** 3 SP
- **Dependencias:** TSK-3.1

## 1. Descripción de la Tarea
Implementar el microservicio que genere el enlace de pago profundo de Bizum (`https://bizum.es/pagar?phone=X&amount=Y&concept=Z`) y el código QR correspondiente para facilitar el cobro en mesa, junto con la redacción del mensaje personalizado de WhatsApp.

## 2. Detalles de Implementación
1. **Servicio de Generación:**
   * Crear `functions/src/payment/bizumHandler.ts`.
   * Validar formato de teléfono de España (`+34` o 9 dígitos).
   * Generar la cadena QR utilizando una librería ligera en el backend (como `qrcode` en npm) y devolverla al frontend codificada en Base64.
2. **Textos Compartibles:**
   * Implementar generador de textos parametrizados en cliente (`src/utils/messageTemplates.ts`) escapando los caracteres de URL de manera adecuada para la API de WhatsApp Web/App.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/utils/messageTemplates.test.ts` que verifique que el texto se escape y construya correctamente:
  * Entrada: Juan, 15.30€, La Tagliatella.
  * Salida: *"¡Hola! Me debes 15.30€ de la cena en La Tagliatella..."* con la URL de pago codificada sin espacios.
* Validar que el código QR generado es legible por lectores de cámaras predeterminadas de iOS y Android.
