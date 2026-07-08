# Prompt-Run: narrative-templates

## Purpose

Predefined narrative templates for the **Mortgage Compass** output. Per **FR-013**, no LLM is used for the narratives — the output is computed from these templates based on the user's persona and the chosen scenario.

## Why templates (not LLM)

- **Predictable** — every user with profile X gets narrative Y. No hallucination, no advice drift.
- **Educational** — the tone is consistent and pedagogical.
- **No cost** — no LLM call needed.
- **Auditable** — every output is traceable to a template, easy to review.

## Persona × Scenario matrix

The `persona` is derived from the user's risk-tolerance answers. The `scenario` is the chosen mortgage+investment combination.

| Persona | Trigger |
|---|---|
| `conservador` | "prefiero pagar menos intereses" + "no me interesa invertir" |
| `equilibrado` | "depende" / "no estoy seguro" |
| `arriesgado` | "prefiero invertir a amortizar" |

| Scenario | Trigger |
|---|---|
| `baseline` | sin amortización voluntaria |
| `light` | +100€/mes amortización |
| `moderate` | +300€/mes amortización |
| `aggressive` | +500€/mes amortización |
| `invest-conservative` | alternativa inversión 4% |
| `invest-moderate` | alternativa inversión 6% |
| `invest-aggressive` | alternativa inversión 8% |

## Templates

### conservador × baseline

```
Tu hipoteca a 30 años al 3,5% tiene una cuota mensual de {cuota}€ durante {años} años,
pagando un total de {intereses}€ en intereses. No amortizas voluntariamente.

Esta es la opción "no hacer nada" — la más cómoda a corto plazo pero la más cara a
largo plazo. El 50% de lo que pagas durante la vida del préstamo son intereses.

Educativamente: si puedes permitirte {cuota + 100}€ al mes sin afectar tu calidad de
vida, considera la opción "ligera" del simulador. Ahorras {años_light} años y
{intereses_light}€ en intereses.

Disclaimer: esto no es consejo financiero. Son cálculos sobre tu perfil declarado.
```

### conservador × light

```
Con la opción ligera ({extra}€/mes de amortización voluntaria), reduces la vida del
préstamo de {años_base} a {años_light} años. Total ahorrado en intereses:
{ahorro_light}€.

Has elegido la opción más conservadora: priorizar la seguridad de tu vivienda sobre
cualquier alternativa de inversión. Es una decisión coherente con tu perfil.

Recuerda: amortizar hipoteca tiene "rentabilidad garantizada" igual al tipo de tu
préstamo ({tipo}%). No hay inversión comparable con esa garantía.

Disclaimer: esto no es consejo financiero. Son cálculos sobre tu perfil declarado.
```

### conservador × moderate

```
Con la opción moderada ({extra}€/mes), reduces la vida del préstamo a {años_moderate}
años y ahorras {ahorro_moderate}€ en intereses. Si mantienes este ritmo hasta el
final, tu hipoteca termina {años_antes} años antes de lo previsto.

Esta opción es un equilibrio entre seguridad y liquidez. Sigues teniendo efectivo
disponible para imprevistos, pero avanzas significativamente en la reducción del
principal.

Educativamente: considera reservar un fondo de emergencia equivalente a 3-6 meses
de gastos antes de elegir la opción agresiva. La sobre-amortización sin colchón
puede ser arriesgada si pierdes empleo.

Disclaimer: esto no es consejo financiero. Son cálculos sobre tu perfil declarado.
```

### conservador × aggressive

```
Con la opción agresiva ({extra}€/mes), reduces la vida del préstamo a {años_aggressive}
años. Total ahorrado en intereses: {ahorro_aggressive}€.

Esta es la opción más ambiciosa para un perfil conservador. Acumulas patrimonio
neto más rápido, pero reduces tu liquidez mensual.

Pregúntate: si pierdes empleo mañana, ¿podrías mantener la cuota ampliada durante
6 meses? Si la respuesta es no, considera la opción moderada.

Disclaimer: esto no es consejo financiero. Son cálculos sobre tu perfil declarado.
```

### arriesgado × invest-moderate

```
Si en lugar de amortizar {extra}€/mes, inviertes esa cantidad en un fondo
diversificado con rentabilidad media histórica del {rentabilidad}% anual,
acumularías {valor_nominal}€ en {años} años (cifra nominal).

Ajustado por inflación ({inflacion}% anual), el valor real sería {valor_real}€.

Compara con la opción de amortización: la rentabilidad de la hipoteca es
garantizada al {tipo_hipoteca}%, mientras que la inversión tiene riesgo y está
sujeta a tributación (~19-26% en España para ganancias patrimoniales).

Las rentabilidades pasadas no garantizan futuras.

Disclaimer: esto no es consejo financiero. Son cálculos sobre tu perfil declarado.
```

### equilibrado × any

```
Tu perfil indica preferencia por el equilibrio entre seguridad y oportunidad. Te
mostramos las opciones lado a lado: cada una tiene trade-offs que debes evaluar
según tu situación personal (estabilidad laboral, otros compromisos financieros,
horizonte temporal).

Recomendación educativa: antes de decidir, asegúrate de tener un fondo de
emergencia equivalente a 3-6 meses de gastos. Ninguna estrategia de hipoteca o
inversión sustituye la tranquilidad de un colchón financiero.

Disclaimer: esto no es consejo financiero. Son cálculos sobre tu perfil declarado.
```

## Variables

All `{...}` placeholders are computed by the domain services:

- `{cuota}` — `MortgageCalculator.monthlyPayment(principal, rate, years)`
- `{intereses}` — `totalPaid - principal`
- `{años_light}`, `{intereses_light}` — `MortgageCalculator.amortize(monthlyExtra=100)`
- `{valor_nominal}` — `InvestmentCalculator.futureValue(monthly, rate, years)`
- `{valor_real}` — `InvestmentCalculator.realValue(nominal, inflation, years)`
- `{tipo_hipoteca}` — from `PurchaseProcess.interestRate`
- `{rentabilidad}` — 4 / 6 / 8 depending on scenario
- `{inflacion}` — fixed at 2% per FR-021

## Implementation

`backend/src/domain/services/NarrativeGenerator.ts` selects the template based on `(persona, scenario)` and substitutes variables. No string interpolation issues; all variables are sanitised.

## Tests

The `NarrativeGenerator` has unit tests that:

- For each `(persona, scenario)` combination, check the output contains the expected variables and disclaimer
- Check that no template mentions "recomendamos", "deberías", "te conviene" (advice language)
- Check that the investment scenarios always include the tax disclaimer
