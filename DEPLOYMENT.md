# Guía de Despliegue - Lexio

**Proyecto:** Lexio — Diccionario personal inteligente de vocabulario en inglés  
**Stack:** Node.js + Express (backend) · React Native + Expo (mobile) · Firebase (auth + db)

---

## Setup Inicial Rápido (Desarrollo Local)

```bash
# 1. Clonar repositorio
git clone [url-repo]
cd AI4Devs-finalproject

# 2. Backend
cd backend
cp .env.example .env      # Completar con las 3 claves
npm install
npm run dev
# → "Lexio API running on port 3000"

# 3. Mobile (otra terminal)
cd mobile
npm install --legacy-peer-deps
# Completar app.json → extra con las 6 claves EXPO_PUBLIC_FIREBASE_*
npx expo start --clear
# Presionar "i" para simulador iOS
```

---

## Variables de Entorno

### Backend (`backend/.env`)
```bash
PORT=3000
NODE_ENV=development

# Service Account JSON en una sola línea:
# python3 -c "import json; print(json.dumps(json.load(open('service-account.json'))))"
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

ANTHROPIC_API_KEY=sk-ant-...
UNSPLASH_ACCESS_KEY=...
```

### Mobile (`mobile/app.json` → sección `extra`)
```json
"extra": {
  "EXPO_PUBLIC_API_URL": "http://localhost:3000",
  "EXPO_PUBLIC_FIREBASE_API_KEY": "...",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "lexio-dev-xxxxx.firebaseapp.com",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "lexio-dev-xxxxx",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET": "lexio-dev-xxxxx.appspot.com",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "...",
  "EXPO_PUBLIC_FIREBASE_APP_ID": "..."
}
```

> Para pruebas en **dispositivo físico**, cambiar `EXPO_PUBLIC_API_URL` por la IP local de la máquina: `http://192.168.x.x:3000`

---

## Firebase (primera vez)

```bash
# Desde la raíz del proyecto
npm install -g firebase-tools
firebase login
firebase init firestore   # seleccionar proyecto, NO sobreescribir archivos existentes
firebase deploy --only firestore
# → "Deploy complete!"
# Esperar 2-5 min a que los índices aparezcan en estado "Habilitado"
```

---

## Seed de datos (opcional)

```bash
cd backend
npm run seed
# Crea: usuario demo@lexio.app / demo1234 + 6 palabras + streak de 3 días
```

---

## Comandos Útiles

```bash
# Backend
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript → dist/
npm run test         # Ejecutar tests con Jest

# Mobile
npx expo start --clear    # Limpiar caché Metro y arrancar
npx expo start            # Arrancar normal
```

---

## Despliegue en Producción (opcional, post-MVP)

| Componente | Servicio sugerido | Notas |
|---|---|---|
| Backend | Railway / Render / Cloud Run | Variable `NODE_ENV=production` |
| Mobile | Expo EAS Build | `eas build --platform ios` |
| Base de datos | Firebase Firestore (Spark → Blaze) | Sin cambios de código |
| Auth | Firebase Authentication | Sin cambios de código |

Para producción, actualizar en mobile `EXPO_PUBLIC_API_URL` con la URL del backend desplegado.

---

## Checklist de Despliegue

- [ ] `FIREBASE_SERVICE_ACCOUNT` en una sola línea (sin saltos de línea)
- [ ] `ANTHROPIC_API_KEY` y `UNSPLASH_ACCESS_KEY` configuradas en backend
- [ ] 6 variables `EXPO_PUBLIC_FIREBASE_*` en `app.json`
- [ ] Reglas e índices Firestore desplegados (`firebase deploy --only firestore`)
- [ ] Índices en estado **Habilitado** antes de iniciar práctica
- [ ] Backend arranca sin errores (`Lexio API running on port 3000`)
- [ ] Login/registro funcional en la app
- [ ] Flujo E2E: Add Word → Practice → Results sin errores
