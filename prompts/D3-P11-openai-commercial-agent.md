# D3-P11 - OpenAI Commercial Agent

Author: SCDF  
Delivery: Delivery 3 - Final Functional Product  
Prompt language: English  

## Prompt

```text
Implement the OpenAI commercial agent used by the ComercIA backend. Use the OpenAI Responses API with OPENAI_MODEL and strict structured JSON output. Send available_backend_endpoints, the current conversation, recent messages, product inventory, pricing constraints, latest negotiation, latest order, and the incoming WhatsApp message. The model may return only one action from show_catalog, show_inventory, propose_offer, accept_offer, confirm_payment, schedule_delivery, help, and handoff, with productSku, quantity, requestedDiscountPercent, addressText, customerReply, and rationale.
```

