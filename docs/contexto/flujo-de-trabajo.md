# Flujo de trabajo

## Antes de empezar

1. Estas en la rama `dev`? (`git branch --show-current`)
2. El servidor local funciona? (backen `uvicorn`, frontend `yarn start`)
3. Has leido `CLAUDE.md` para contexto actualizado?

## Hacer un cambio

### Backend
1. Identifica el router afectado en `backend/routers/`
2. Si es nuevo endpoint: anade ruta al router existente o crea nuevo archivo
3. Registra el router en `server.py` si es nuevo (`api_router.include_router(...)`)
4. Si necesitas nuevo modelo Pydantic: anadelo en `models.py`
5. Si el cambio afecta autenticacion: usa `require_auth` o `get_current_user` de `auth.py`
6. Para cambios en BD: anade migracion idempotente en `server.py` > `startup()`
7. Ejecuta tests relacionados: `cd backend && pytest tests/test_<feature>.py -v`

### Frontend
1. Identifica la pagina en `src/pages/` o el componente en `src/components/`
2. Si necesitas texto nuevo en UI: anade clave i18n en `src/i18n/translations.js` en los 6 idiomas
3. Usa `useI18n().t("clave")` para todo texto visible
4. Si el cambio es un componente reutilizable: va en `src/components/` (raiz o `ui/`)
5. Si es un panel del editor: va en `src/components/editor-panels/`
6. Anade `data-testid` a elementos interactivos
7. Verifica que no uses `rounded-none` en componentes nuevos si aplica el nuevo estilo moderno
8. Ejecuta build de prueba: `cd frontend && yarn build`

### Ambos (full-stack)
1. Asegurate de que el frontend y backend usan los mismos nombres de campo en JSON
2. Si el cambio requiere nueva variable de entorno: documentala en `.env` de backend

## Checklist de "terminado"

- [ ] El codigo compila/build sin errores (`yarn build` sin fallos)
- [ ] Los tests pasan (`pytest -v` todo verde)
- [ ] No hay regresiones visuales obvias (revisa en `localhost:3000`)
- [ ] Los textos nuevos tienen traduccion en los 6 idiomas
- [ ] Los elementos interactivos tienen `data-testid`
- [ ] No introduciste `rounded-none` si es UI nueva (estilo moderno)
- [ ] Las migraciones de BD son idempotentes (no fallan si ya se ejecutaron)
- [ ] Probaste en el servidor real si el cambio es critico
- [ ] El commit usa formato Conventional Commits (`feat:`, `fix:`, etc.)

## Commit y push

```bash
git add <archivos especificos>   # NUNCA git add -A
git commit -m "feat: descripcion corta"
git push origin dev
```

**NUNCA:**
- `git push --force`
- `git commit --amend` (si ya hiciste push)
- Commit directo a `main`
- `git add -A` (puede incluir .env, credenciales)

## Deploy al servidor

```bash
# Desde Git Bash en Windows:
plink -pw "<password>" -no-antispoof ubuntu@37.187.159.167 \
  "cd /opt/bpmn-modeler && echo '<password>' | sudo -S bash ./update.sh 2>&1"
```

El script `update.sh`:
1. Hace `git pull origin dev`
2. Instala nuevas dependencias si `requirements.txt` cambio
3. Ejecuta `yarn build` del frontend (~30s)
4. Reinicia el backend via supervisor (`bpmn-backend`)
5. Recarga nginx
6. Tiempo total tipico: 30-60 segundos

**Verificar:** Accede a `https://sdd-ia.com` y comprueba que carga. Si hay 404 en health check al final del script, es normal (no hay endpoint en raiz).

## Rollback

Si algo falla en produccion:
```bash
# En el servidor:
cd /opt/bpmn-modeler
git log --oneline -5          # ver commits recientes
git revert <commit_malo>      # crea commit de reversion
sudo bash ./update.sh         # redespliega
```

## Ramas

```
main  -- estable (congelada, solo merges desde dev)
  dev  -- desarrollo activo (aqui se hace todo)
  2.0  -- [PENDIENTE: cual es el estado de esta rama?]
  version-1.0 -- historica, congelada
```

No se usan feature branches. Todo va directo a `dev`.
