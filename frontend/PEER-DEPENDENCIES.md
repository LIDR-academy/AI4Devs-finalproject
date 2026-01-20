# Resolución de Conflictos de Peer Dependencies

## ⚠️ Warning: Conflicto de Versiones de Three.js

Si ves warnings como:
```
npm warn Could not resolve dependency:
npm warn peer three@">= 0.159.0" from @monogrid/gainmap-js@3.4.0
npm warn Found: three@0.158.0
```

## ✅ Solución Aplicada

Se ha actualizado `three` de `^0.158.0` a `^0.159.0` en el `package.json` para cumplir con los requisitos de `@react-three/drei`.

## 🔄 Para Aplicar el Cambio

1. **Eliminar node_modules y package-lock.json** (opcional pero recomendado):
```bash
cd frontend
rm -rf node_modules package-lock.json
```

2. **Reinstalar dependencias**:
```bash
npm install
```

Esto instalará `three@^0.159.0` o superior, resolviendo el conflicto.

## 📝 Nota

Los warnings de peer dependencies son comunes y generalmente no impiden que el proyecto funcione. Sin embargo, es mejor resolverlos para evitar problemas futuros.

Si prefieres mantener `three@0.158.0`, puedes usar `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

Pero la solución recomendada es actualizar `three` a `^0.159.0` como se ha hecho.
