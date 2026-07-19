# mingrammer/diagrams Library Guide

Reference for the `diagrams` Python library (https://github.com/mingrammer/diagrams).
Used by the Feature Documentation Generator skill to produce PNG architecture diagrams.

---

## Installation

```bash
# 1. Install system Graphviz (required rendering engine)
# Linux (Debian/Ubuntu)
sudo apt-get install graphviz -y

# macOS
brew install graphviz

# Windows: https://graphviz.org/download/ — add to PATH

# 2. Install Python library
pip install diagrams --break-system-packages
```

---

## Core Concepts

```python
from diagrams import Diagram, Cluster, Edge

# Diagram context: sets title, direction, output format and filename
with Diagram("My Architecture", show=False, direction="LR", filename="arch"):
    # All node and edge declarations go inside this block
    pass
```

### Direction options
| Value | Meaning |
|-------|---------|
| `"LR"` | Left → Right (default, good for pipelines) |
| `"TB"` | Top → Bottom (good for layered architectures) |
| `"RL"` | Right → Left |
| `"BT"` | Bottom → Top |

### Output formats
```python
with Diagram("Title", outformat="png"):  # png | svg | pdf
    pass
```

---

## Nodes

Nodes represent services or components. Import from the appropriate provider module.

```python
from diagrams.aws.compute import Lambda, EC2
from diagrams.aws.database import RDS
from diagrams.onprem.client import Users

users = Users("Browser Client")
api   = Lambda("API Handler")
db    = RDS("PostgreSQL")
```

---

## Edges (Connections)

```python
# Simple arrow (left >> right)
users >> api >> db

# Bidirectional
api - db

# Labeled edge
from diagrams import Edge
api >> Edge(label="SQL query") >> db

# Colored / styled edge
api >> Edge(color="red", style="dashed", label="error path") >> db

# Fan-out: one source to many
api >> [db, cache, queue]

# Fan-in: many sources to one
[service_a, service_b] >> db
```

---

## Clusters (Grouping)

```python
from diagrams import Cluster

with Cluster("VPC"):
    with Cluster("Private Subnet"):
        db = RDS("Database")
    with Cluster("Public Subnet"):
        lb = ELB("Load Balancer")
        api = EC2("API Server")

lb >> api >> db
```

---

## Full Provider Node Catalog

### AWS (`diagrams.aws.*`)

```python
# Compute
from diagrams.aws.compute import (
    EC2, Lambda, ECS, EKS, Fargate, AppRunner, AutoScaling, Batch
)

# Database
from diagrams.aws.database import (
    RDS, Aurora, DDB, ElastiCache, Redshift, DocumentDB, DAX
)

# Network
from diagrams.aws.network import (
    APIGateway, CloudFront, ELB, Route53, VPC, NATGateway, PrivateLink
)

# Storage
from diagrams.aws.storage import S3, EFS, Glacier

# Integration / Messaging
from diagrams.aws.integration import SQS, SNS, Eventbridge, StepFunctions, MQ

# Security
from diagrams.aws.security import Cognito, WAF, KMS, IAMRole, SecretsManager

# Management
from diagrams.aws.management import Cloudwatch, Cloudtrail, Config, SystemsManager

# Analytics
from diagrams.aws.analytics import Kinesis, Glue, Athena, EMR, Quicksight

# ML
from diagrams.aws.ml import Sagemaker, Rekognition, Comprehend
```

### GCP (`diagrams.gcp.*`)

```python
from diagrams.gcp.compute import GCE, GKE, CloudRun, Functions
from diagrams.gcp.database import SQL, Firestore, Bigtable, Spanner
from diagrams.gcp.network import LoadBalancing, CDN, VPC
from diagrams.gcp.storage import GCS
from diagrams.gcp.analytics import BigQuery, Dataflow, Pubsub
from diagrams.gcp.security import KMS, IAM
```

### Azure (`diagrams.azure.*`)

```python
from diagrams.azure.compute import VM, AKS, FunctionApps, ContainerApps
from diagrams.azure.database import SQL, CosmosDb, DatabaseForPostgresql
from diagrams.azure.network import ApplicationGateway, Frontdoor, CDNProfiles
from diagrams.azure.storage import BlobStorage, DataLakeStorage
from diagrams.azure.security import KeyVaults, ActiveDirectory
```

### Kubernetes (`diagrams.k8s.*`)

```python
from diagrams.k8s.compute import Pod, Deployment, StatefulSet, DaemonSet, CronJob
from diagrams.k8s.network import Ingress, Service
from diagrams.k8s.storage import PV, PVC, StorageClass
from diagrams.k8s.rbac import ServiceAccount, ClusterRole
from diagrams.k8s.infra import Node
from diagrams.k8s.ecosystem import Helm
```

### On-Premises (`diagrams.onprem.*`)

```python
from diagrams.onprem.compute import Server
from diagrams.onprem.database import (
    PostgreSQL, MySQL, MongoDB, Redis, Cassandra, ClickHouse
)
from diagrams.onprem.queue import Kafka, RabbitMQ, Celery
from diagrams.onprem.network import Nginx, HAProxy, Traefik, Istio
from diagrams.onprem.monitoring import Grafana, Prometheus, Datadog
from diagrams.onprem.client import Users, User
from diagrams.onprem.ci import Jenkins, GithubActions, Gitlab
from diagrams.onprem.vcs import Git, Github, Gitlab as GitlabVCS
from diagrams.onprem.container import Docker, K3S
```

### Generic / Fallback (`diagrams.generic.*`)

Use these when the actual service has no specific icon:

```python
from diagrams.generic.compute import Rack
from diagrams.generic.network import Firewall, Subnet, Switch, Router
from diagrams.generic.storage import Storage
from diagrams.generic.os import LinuxGeneral, Windows
from diagrams.generic.place import Datacenter
```

### SaaS (`diagrams.saas.*`)

```python
from diagrams.saas.analytics import Datadog, Newrelic, Snowflake
from diagrams.saas.chat import Slack, Teams
from diagrams.saas.cdn import Cloudflare, Fastly
from diagrams.saas.identity import Auth0, Okta
from diagrams.saas.logging import Papertrail, Loggly
```

### Programming (`diagrams.programming.*`)

```python
from diagrams.programming.language import Python, Javascript, Go, Rust, Java
from diagrams.programming.framework import Django, Flask, React, Angular, Vue
from diagrams.programming.flowchart import Action, Decision, Document, MultipleDocuments
```

---

## Complete Examples

### Example 1 — REST API (AWS, declarative via script)

```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import APIGateway, CloudFront, Route53
from diagrams.aws.compute import Lambda
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.storage import S3
from diagrams.aws.security import Cognito
from diagrams.onprem.client import Users

with Diagram("REST API Architecture", show=False, direction="LR", filename="rest_api_arch"):
    users = Users("Client Apps")
    cdn = CloudFront("CloudFront")
    dns = Route53("Route 53")
    auth = Cognito("Cognito")

    with Cluster("API Layer"):
        apigw = APIGateway("API Gateway")
        fn = Lambda("Handler")

    with Cluster("Data Layer"):
        db = RDS("PostgreSQL")
        cache = ElastiCache("Redis")

    assets = S3("Static Assets")

    users >> dns >> cdn
    cdn >> assets
    cdn >> apigw
    apigw >> Edge(label="verify") >> auth
    apigw >> fn
    fn >> Edge(label="read-through") >> cache >> db
```

### Example 2 — Kubernetes Deployment

```python
from diagrams import Diagram, Cluster
from diagrams.k8s.compute import Pod, Deployment
from diagrams.k8s.network import Ingress, Service
from diagrams.k8s.storage import PV, PVC
from diagrams.onprem.client import Users

with Diagram("K8s Feature Deployment", show=False, direction="TB", filename="k8s_arch"):
    users = Users("External Traffic")

    with Cluster("Kubernetes Cluster"):
        ingress = Ingress("Nginx Ingress")

        with Cluster("Feature Namespace"):
            svc = Service("ClusterIP Service")
            deploy = Deployment("feature-deployment")
            pods = [Pod("pod-1"), Pod("pod-2")]
            pvc = PVC("feature-pvc")
            pv = PV("feature-pv")

        ingress >> svc >> deploy >> pods
        pods[0] >> pvc >> pv
```

### Example 3 — Event-Driven Microservices

```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.database import DDB, RDS
from diagrams.aws.network import APIGateway
from diagrams.onprem.client import Users

with Diagram("Event-Driven Architecture", show=False, direction="LR",
             filename="event_driven_arch"):
    users = Users("Users")
    apigw = APIGateway("API GW")

    with Cluster("Order Service"):
        order_fn = Lambda("Order Handler")
        order_db = DDB("Orders Table")

    with Cluster("Event Bus"):
        bus = Eventbridge("Event Bridge")
        dlq = SQS("Dead Letter Queue")

    with Cluster("Fulfilment Service"):
        fulfil_fn = Lambda("Fulfilment Handler")
        fulfil_db = RDS("Inventory DB")

    users >> apigw >> order_fn
    order_fn >> order_db
    order_fn >> Edge(label="OrderPlaced") >> bus
    bus >> fulfil_fn
    bus >> Edge(style="dashed", label="failed") >> dlq
    fulfil_fn >> fulfil_db
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `ExecutableNotFound: dot` | Graphviz not installed | Install system graphviz package |
| `ModuleNotFoundError: diagrams` | Python library missing | `pip install diagrams --break-system-packages` |
| `AttributeError: module has no attribute 'X'` | Wrong class name | Check this guide's catalog |
| `FileNotFoundError` on output path | Output directory missing | Script creates dir automatically; check write permissions |
| Diagram shows but is empty | All nodes outside `with Diagram()` block | Ensure node creation is indented inside context |
| Edge arrows missing | Using `-` instead of `>>` | Use `>>` for directed, `-` for undirected |
