---
name: k8s-planning
description: Interactive Kubernetes deployment planning through Q&A-based scenario extraction. Use when users want to design K8s architecture, plan microservice deployments, define manifests, ConfigMaps, Secrets, Services, RBAC, or Network Policies. Guides users through structured decision-making to generate consistent deployment documentation.
---

# Kubernetes Deployment Planning Skill

This skill provides a structured workflow for guiding users through Kubernetes deployment planning via interactive Q&A. It ensures consistent decision-making and generates comprehensive deployment documentation.

## When to Trigger This Skill

**Trigger conditions:**
- User mentions Kubernetes planning: "plan K8s deployment", "design Kubernetes architecture"
- User mentions manifest planning: "what manifests do I need", "plan my deployments"
- User mentions microservices deployment: "deploy my microservices", "containerize my apps"
- User asks about K8s resources: "ConfigMaps vs Secrets", "which Service type", "RBAC setup"

## Workflow Overview

Guide users through 5 stages:

1. **Application Discovery** - Identify all apps, their purpose, and communication patterns
2. **Manifest Selection** - Determine required K8s resource types
3. **Configuration Planning** - Design ConfigMaps and Secrets
4. **Networking Design** - Plan Services, Ingress, and Network Policies
5. **Access Control** - Define RBAC strategy with minimal blast-radius

---

## Stage 1: Application Discovery

### Goal
Understand the system architecture before making any K8s decisions.

### Questions to Ask

1. **App Count & Names**: How many applications/microservices need deployment?

2. **App Descriptions**: For each app, ask:
   - What is its primary function?
   - Is it stateless or stateful?
   - What APIs/endpoints does it expose?

3. **Communication Patterns**:
   - Which apps communicate with each other?
   - Are there external service dependencies (databases, LLMs, third-party APIs)?
   - Is there a frontend that needs public exposure?

4. **Data Requirements**:
   - Does any app require persistent storage?
   - Is there a database? (In-cluster or managed external service?)

### Output Table Format

```markdown
| App | Description | Stateless/Stateful | Endpoints | Communicates With |
|-----|-------------|-------------------|-----------|-------------------|
```

---

## Stage 2: Manifest Selection

### Goal
Determine which Kubernetes resource types are needed based on app characteristics.

### Decision Framework

| If App Is... | Use Workload Type | Rationale |
|--------------|-------------------|-----------|
| Stateless service | Deployment | Rolling updates, easy scaling |
| Stateful (database) | StatefulSet | Stable network IDs, ordered deployment |
| Node-level daemon | DaemonSet | Runs on every node |
| One-time task | Job | Run to completion |
| Scheduled task | CronJob | Periodic execution |

### Questions to Ask

1. **Workloads**: For each app, confirm workload type based on stateless/stateful nature

2. **Networking**:
   - Does any app need external access? (Ingress needed)
   - Should traffic between apps be restricted? (NetworkPolicy needed)

3. **Storage**:
   - Does any app need persistent storage? (PV/PVC needed)

4. **Configuration**:
   - Are there environment-specific configs? (ConfigMap needed)
   - Are there sensitive credentials? (Secret needed)

### Output Table Format

```markdown
| Category | Manifest Type | Count | Justification |
|----------|--------------|-------|---------------|
| Workloads | Deployment | X | ... |
| Discovery & Networking | Service | X | ... |
```

---

## Stage 3: Configuration Planning

### Goal
Design ConfigMaps and Secrets with clear separation of concerns.

### ConfigMap vs Secret Decision

| Data Type | Resource | Example |
|-----------|----------|---------|
| Service URLs | ConfigMap | `BACKEND_API_URL=http://backend-svc:8080` |
| Feature flags | ConfigMap | `ENABLE_FEATURE_X=true` |
| Log levels | ConfigMap | `LOG_LEVEL=info` |
| API keys | Secret | `LLM_API_KEY=sk-xxx` |
| Database credentials | Secret | `DB_PASSWORD=xxx` |
| TLS certificates | Secret (type: kubernetes.io/tls) | `tls.crt`, `tls.key` |
| Connection strings with passwords | Secret | `DATABASE_URL=postgres://user:pass@host` |

### Questions to Ask

For each app:

1. **Non-sensitive config**: What environment variables does it need that are NOT sensitive?
2. **Sensitive config**: What credentials, API keys, or secrets does it require?
3. **Security approach**: Should secrets use encryption at rest? (Recommend: Yes)

### Output Table Format

**ConfigMaps:**
```markdown
| ConfigMap Name | Environment Variables | Justification |
|----------------|----------------------|---------------|
```

**Secrets:**
```markdown
| Secret Name | Data Type | Keys | Security Approach | Justification |
|-------------|-----------|------|-------------------|---------------|
```

