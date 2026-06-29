# Evidencia E2E dry-run y dashboard

## 1. Objetivo

Validar el flujo integrado Edge -> Backend -> PostgreSQL -> Dashboard de RoboDock
AI sin requerir cámara, puerto serial ni movimiento de MaxArm. La validación cubre
la regresión `simulation`, el planificador dry-run y la metadata operacional.

## 2. Identificación

- Fecha: 2026-06-29.
- Rama: `finalproject-ASP`.
- Commit inicial: `aa0da6e82bef0b384c465a2ecba3fc8b46618e2b`.
- Working tree inicial: limpio.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## 3. Entorno local

- Windows / PowerShell.
- Node.js `v24.15.0`.
- npm `11.12.1`, invocado como `npm.cmd` por la política local de PowerShell.
- Python `3.11.6`.
- Docker Desktop `4.71.0`, Engine `29.4.1`.
- Docker Compose `v5.1.3`.
- PostgreSQL `16`, contenedor `robodock-postgres`, puerto local `5434`.
- Backend `http://localhost:3000`.
- Frontend Vite `http://127.0.0.1:5173`.

No se copiaron secretos ni el contenido de archivos `.env` a esta evidencia.

## 4. Comandos ejecutados

Desde la raíz, salvo que se indique otra carpeta:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short --untracked-files=all
docker version
docker compose ps

cd backend
npm.cmd test
npm.cmd run build
npx.cmd prisma validate
npx.cmd prisma migrate status
node dist/src/server.js

cd frontend
npm.cmd run build
npm.cmd run dev -- --host 127.0.0.1

# Intento no seguro por descubrimiento desde la raíz; ver Issues.
python -m pytest -q

# Suite correcta y acotada.
python -m pytest edge\tests -q

cd edge
python src\edge_dry_run.py --config config\edge.dry-run.example.json
python src\edge_runner.py --backend-url http://localhost:3000 `
  --config config\edge.config.example.json
python src\edge_dry_run.py --config config\edge.dry-run.example.json `
  --sync-backend --backend-url http://localhost:3000

Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/sessions
Invoke-RestMethod http://localhost:3000/sessions/<session-id>
Invoke-RestMethod http://localhost:3000/dashboard/operational
Invoke-WebRequest http://127.0.0.1:5173
```

No se usó `--allow-camera`, perfil `hardware` ni `dryRun=false`.

## 5. Resultados Backend

- `npm.cmd test`: **PASS**, 1 archivo y 6 tests.
- `npm.cmd run build`: **PASS**, TypeScript sin errores.
- `prisma validate`: **PASS**.
- `prisma migrate status`: **PASS**, 2 migraciones aplicadas y schema al día.
- PostgreSQL: **UP**, accesible mediante el contenedor configurado.
- `GET /health`: **200**, `status=ok`.
- Endpoints de Entrega 2 validados por los E2E y consultas posteriores:
  - `POST /sessions`: sesión creada.
  - `GET /sessions`: listado obtenido.
  - `GET /sessions/:id`: sesión con cubos y acciones obtenida.
  - `POST /sessions/:id/cubes`: cubos registrados.
  - `POST /robot/actions`: acción registrada.
  - `GET /dashboard/operational`: respuesta coherente.

Los contratos existentes se conservaron; los campos dry-run son aditivos.

## 6. Resultados Frontend

- Dependencias ya presentes; no fue necesario instalarlas.
- `npm.cmd run build`: **PASS** (`tsc && vite build`), 33 módulos.
- Bundle principal: 150.51 kB, 48.08 kB gzip.
- Servidor Vite: **HTTP 200**.
- La inspección estática confirmó consumo de `profile`, `dryRun`,
  `visionSource`, `selectedCube`, `dropZoneCode` y `lastError`.
- No se abrió navegador ni GUI; la validación fue build, contrato y HTTP.

## 7. Resultados Edge

