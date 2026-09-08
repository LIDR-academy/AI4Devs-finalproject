/**
 * Lectura de valores numéricos de un formulario **sin mentirle al servidor**.
 *
 * `Number("")` es `0` y `Number("abc")` es `NaN`, y ahí empieza el problema: al
 * serializar el cuerpo, `JSON.stringify` convierte `NaN` en **`null`**. Así, quien
 * dejaba el campo vacío mandaba un cero perfectamente válido, y quien escribía letras
 * mandaba lo mismo que quien no escribía nada. El servidor no podía responder otra
 * cosa que un genérico, porque no le llegaba con qué distinguirlos.
 *
 * Esta función conserva la diferencia, que es lo único que permite contestar con
 * sentido: vacío es `null` -"este dato es obligatorio"- y lo que no es un número viaja
 * **como el texto que se escribió** -"aquí va un número"-. La validación sigue siendo
 * del servidor; esto solo evita destruir el dato antes de que llegue.
 */
export function numericField(value: FormDataEntryValue | null | undefined): number | string | null {
  const text = String(value ?? "").trim();
  if (text === "") return null;

  const parsed = Number(text);
  // `Number.isFinite` y no `isNaN`: "Infinity" se parsea y no es un número que ningún
  // campo de este producto espere.
  return Number.isFinite(parsed) ? parsed : text;
}

/**
 * Igual que `numericField`, para campos **opcionales** donde el vacío tiene dos
 * lecturas distintas: al crear no se manda el campo (`undefined`), y al editar se
 * manda `null` para borrar el valor que hubiera.
 */
export function optionalNumericField(
  value: FormDataEntryValue | null | undefined,
  { editing }: { editing: boolean }
): number | string | null | undefined {
  const parsed = numericField(value);
  if (parsed !== null) return parsed;
  return editing ? null : undefined;
}