---

## Stage 4: Networking Design

### Goal
Design service discovery, external access, and network security.

### Service Type Decision Framework

| Scenario | Service Type | Rationale |
|----------|--------------|-----------|
| Internal-only communication | ClusterIP | Default; no external exposure |
| External access (cloud LB) | LoadBalancer | Direct cloud LB provisioning |
| External access (shared entry) | ClusterIP + Ingress | Centralized TLS, path-based routing |
| Access from outside cluster (dev) | NodePort | Simple but not for production |
| External DNS name | ExternalName | Alias to external service |

### Consistency Principle
**Default to ClusterIP for all services** unless there's a specific justification for external exposure. Use a single Ingress for external access to minimize attack surface.

### Questions to Ask

1. **Service Discovery**: Confirm each app needs a Service for discovery
2. **External Access**: Which apps need to be accessible from outside the cluster?
3. **TLS**: Is HTTPS required? (Recommend: Always yes for production)
4. **Traffic Restriction**: Should inter-service traffic be restricted? (NetworkPolicy)

### Output Table Format

**Services:**
```markdown
| Service Name | Type | Justification |
|--------------|------|---------------|
```

**Ingress:**
```markdown
| Host | Path | Backend Service | Description |
|------|------|-----------------|-------------|
```

**Network Policies:**
```markdown
| Policy Name | Pod Selector | Ingress From | Egress To | Justification |
|-------------|--------------|--------------|-----------|---------------|
```

---

## Stage 5: Access Control (RBAC)

### Goal
Design minimal-privilege access control with small blast-radius.

### RBAC vs Alternatives Decision

| Requirement | Solution | When to Use |
|-------------|----------|-------------|
| Basic pod identity | ServiceAccount only | Apps don't need K8s API access |
| ConfigMap/Secret read | Role + RoleBinding | Apps need to read config |
| Cross-namespace access | ClusterRole + ClusterRoleBinding | Avoid unless absolutely necessary |
| Policy enforcement | OPA/Gatekeeper | Complex policies beyond RBAC |

### Blast-Radius Principle
**Always prefer namespace-scoped (Role) over cluster-scoped (ClusterRole)**. Each app should have its own ServiceAccount with only the permissions it needs.

### Questions to Ask

1. **K8s API Access**: Does any app need to interact with the Kubernetes API?
2. **Config Reading**: Do apps read ConfigMaps/Secrets at runtime via K8s API (vs mounted volumes)?
3. **Cross-Namespace**: Does any app need access to resources in other namespaces?

### Output Table Format

**RBAC Artifacts:**
```markdown
| Type | Name | Scope | Justification |
|------|------|-------|---------------|
| ServiceAccount | xxx-sa | Namespace | ... |
| Role | xxx-role | Namespace | ... |
| RoleBinding | xxx-rb | Namespace | ... |
```

**Role Permissions:**
```markdown
| Resource | Verbs | Justification |
|----------|-------|---------------|
```

---

## Final Output: Plan Document

After completing all stages, generate a comprehensive Plan.md with:

1. **Design Principles Table** - Summary of consistency decisions
2. **Application Architecture** - Apps overview + API endpoints
3. **Manifest Types** - Required K8s resources by category
4. **ConfigMaps** - Names, env vars, justifications
5. **Secrets** - Names, data types, security approach
6. **Deployments** - Names with purpose
7. **Services** - Names, types, justifications
8. **Ingress Configuration** - Routing rules
9. **RBAC Artifacts** - ServiceAccounts, Roles, RoleBindings
10. **Network Policies** - Traffic restriction rules
11. **Communication Flow Diagram** - ASCII diagram of architecture

---

## Consistency Guidelines

Ensure these principles are applied consistently throughout planning:

| Principle | Default Decision |
|-----------|------------------|
| Internal Communication | ClusterIP |
| External Exposure | Single Ingress |
| Secrets Management | K8s Secrets + encryption at rest |
| RBAC Scope | Namespace-scoped (Role/RoleBinding) |
| Workload Type | Deployment (unless stateful) |
| Namespace Strategy | Single namespace per application domain |

---

## Example Interaction

**User**: I want to deploy a task management app with a frontend, backend API, and an AI agent.

**Assistant**: Let me help you plan the Kubernetes deployment. I'll guide you through 5 stages to ensure consistent decisions.

**Stage 1: Application Discovery**

I see you have 3 apps. Let me ask a few questions:

1. Is the frontend a static site or a server-rendered app?
2. Does the backend need a database?
3. Does the AI agent connect to an external LLM provider?
4. Which apps communicate with each other?

*[Continue through all 5 stages...]*