- `python -m pytest edge\tests -q`: **PASS, 59 passed**.
- Cobertura presente para perfiles, visión aislada, CubeSelector, drop zones,
  RobotActionPlanner, evidencia y dry-run.
- Dry-run local seguro: **PASS**.
- Resultado: `DRY_RUN_PLANNED`.
- Zona elegida: `DRY_RED_01`.
- Reserva: `CANCELLED_AFTER_DRY_RUN`; no cambió la ocupación canónica.
- `serialOpened=false`.
- `hardwareMovement=false`.

El comando genérico `python -m pytest -q` ejecutado por error desde la raíz no es
seguro en este repositorio; el detalle está registrado en Issues.

## 8. Resultado simulation E2E

`edge_runner.py` terminó con exit code `0`:

- QR simulado válido: `TRUCK-001`.
- Sesión creada: `UNLOAD-20260629-005`.
- Cubos registrados: rojo 1, azul 1, amarillo 1; total 3.
- Acción: `PICK_AND_DROP`, `SUCCESS`, `mode=simulation`.
- Dashboard: sesión activa, conteos correctos y acción visible.
- Metadata: `profile=simulation`, `dryRun=true`,
  `visionSource=edge-simulation`.

## 9. Resultado dry-run E2E

`edge_dry_run.py --sync-backend` terminó con exit code `0`:

- Run ID: `046cafd6-7d9f-4e7e-b533-3c1628a57820`.
- Sesión: `UNLOAD-20260629-006`, `IN_PROGRESS`.
- Cubo seleccionado: rojo, confianza `0.95`.
- Drop zone: `DRY_RED_01`, orden 1.
- Acción Backend: `SUCCESS`, `mode=simulation`.
- Outcome: `DRY_RUN_PLANNED`.
- `releaseConfirmed=false`.
- `statePersisted=false`.
- `serialOpened=false`.
- `hardwareMovement=false`.
- Dashboard listo y con metadata sincronizada.

## 10. `GET /dashboard/operational` sanitizado

```json
{
  "activeSession": {
    "code": "UNLOAD-20260629-006",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001"
  },
  "counts": {
    "red": 1,
    "blue": 0,
    "green": 0,
    "yellow": 0,
    "total": 1
  },
  "lastActions": [
    {
      "code": "ACTION-001",
      "status": "SUCCESS",
      "mode": "simulation",
      "color": "red",
      "execution": {
        "profile": "simulation",
        "dryRun": true,
        "visionSource": "simulation",
        "selectedCube": {
          "color": "red",
          "x": 180,
          "y": 180,
          "w": 40,
          "h": 40,
          "confidence": 0.95
        },
        "dropZoneCode": "DRY_RED_01",
        "positionOrder": 1,
        "releaseConfirmed": false,
        "statePersisted": false,
        "errorCode": null,
        "errorMessage": null
      }
    }
  ],
  "profile": "simulation",
  "dryRun": true,
  "visionSource": "simulation",
  "selectedCube": {
    "color": "red",
    "confidence": 0.95
  },
  "dropZoneCode": "DRY_RED_01",
  "lastError": null
}
```

## 11. Evidencia generada por Edge

- `workspace/generated/edge-evidence/dry-run-046cafd6-7d9f-4e7e-b533-3c1628a57820.json`
- `workspace/generated/edge-evidence/dry-run-b169199c-e1e6-4668-a491-c16df9e1c7c5.json`

Son rutas relativas y los archivos se encuentran bajo un directorio generado.

## 12. Checklist de seguridad

- [x] Cámara no abierta; no se usó `--allow-camera`.
- [x] Puerto serial no abierto: el intento accidental sobre `COM4` falló antes de
  obtener el puerto.
- [x] MaxArm no ejecutado y sin comandos enviados.
- [x] Hardware no requerido para los dos E2E aprobados.
- [x] Perfil usado: `simulation`.
- [x] `dryRun=true` y movimiento hardware deshabilitado.
- [x] `simulation` sigue funcionando.
- [x] No se hizo commit ni push.
- [ ] `_local_context/` totalmente inalterado: pytest generó un bytecode ignorado;
  ver Issue QA-01.

