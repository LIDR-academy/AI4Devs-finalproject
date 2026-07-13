# Diagram 1 — AWS Infrastructure

**What it shows:** The AWS account topology: VPC with public and private subnets, how the ALB terminates TLS, EC2 in the public subnet running all four containers, RDS PostgreSQL locked in the private subnet, and the surrounding AWS-managed services (S3, SES, CloudWatch, CloudFormation). This diagram answers *"what lives where in AWS and how is it networked?"* — purely an infrastructure concern, not request routing.

graph TB
    subgraph AWS["☁️ AWS Account"]
        CF["⚙️ CloudFormation\n(Infrastructure as Code)"]
        CW["📊 CloudWatch\n(Logs & Metrics)"]
        S3["🪣 S3\n(Attachment Storage)"]
        SES["📧 SES\n(Transactional Email)"]

        subgraph VPC["🔒 VPC"]
            subgraph PublicSubnet["Public Subnet"]
                ALB["🔀 Application Load Balancer\n(TLS Termination / HTTPS)"]
                EC2["🖥️ EC2 Instance\n(Docker Host)"]
            end

            subgraph PrivateSubnet["Private Subnet"]
                RDS["🗄️ RDS PostgreSQL 17\n(Not Publicly Accessible)\n• Schema: public  → api\n• Schema: identity → identity"]
            end
        end
    end

    Internet(("🌐 Internet"))

    Internet -->|"HTTPS 443"| ALB
    ALB -->|"HTTP internal"| EC2
    EC2 -->|"TCP 5432\n(private subnet only)"| RDS
    EC2 -->|"HTTPS"| S3
    EC2 -->|"HTTPS"| SES
    EC2 -.->|"Logs & Metrics"| CW
    CF -.->|"Provisions"| VPC

    style PublicSubnet fill:#e8f5e9,stroke:#4caf50
    style PrivateSubnet fill:#fce4ec,stroke:#e91e63
    style AWS fill:#f0f4ff,stroke:#3f51b5
    style VPC fill:#e3f2fd,stroke:#1976d2
