# D3-P12 - AI Guardrails and Fallback

Author: SCDF  
Delivery: Delivery 3 - Final Functional Product  
Prompt language: English  

## Prompt

```text
Implement AI guardrails and deterministic fallback for ComercIA. GPT must not invent stock, prices, payment links, payment status, delivery status, customer identity, or unsupported backend actions. Normalize productSku against the real catalog, clamp quantity and discount ranges, validate every returned action before execution, and execute only whitelisted backend flows. If OPENAI_API_KEY is missing or the model call fails, continue with the deterministic parser so WhatsApp still supports catalog, inventory, offer, accept, payment, delivery, and advisor handoff commands.
```

