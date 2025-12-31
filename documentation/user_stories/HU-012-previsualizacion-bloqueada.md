### HU-012: Ver Previsualización Difuminada de Mensaje Bloqueado

**Como** usuario receptor de un mensaje condicionado,
**quiero** ver una representación visual atractiva del mensaje bloqueado sin revelar su contenido,
**para que** sienta curiosidad y anticipación motivándome a cumplir las condiciones de desbloqueo.

#### Criterios de Aceptación

- [ ] El sistema debe renderizar mensajes CONDITIONAL PENDING con estilo visual distintivo:
  - Icono de candado prominente (🔒)
  - Fondo con gradiente suave diferente al mensaje normal
  - Borde especial que indique "bloqueado"
  - Animación sutil que llame la atención
- [ ] El sistema debe mostrar el tipo de condición sin revelar el contenido:
  - TIME: "🔒 Bloqueado hasta DD/MM/YYYY HH:MM" + contador regresivo
  - PASSWORD: "🔒 Protegido con contraseña (X intentos restantes)"
  - QUIZ: "❓ Responde la pregunta para desbloquear"
- [ ] Para mensajes con multimedia bloqueado:
  - Mostrar thumbnail con efecto blur pesado (radius 20px)
  - Superponer icono del tipo de medio (🖼️ imagen, 🎥 video, 🎵 audio)
  - Mostrar tamaño del archivo: "Imagen • 2.3 MB"
  - NO cargar el archivo completo (solo thumbnail blur)
- [ ] Para mensajes con texto bloqueado:
  - Mostrar placeholder genérico o primera palabra difuminada
  - NO revelar palabras del contenido real
- [ ] El sistema debe mostrar botón "Desbloquear" o "Ver detalles"
- [ ] El botón debe estar:
  - Habilitado y destacado si la condición puede cumplirse (ej: TIME llegó)
  - Deshabilitado si aún no puede desbloquearse (ej: TIME no llegó)
- [ ] Para condición TIME con contador regresivo:
  - Actualizar el countdown cada segundo en tiempo real
  - Mostrar: "2 días, 3 horas, 15 minutos"
  - Cuando llegue el momento, cambiar a "🔓 ¡Ya puedes desbloquear!"
- [ ] El sistema NO debe exponer el contenido real en la respuesta JSON
- [ ] El emisor siempre debe ver el contenido completo (sin preview)
- [ ] El preview debe renderizarse inmediatamente (< 100ms)
- [ ] El preview debe verse bien en modo claro y modo oscuro

#### Notas Adicionales

- El objetivo es generar curiosidad, no frustración
- Usar iconografía intuitiva y consistente
- Aplicar blur en el cliente (CSS/React Native), no procesar en backend
- Las animaciones deben ser sutiles, no molestas
- Considerar accesibilidad: lectores de pantalla deben describir el estado
- El preview no debe consumir recursos innecesarios (lazy loading)
- Transiciones suaves entre estados (bloqueado → disponible → desbloqueado)

#### Historias de Usuario Relacionadas

- HU-006: Ver timeline de mensajes (donde se muestran los previews)
- HU-007: Enviar mensaje temporal (el receptor ve countdown)
- HU-008: Enviar mensaje con contraseña (el receptor ve indicador de PIN)
- HU-009: Intentar desbloquear (siguiente paso tras ver preview)

#### Detalle Técnico

**Módulos (Frontend):**
- Componentes React: `<LockedMessagePreview />`, `<Countdown />`, `<BlurredThumbnail />`
- Estilos CSS para blur, gradientes y animaciones

**Response API (ejemplo de mensaje bloqueado):**
```json
{
  "messageId": "uuid-...",
  "sender": {...},
  "contentType": "IMAGE",
  "visibilityType": "CONDITIONAL",
  "status": "PENDING",
  "preview": {
    "type": "LOCKED",
    "conditionType": "TIME",
    "availableFrom": "2025-12-31T20:00:00Z",
    "timeRemaining": "2d 3h 15m",
    "hasMedia": true,
    "mediaType": "IMAGE",
    "thumbnailBlurUrl": "https://s3.../blur-thumb.jpg"
  },
  "createdAt": "2025-01-20T10:00:00Z"
}
```

**Estilos CSS (ejemplo de blur):**
```css
.locked-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  position: relative;
}

.blurred-thumbnail {
  filter: blur(20px);
  opacity: 0.7;
}

.lock-icon {
  font-size: 48px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}
```

**Lógica de Countdown (React):**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    const target = new Date(availableFrom).getTime();
    const remaining = target - now;
    
    if (remaining <= 0) {
      setCanUnlock(true);
      clearInterval(interval);
    } else {
      setTimeRemaining(formatDuration(remaining));
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [availableFrom]);
```

**Validaciones (Backend):**
- NO incluir content_text ni mediaUrl en la respuesta si status='PENDING'
- Solo enviar metadatos: conditionType, availableFrom, attemptsLeft
- El thumbnail blur debe ser versión procesada (no URL original)

**Tests:**
- **Unitarios (Frontend)**:
  - Renderizado correcto según tipo de condición
  - Cálculo correcto de tiempo restante (countdown)
  - Aplicación de blur CSS
- **Integración**:
  - Construcción correcta de preview DTO en backend
  - No exposición de contenido en JSON
- **E2E**:
  - Visualización de mensaje TIME con countdown
  - Visualización de mensaje PASSWORD con intentos
  - Cambio de estado cuando TIME llega (bloqueado → disponible)
  - Visualización de multimedia blur
  - Preview del emisor (ve contenido completo, no preview)

**Prioridad:** P1 - High (Sprint 4)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-012 - Ver Previsualización Bloqueada

