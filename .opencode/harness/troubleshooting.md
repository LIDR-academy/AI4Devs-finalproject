# Troubleshooting

Common errors and their fixes. If your error isn't here, check the issue tracker or open a new issue.

## Backend won't start

### "DATABASE_URL is not set"

`.env` is missing or not loaded. Verify:

```bash
ls -la .env  # exists?
cat .env | grep DATABASE_URL  # set?
```

If using VS Code, restart the terminal so the workspace trust loads `.env`.

### "Port 3001 already in use"

```bash
lsof -i :3001
# Kill the process or change PORT in .env
```

### "EADDRINUSE" on hot reload

The previous process didn't shut down cleanly. Kill all Node processes:

```bash
pkill -f "node.*backend"
# Or more specifically
kill $(lsof -t -i:3001)
```

### Prisma errors

#### "Environment variable not found: DATABASE_URL"

`backend/.env` is missing. Prisma reads from `./.env` in the `backend/` directory, not the root. Copy:

```bash
cp .env backend/.env
# Or symlink
ln -s ../.env backend/.env
```

#### "Migration failed to apply"

```bash
cd backend
npx prisma migrate reset  # DESTRUCTIVE in dev — wipes DB
npx prisma migrate deploy  # apply pending migrations
```

#### "Prisma client out of sync"

```bash
npx prisma generate
```

## OpenRouter errors

### "401 Unauthorized"

`OPENROUTER_API_KEY` is missing or invalid. Get a new one at https://openrouter.ai/keys.

### "429 Rate limit"

You've exceeded your OpenRouter tier. Wait or upgrade. In tests, set `MOCK_OPENROUTER=true`.

### "Model not found"

The `OPENROUTER_MODEL` is misspelled or deprecated. Check https://openrouter.ai/models.

### "Response is not valid JSON"

The LLM returned malformed output. The adapter retries 2 times. If still failing, the user is offered to paste the listing text manually (FR-002).

## Nominatim errors

### "403 Forbidden"

Nominatim blocks requests without a proper User-Agent. Verify `REALISTA_USER_AGENT=Realista/1.0 (analizador educativo)`.

### "Rate limit exceeded"

Nominatim allows max 1 request per second. The `GeocodingAdapter` includes a 1.1s delay between requests.

## Catastro errors

### "Connection refused"

The SEC is temporarily down. The adapter retries once, then returns `cadastro: null` and continues the listing analysis. The user sees a warning in the UI.

### "No data found for this address"

The address couldn't be matched to a cadastral reference. Common reasons:

- Address is in a new development not yet in the catastro
- Address is on a non-cadastral road
- Typos in the original listing

The UI shows "Verificación catastral no disponible" and the listing analysis continues.

## Frontend errors

### "Failed to fetch" in browser console

The backend is not running. Start it: `cd backend && npm run dev`.

### CORS error in browser console

`FRONTEND_URL` in backend `.env` doesn't match the actual frontend origin. Update to match.

### PWA not installing

- Ensure you're on HTTPS (or `localhost`)
- Check that `manifest.webmanifest` is being served
- Check browser DevTools → Application → Manifest for errors

### Service worker not updating

```bash
# In browser DevTools → Application → Service Workers → Update
# Or in code:
navigator.serviceWorker.getRegistration().then(reg => reg?.update());
```

## Test failures

### "Coverage threshold not met"

Domain coverage dropped below 80%. Check which file:

```bash
cd backend
npm run test:coverage
open coverage/index.html
```

Add tests to bring coverage back to threshold.

### "Port already in use" in tests

Tests should use a different port (e.g., 0 for random). Verify `vitest.config.ts` doesn't have a port conflict.

### "Database not available in tests"

Tests need a separate test database. Set `DATABASE_URL` in `.env.test`:

```
DATABASE_URL=postgresql://realista:realista@localhost:5432/realista_test?schema=public
```

Or use `MOCK_*` env vars to skip real DB calls.

## Git issues

### "fatal: not a git repository"

You're not in the repo root. `cd` to the directory with `.git/`.

### "Permission denied (publickey)" when pushing

SSH key not configured. Use HTTPS instead:

```bash
git remote set-url origin https://github.com/dmiguelm/AI4Devs-finalproject-DMM.git
```

### Merge conflicts

```bash
git status  # see conflicted files
# Edit each conflicted file
git add <file>
git commit
```

## Performance issues

### "Listing analysis takes more than 15 seconds"

Likely causes:

- Cheerio fetch is slow (portal throttling)
- LLM is slow (model latency)
- Catastro is slow

Check the response time breakdown in the logs. If consistently > 15s, consider:

- Caching LLM responses (with TTL) for repeat URLs
- Using a faster model in dev
- Adding the portal to the throttled list (FR-027)

### "Frontend loads slowly"

- Check the bundle size: `cd frontend && npm run build && du -sh .svelte-kit/output`
- Consider code splitting per route
- Verify the service worker is caching assets
