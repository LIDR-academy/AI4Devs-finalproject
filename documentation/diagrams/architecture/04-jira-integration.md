# Diagram 4 — Jira Integration Flow (Outbound + Inbound Webhook)

**What it shows:** The two directions of Jira integration: (1) the outbound path where the api container creates issues, posts comments, and pushes attachments to Jira Cloud via REST (with S3 as the durable attachment store); and (2) the inbound webhook path where Jira Cloud calls back through the public ALB endpoint, HMAC signature is verified, a `Notification` record is written, and an SES email is optionally dispatched. This is a separate diagram because it involves an external third party (Jira Cloud) making calls *into* the system — an inbound flow that doesn't appear in any other diagram — and the attachment two-step (S3 then Jira) is a non-obvious detail worth isolating.

sequenceDiagram
    participant Client as Browser SPA
    participant API as api container :5000
    participant S3 as AWS S3
    participant Jira as Jira Cloud REST API v3
    participant RDS as RDS PostgreSQL
    participant SES as AWS SES

    rect rgb(232, 245, 233)
        Note over Client,Jira: OUTBOUND — Portal → Jira

        Client->>API: POST /api/tickets<br/>multipart/form-data<br/>{title, description, files[]}

        API->>Jira: POST /rest/api/3/issue<br/>Basic Auth (JIRA_USER_EMAIL + JIRA_API_TOKEN)<br/>ADF description body
        Jira-->>API: { id, key: "ACME-42" }

        API->>RDS: INSERT Ticket<br/>{ JiraIssueKey="ACME-42", ClientId, CreatedAt }

        loop For each attachment file
            API->>S3: PutObject<br/>key: attachments/ACME-42/{filename}
            S3-->>API: OK
            API->>Jira: POST /rest/api/3/issue/ACME-42/attachments<br/>X-Atlassian-Token: no-check<br/>multipart file
            Jira-->>API: OK
        end

        API-->>Client: 201 Created { ticketDto, attachments[] }
    end

    rect rgb(227, 242, 253)
        Note over Jira,SES: INBOUND — Jira Webhook → SupportHub

        Jira->>API: POST /api/webhooks/jira<br/>X-Hub-Signature: HMAC-SHA256<br/>{webhookEvent, issue.key, changelog/comment}
        Note over API: Rate limit: 60 req/min/IP (fixed window)
        Note over API: [AllowAnonymous] — auth via HMAC only

        API->>API: Verify HMAC-SHA256 signature<br/>using decrypted JiraWebhookSecret<br/>(ASP.NET Core Data Protection)

        API->>RDS: SELECT Ticket WHERE JiraIssueKey = issue.key
        RDS-->>API: Ticket { ClientId }

        alt event = issue_updated (status change)
            API->>RDS: INSERT Notification<br/>{ ClientUserId, JiraIssueKey, Type=StatusChanged, Message }
        else event = comment_created (prefixed [Client])
            API->>RDS: INSERT Notification<br/>{ ClientUserId, JiraIssueKey, Type=CommentAdded, Message (prefix stripped) }
        else Unknown event or no matching Ticket
            API-->>Jira: 200 OK (silent ack)
        end

        API->>RDS: SELECT UserEmailPreference WHERE UserId = ClientUserId
        alt EmailNotificationsEnabled = true
            API->>SES: SendEmail (HTML template, language-aware)<br/>Link: {PORTAL_BASE_URL}/tickets/{jiraIssueKey}
        end

        API-->>Jira: 200 OK
    end

    rect rgb(255, 243, 224)
        Note over Client,RDS: PRESIGNED URL — Attachment Download

        Client->>API: GET /api/tickets/ACME-42/attachments/{attachmentId}<br/>Authorization: Bearer JWT
        API->>API: Verify ticket ownership (ClientId check)
        API->>S3: GetPresignedUrl (expiry: 1h)
        S3-->>API: presigned URL
        API-->>Client: 302 → presigned URL (or 200 with URL in body)
    end
