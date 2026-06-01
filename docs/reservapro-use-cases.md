# ReservaPro - Use Cases

## 1. End-to-End Client Booking Flow

**Description** -- This use case represents the primary happy path of ReservaPro. The End Client initiates the flow by accessing the barbershop's public booking page, typically shared via a link or QR code. The client browses available services, selects a preferred professional (or chooses "any available"), views real-time availability slots filtered by the professional's schedule and existing appointments, picks a date and time, and proceeds to online payment via MercadoPago or Stripe. Upon successful payment, the system creates a confirmed appointment, deducts the slot from the professional's availability, and sends a confirmation message to the client via WhatsApp and email. The appointment appears on the Business Owner's and Professional's dashboards. All timestamps are normalized to America/Bogota timezone. The booking page is mobile-first and must load within 3 seconds on 4G connections common in Colombia.

```mermaid
flowchart TD
    Client["End Client"]
    Owner["Business Owner"]
    Professional["Professional/Staff"]

    subgraph ReservaPro System
        A["Client opens public booking page"]
        B["Client selects service from catalog"]
        C["Client selects professional or any available"]
        D["System loads available time slots"]
        E{"Slot available?"}
        F["Client selects date and time"]
        G["Client enters personal details"]
        H["Client proceeds to payment"]
        I{"Payment successful?"}
        J["System creates confirmed appointment"]
        K["System deducts slot from availability"]
        L["System sends WhatsApp confirmation"]
        M["System sends email confirmation"]
        N["Appointment appears on dashboards"]
        O["Show error and retry payment"]
        P["Show next available slots"]
        Q["Client sees no availability message"]
    end

    Client --> A
    A --> B
    B --> C
    C --> D
    D --> E
    E -->|Yes| F
    E -->|No| Q
    F --> G
    G --> H
    H --> I
    I -->|Yes| J
    I -->|No| O
    O --> H
    J --> K
    K --> L
    K --> M
    L --> N
    M --> N
    P --> F

    class Client,Owner,Professional actor
    class A,B,C,D,F,G,H,J,K,L,M,N,O,P,Q step
    class E,I decision
    class N outcome
```

## 2. Business Owner Manages Appointments and Staff

**Description** -- This use case covers the most complex multi-actor interaction in ReservaPro. The Business Owner logs into the management dashboard to configure the shop's operations: creating and pricing services, assigning professionals to specific services, setting each professional's weekly availability schedule with support for breaks and multiple shifts, and defining cancellation and rescheduling policies. When a client requests a cancellation or reschedule, the system evaluates the request against the configured policy (time before appointment, penalty rules), and the Owner decides whether to approve, apply a partial refund, or credit the client's account. The Owner also monitors real-time dashboard metrics including daily revenue, appointment fill rate, professional utilization, and upcoming appointments. Professionals receive schedule updates via WhatsApp notifications. This flow involves decision points around policy enforcement, multi-step configuration that affects downstream booking availability, and coordination between Owner actions and what clients see on the public booking page.

```mermaid
flowchart TD
    Owner["Business Owner"]
    Professional["Professional/Staff"]
    Client["End Client"]

    subgraph ReservaPro System
        A["Owner logs into management dashboard"]
        B["Owner creates or edits services and pricing"]
        C["Owner assigns professionals to services"]
        D["Owner sets weekly schedule per professional"]
        E["System updates availability calendar"]
        F["Client requests cancellation or reschedule"]
        G{"Within cancellation policy window?"}
        H["System applies full refund or free reschedule"]
        I["System calculates penalty or partial refund"]
        J{"Owner approves exception?"}
        K["System processes approved refund or credit"]
        L["System enforces standard policy"]
        M["System updates appointment status"]
        N["System sends WhatsApp notification to professional"]
        O["Owner views dashboard metrics"]
        P["System displays revenue and utilization reports"]
    end

    Owner --> A
    A --> B
    B --> C
    C --> D
    D --> E
    Client --> F
    F --> G
    G -->|Yes| H
    G -->|No| I
    I --> J
    J -->|Yes| K
    J -->|No| L
    H --> M
    K --> M
    L --> M
    M --> N
    Owner --> O
    O --> P

    class Owner,Professional,Client actor
    class A,B,C,D,E,F,H,I,K,L,M,N,O,P step
    class G,J decision
    class E,P outcome
```

## 3. Payment Processing and No-Show Management

**Description** -- This use case is critical for revenue integrity and data consistency. When a client books an appointment, the system processes an online deposit or full payment through MercadoPago (primary for Colombia) or Stripe (for international cardholders). The payment gateway returns a transaction ID that the system stores alongside the appointment record. If payment fails, the slot is released back to availability after a 10-minute hold. On the day of the appointment, the system monitors check-in status: if the client does not arrive within a configurable grace period (default 15 minutes), the system flags the appointment as a no-show. The no-show triggers the configured policy, which may charge a penalty to the stored payment method, apply a credit deduction to the client's account, or simply record the incident for the Owner's review. Refund requests initiated by the Owner or triggered by professional cancellation follow a reversal flow that updates the payment gateway and notifies the client via WhatsApp. All financial transactions are logged with audit trails for compliance and reconciliation purposes.

```mermaid
flowchart TD
    Client["End Client"]
    Owner["Business Owner"]
    Admin["System Admin"]

    subgraph ReservaPro System
        A["Client initiates payment at checkout"]
        B{"Select payment method"}
        C["Process payment via MercadoPago"]
        D["Process payment via Stripe"]
        E{"Payment approved?"}
        F["Store transaction ID with appointment"]
        G["Mark appointment as paid"]
        H["Hold slot for 10 minutes"]
        I["Release slot back to availability"]
        J["Appointment day arrives"]
        K{"Client checks in on time?"}
        L["Mark appointment as completed"]
        M["Flag appointment as no-show"]
        N{"No-show policy type?"}
        O["Charge penalty to stored payment method"]
        P["Apply credit deduction to client account"]
        Q["Record incident for Owner review"]
        R["Owner initiates refund request"]
        S["System reverses payment via gateway"]
        T["System sends WhatsApp refund notification"]
        U["Log transaction in audit trail"]
    end

    Client --> A
    A --> B
    B -->|MercadoPago| C
    B -->|Stripe| D
    C --> E
    D --> E
    E -->|Yes| F
    E -->|No| H
    F --> G
    H --> I
    G --> J
    J --> K
    K -->|Yes| L
    K -->|No| M
    M --> N
    N -->|Charge penalty| O
    N -->|Credit deduction| P
    N -->|Record only| Q
    Owner --> R
    R --> S
    S --> T
    F --> U
    O --> U
    S --> U

    class Client,Owner,Admin actor
    class A,C,D,F,G,H,I,J,L,M,O,P,Q,R,S,T,U step
    class B,E,K,N decision
    class G,L,U outcome
```
