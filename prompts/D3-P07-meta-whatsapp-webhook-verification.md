# D3-P07 - Meta WhatsApp Webhook Verification

Author: SCDF  
Delivery: Delivery 3 - Final Functional Product  
Prompt language: English  

## Prompt

```text
Implement Meta WhatsApp webhook verification for ComercIA. Add GET /webhooks/whatsapp that reads hub.mode, hub.verify_token, and hub.challenge, compares the verify token with META_WHATSAPP_VERIFY_TOKEN, returns the challenge for subscribe requests, and returns 403 for invalid tokens. Document that the callback URL is the deployed backend /webhooks/whatsapp route.
```

