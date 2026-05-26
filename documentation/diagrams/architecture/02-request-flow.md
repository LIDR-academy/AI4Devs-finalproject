# Diagram 2 — Request Flow

**What it shows:** How an HTTP request travels from the browser through the ALB, the Nginx/Apache reverse proxy on EC2, to the correct container, and then to downstream services (RDS, S3, Jira Cloud). This is the operational request path — it shows port mapping, host-based routing, the Docker internal network, and which container owns which external call. A developer troubleshooting a runtime issue would reach for this diagram first.

graph LR
    Browser(("🌐 Browser"))

    subgraph EC2["EC2 Instance — Docker Host"]
        direction TB
        Nginx["🔀 Nginx / Apache\n(Reverse Proxy)\nHost-based routing"]

        subgraph DockerNet["Docker Network: supporthub-net"]
            CP["client-portal\n:5173\n(React SPA)"]
            BO["backoffice\n:5174\n(React SPA)"]
            API["api\n:5000\n(ASP.NET Core)"]
            IDN["identity\n:5001\n(OpenIddict OIDC)"]
        end
    end

    ALB["🔀 ALB\n(HTTPS :443)"]
    RDS[("🗄️ RDS PostgreSQL\npublic schema\nidentity schema")]
    S3["🪣 S3"]
    SES["📧 SES"]
    Jira["☁️ Jira Cloud\n(REST API v3)"]

    Browser -->|"HTTPS"| ALB
    ALB -->|"HTTP"| Nginx

    Nginx -->|"portal.supporthub.com"| CP
    Nginx -->|"admin.supporthub.com"| BO
    Nginx -->|"/api/*"| API
    Nginx -->|"/connect/*\n/.well-known/*"| IDN

    API -->|"TCP 5432\npublic schema"| RDS
    IDN -->|"TCP 5432\nidentity schema"| RDS
    API -->|"PutObject\nGetPresignedUrl"| S3
    API -->|"SendEmail"| SES
    API -->|"REST API Basic Auth\n(server-side only)"| Jira

    CW["📊 CloudWatch"]
    API -.->|"Serilog JSON logs"| CW
    IDN -.->|"Serilog JSON logs"| CW

    style DockerNet fill:#fff8e1,stroke:#f9a825
    style EC2 fill:#f3e5f5,stroke:#9c27b0
