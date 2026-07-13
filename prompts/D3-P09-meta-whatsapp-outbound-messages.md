# D3-P09 - Meta WhatsApp Outbound Messages

Author: SCDF  
Delivery: Delivery 3 - Final Functional Product  
Prompt language: English  

## Prompt

```text
Implement Meta WhatsApp outbound messaging for ComercIA. Use META_GRAPH_API_VERSION, META_WHATSAPP_PHONE_NUMBER_ID, and META_WHATSAPP_ACCESS_TOKEN to call the Graph API /messages endpoint. Provide sendWhatsappText, sendWhatsappList, sendWhatsappReplyButtons, and sendWhatsappCtaUrl helpers. Wrap outbound sends in safeSendWhatsapp so failed sends are logged and masked but do not break inbound webhook processing, and fall back to plain text when an interactive message is rejected.
```

