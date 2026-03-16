### HU-013: Ver Contador Regresivo para Mensaje Temporizado

**Como** usuario receptor de un mensaje con condición temporal,
**quiero** ver un contador regresivo visual actualizado en tiempo real,
**para que** sepa exactamente cuánto tiempo falta para que pueda desbloquear el mensaje.

#### Criterios de Aceptación

- [ ] El sistema debe mostrar contador regresivo para mensajes con condición TIME
- [ ] El contador debe mostrar el tiempo restante en formato legible:
  - Si > 1 día: "2 días, 3 horas"
  - Si < 1 día: "3 horas, 15 minutos"
  - Si < 1 hora: "15 minutos, 30 segundos"
  - Si < 1 minuto: "30 segundos"
- [ ] El contador debe actualizarse automáticamente cada segundo
- [ ] El contador debe usar animación suave en cada actualización
- [ ] El sistema debe mostrar la fecha exacta además del countdown: "Disponible el 31/12/2025 a las 20:00"
- [ ] El sistema debe incluir icono de reloj animado (⏱️)
- [ ] Cuando el countdown llegue a 0:
  - Cambiar estilo visual a "disponible" (verde)
  - Mostrar "🔓 ¡Ya puedes desbloquear este mensaje!"
  - Habilitar botón "Desbloquear ahora"
  - Reproducir animación llamativa para llamar la atención
  - (Opcional) Enviar notificación push si la app está en segundo plano
- [ ] El countdown debe calcularse localmente en el cliente (no hacer peticiones constantes)
- [ ] El sistema debe manejar cambios de zona horaria correctamente
- [ ] El countdown debe pausarse si la app pasa a segundo plano (optimización de batería)
- [ ] El countdown debe ser accesible para lectores de pantalla
- [ ] El renderizado del countdown no debe causar lag o jank (60fps)

#### Notas Adicionales

- El cálculo del tiempo restante se hace en el cliente usando JavaScript Date
- El backend envía available_from en formato ISO 8601 UTC
- La UI convierte a zona horaria local del usuario
- Usar `requestAnimationFrame` o `setInterval` optimizado para actualizaciones
- Considerar library de countdown (react-countdown, etc.) para evitar reinventar rueda
- El countdown debe funcionar correctamente incluso si el usuario cambia la hora del sistema
- Para mensajes que se desbloquean mientras la app está cerrada, mostrar "Disponible ahora" al reabrir

#### Historias de Usuario Relacionadas

- HU-007: Enviar mensaje temporal (crea el mensaje con available_from)
- HU-012: Ver previsualización bloqueada (el countdown es parte del preview)
- HU-009: Intentar desbloquear (siguiente paso cuando countdown llega a 0)

#### Detalle Técnico

**Componente React:**
```typescript
function Countdown({ availableFrom }: { availableFrom: string }) {
  const [timeRemaining, setTimeRemaining] = useState<Duration | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const target = new Date(availableFrom).getTime();
      const remaining = target - now;
      
      if (remaining <= 0) {
        setIsAvailable(true);
        clearInterval(interval);
      } else {
        setTimeRemaining(calculateDuration(remaining));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [availableFrom]);
  
  if (isAvailable) {
    return <UnlockNowButton animated />;
  }
  
  return (
    <div className="countdown-container">
      <ClockIcon animated />
      <span className="countdown-text">
        {formatDuration(timeRemaining)}
      </span>
      <span className="exact-date">
        Disponible el {formatDate(availableFrom)}
      </span>
    </div>
  );
}
```

**Formateo de Duración:**
```typescript
function formatDuration(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
```

**Estilos CSS (animaciones):**
```css
@keyframes countdown-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.countdown-text {
  font-size: 24px;
  font-weight: bold;
  animation: countdown-pulse 2s infinite;
  color: #667eea;
}

.unlock-now-button {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  animation: attention-pulse 1s infinite;
}

@keyframes attention-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(56, 239, 125, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(56, 239, 125, 0); }
}
```

**Accesibilidad:**
```html
<div 
  role="timer" 
  aria-live="polite"
  aria-label={`Mensaje se desbloqueará en ${formatDuration(remaining)}`}
>
  {countdownUI}
</div>
```

**Tests:**
- **Unitarios (Frontend)**:
  - Cálculo correcto de tiempo restante
  - Formateo correcto según rangos (días/horas/minutos/segundos)
  - Detección correcta cuando countdown llega a 0
- **Integración**:
  - Actualización cada segundo
  - Limpieza de interval al desmontar componente
  - Cambio de estado a "disponible" al llegar a 0
- **E2E**:
  - Visualización de countdown en mensaje TIME
  - Countdown actualizado en tiempo real
  - Transición a "Ya puedes desbloquear" cuando llega a 0
  - Habilitación de botón "Desbloquear" al llegar a 0

**Optimizaciones:**
- Usar `requestAnimationFrame` en lugar de `setInterval` para mejor performance
- Pausar countdown cuando tab/app no está visible (Page Visibility API)
- Batch updates para evitar re-renders innecesarios
- Considerar Web Workers para cálculos pesados (probablemente overkill)

**Prioridad:** P1 - Medium (Sprint 4)
**Estimación:** 3 Story Points
**Caso de Uso Relacionado:** Parte de UC-007 (Enviar Mensaje Temporal) y UC-012 (Ver Previsualización)

