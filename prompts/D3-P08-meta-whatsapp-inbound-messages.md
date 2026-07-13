# D3-P08 - Meta WhatsApp Inbound Messages

Author: SCDF  
Delivery: Delivery 3 - Final Functional Product  
Prompt language: English  

## Prompt

```text
Implement Meta WhatsApp inbound message processing for ComercIA. POST /webhooks/whatsapp must accept real Meta payloads and the simulator payload, parse text messages, button replies, and list replies, extract buyer name, phone number, message body, provider message id, and product SKU when present, and allow productSku to be optional. If the message has no SKU, resolve the product from catalog mentions or continue the active conversation before saving the inbound message and routing it to the commercial bot.
```