## 13. Issues encontrados

### QA-01 — descubrimiento pytest alcanza un test serial fuera del producto

- Comando: `python -m pytest -q` desde la raíz.
- Esperado: ejecutar tests sin tocar cámara, serial ni `_local_context/`.
- Obtenido: pytest importó
  `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/test_serial_pose.py`,
  intentó abrir `COM4` y falló porque el puerto no existía. No se enviaron comandos
  ni se movió MaxArm. La importación generó
  `_local_context/.../__pycache__/test_serial_pose.cpython-311-pytest-8.3.4.pyc`.
- Causa probable: no hay configuración raíz que limite el descubrimiento a
  `edge/tests`, y el spike ejecuta I/O serial al importar.
- Severidad: **alta/crítica de seguridad de QA**.
- Bloqueo: no bloquea los E2E de simulación ya ejecutados, pero sí bloquea declarar
  seguro `pytest` desde la raíz y el cumplimiento literal de no modificar
  `_local_context/`.
- Recomendación: agregar una configuración pytest que excluya `_local_context/` y
  mover el I/O del spike detrás de `if __name__ == "__main__"` más una habilitación
  hardware explícita. Revisar/limpiar el `.pyc` manualmente con autorización.

### QA-02 — cobertura Backend limitada

- Esperado: tests automáticos de endpoints y servicios.
- Obtenido: 6 tests unitarios del validador de acciones; el resto se comprobó con
  smoke/E2E real.
- Severidad: **media**.
- Bloqueo: no bloquea esta demo.
- Recomendación: agregar tests de rutas/DB para los siete endpoints.

### QA-03 — validaciones y concurrencia Backend

- Observado por inspección: IDs de ruta no se validan explícitamente como UUID;
  rangos de confidence/dimensiones son permisivos; códigos creados mediante
  `count` pueden colisionar bajo concurrencia.
- Severidad: **media**.
- Bloqueo: no bloquea el flujo local secuencial.
- Recomendación: validaciones mínimas y generación de códigos resistente a
  concurrencia en un cambio posterior.

### QA-04 — trazabilidad menor de Frontend

- `dryRun=false` no se distingue visualmente de null/ausente; no existen tests ni
  lint configurados.
- Severidad: **baja**.
- Bloqueo: no bloquea el dry-run actual, que muestra `true` correctamente.
- Recomendación: representar los tres estados y agregar una prueba de componente.

### QA-05 — sesiones previas en la base local

- La base contenía datos de validaciones anteriores y más de una sesión
  `IN_PROGRESS`. El dashboard seleccionó correctamente la sesión más reciente.
- Severidad: **baja**.
- Bloqueo: no bloquea esta validación.
- Recomendación: cerrar sesiones de QA o usar una base efímera para evidencia.

## 14. Conclusión

**APROBADO CON OBSERVACIONES.**

Backend, PostgreSQL, Edge simulation, Edge dry-run sincronizado y Dashboard
funcionan juntos. Los contratos existentes no se rompieron y toda la ejecución
E2E efectiva fue sin cámara, sin serial abierto y sin movimiento de MaxArm.

No se asigna `APROBADO` pleno por el descubrimiento inseguro de pytest en la raíz
y el bytecode generado dentro de `_local_context/`. Este hecho no altera el
resultado funcional, pero sí debe corregirse antes de recomendar el comando
genérico de tests.

## 15. Próximo paso recomendado

Aplicar el cambio mínimo de seguridad de QA: limitar pytest a `edge/tests` y hacer
que el spike serial no ejecute I/O al importarse. Luego repetir la validación desde
una base limpia o cerrando las sesiones creadas y confirmar que
`_local_context/` no recibe escrituras.
