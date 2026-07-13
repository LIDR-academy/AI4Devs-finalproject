# D3-P22 - Advisor Review Flow

Author: SCDF  
Delivery: Delivery 3 - Final Functional Product  
Prompt language: English  

## Prompt

```text
Implement the ComercIA human advisor review flow in the final backend and frontend. The backend must expose GET /dashboard/review-queue, POST /dashboard/conversations/close-stale, POST /dashboard/conversations/:id/take, POST /dashboard/conversations/:id/reply, and POST /dashboard/conversations/:id/manual-offer. Conversations that require human review must pause automation, advisor takeover must set advisor_active, advisor replies must be saved and sent to WhatsApp, manual offers must validate stock, minimum price, discount thresholds, and actor=advisor acceptance before creating or accepting an order, and delivery_scheduled conversations must close after CONVERSATION_CLOSE_AFTER_MINUTES of inactivity.
```
