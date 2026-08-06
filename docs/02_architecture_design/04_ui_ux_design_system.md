# 🎨 RestoStock UI/UX Design System Specification

## 📝 Visión General y Estilo Visual
Basado en la referencia de tablero de control industrial de alta precisión (**Dark Petrol Analytics Dashboard**), el sistema de interfaz de **RestoStock** utiliza un tema oscuro elegante (*Dark Petrol & Charcoal*) con contraste acentuado en turquesa reluciente, amarillo miel y alertas tri-color para la gestión táctil e intuitiva del método FEFO en cocina.

---

## 🎨 Paleta Cromática Oficial (Tokens HSL & Variables CSS)

```css
:root {
  /* Fondo de Pantalla y Contenedores */
  --bg-root: hsl(205, 38%, 7%);           /* #0b1319 - Gris Carbón Petróleo Profundo */
  --bg-card: hsl(205, 38%, 10%);          /* #101c24 - Pizarra Petróleo */
  --border-card: hsl(205, 25%, 18%);      /* #192a36 - Línea divisoria sutil */

  /* Colores Primarios y Acentos */
  --color-primary: hsl(173, 100%, 33%);   /* #00a896 - Turquesa Petrol (Teal) */
  --color-primary-hover: hsl(173, 100%, 40%); /* #02c39a */
  --color-secondary: hsl(43, 89%, 60%);   /* #e9c46a - Amarillo Miel (Amber Accent) */

  /* Indicadores de Salud FEFO & Alertas (Gauge & Badges) */
  --color-danger: hsl(0, 100%, 58%);      /* #ff2a2a - Rojo Intenso (< 12h FEFO) */
  --color-warning: hsl(43, 89%, 60%);     /* #f4a261 - Amarillo Calidez (< 24h FEFO) */
  --color-success: hsl(173, 100%, 33%);   /* #00a896 - Verde Turquesa (Fresco / Óptimo) */

  /* Tipografía y Textos */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --text-primary: hsl(0, 0%, 98%);        /* #fafafa - Blanco Puro */
  --text-secondary: hsl(205, 15%, 70%);    /* #94a3b8 - Gris Azulado para subtextos y ejes */
}
```

---

## 📐 Estructura Visual de Tarjetas (Card Layout)

Inspirado exactamente en el tablero de referencia:

1. **Encabezado de Tarjeta (Card Header):**
   * Badge con ícono en contenedor circular turquesa (`--color-primary`) en el extremo izquierdo.
   * Título en fuente sans-serif blanca en `font-weight: 600` (semibold).
   * Línea divisoria horizontal sutil (`--border-card`) separando el encabezado del contenido.

2. **Tipos de Gráficos e Indicadores:**
   * **Gauge Chart (Indicador FEFO Dial):** Velocímetro semicircular con sectores Rojo (Crítico), Amarillo (Advertencia) y Verde Turquesa (Óptimo), aguja indicadora blanca y caja numérica inferior en blanco brillante.
   * **Donut Charts (Desglose de Remanentes):** Gráficos circulares de donut con agujero central oscuro etiquetado y conectores hacia valores numéricos (`K` / unidades).
   * **Bar Charts (Evolución de Mermas y Consumos):** Barras sólidas en verde turquesa sobre fondo oscuro con tipografía fina en ejes.

---

## 👆 Ergonomía Táctil y Accesibilidad (WCAG 2.1)

1. **Superficie Táctil Mínima (`.btn-touch`):**
   * Mínimo **48px de alto por 48px de ancho** con un margen de separación de al menos **8px**.
   * Para el teclado táctil de PIN (`auth`): botones circulares de **64px x 64px**.
2. **Accesibilidad WCAG 2.1 AA/AAA:**
   * Contraste de texto sobre fondo oscuro de al menos `7:1` para números principales y `4.5:1` para texto secundario.
3. **Manejo Obligatorio de 4 Estados de UI:**
   * **Data Ready:** Tarjetas renderizadas con contraste alto.
   * **Loading State:** Skeletons animados pulsantes sobre `--bg-card`.
   * **Empty State:** Ilustración minimalista turquesa con mensaje descriptivo ("No hay remanentes en riesgo").
   * **Error State:** Banner con borde rojo `--color-danger` y botón táctil de reintento.
