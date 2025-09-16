# 🚀 Deployment Architecture - Nura System

## 🚀 Estrategia de Deployment Híbrida

**Enfoque Arquitectónico**: Hybrid serverless + containers con AWS multi-region deployment para máxima disponibilidad y escalabilidad global.

**Deployment Strategy**:
- **Development**: Local containers + Docker Compose para desarrollo rápido
- **Staging**: Single-region AWS deployment con recursos limitados
- **Production**: Multi-region deployment con full auto-scaling y disaster recovery

---

## ☁️ AWS Multi-Region Architecture

### 🌍 Primary Region (us-east-1) + Secondary Region (eu-west-1)

```mermaid
graph TB
    subgraph "Global Infrastructure"
        CF[🌐 CloudFront CDN<br/>Global Edge Locations]
        R53[🌍 Route 53<br/>DNS Failover & Routing]
    end
    
    subgraph "Primary Region: us-east-1"
        subgraph "Availability Zone 1a"
            ALB1[⚖️ Application Load Balancer]
            EKS1[☸️ EKS Cluster Primary<br/>3 Worker Nodes]
            RDS1[🗄️ RDS PostgreSQL Primary<br/>pgvector enabled]
        end
        
        subgraph "Availability Zone 1b"
            EKS2[☸️ EKS Cluster Secondary<br/>2 Worker Nodes]
            RDS2[🗄️ RDS Read Replica 1]
            REDIS1[⚡ ElastiCache Redis<br/>Cluster Mode]
        end
        
        subgraph "Availability Zone 1c"
            EKS3[☸️ EKS Backup<br/>1 Worker Node]
            RDS3[🗄️ RDS Read Replica 2]
            REDIS2[⚡ ElastiCache Redis<br/>Backup Cluster]
        end
        
        subgraph "Serverless Layer"
            LAMBDA_P[⚡ Lambda Functions<br/>Orchestration Layer]
            BEDROCK_P[🤖 AWS Bedrock<br/>Claude-3, Llama-2, Titan]
            SAGEMAKER_P[🧠 SageMaker Endpoints<br/>Custom LLM Models]
        end
    end
    
    subgraph "Secondary Region: eu-west-1"
        subgraph "DR Infrastructure"
            ALB2[⚖️ ALB Standby]
            EKS_DR[☸️ EKS DR Cluster<br/>2 Worker Nodes]
            RDS_DR[🗄️ RDS Cross-Region<br/>Read Replica]
            REDIS_DR[⚡ Redis DR Cluster]
            LAMBDA_DR[⚡ Lambda DR Functions]
        end
    end
    
    subgraph "Storage & Backup"
        S3_PRIMARY[💾 S3 Primary Bucket<br/>Cross-Region Replication]
        S3_DR[💾 S3 DR Bucket<br/>eu-west-1]
        BACKUP[💿 AWS Backup<br/>Automated Snapshots]
    end
    
    CF --> R53
    R53 --> ALB1
    R53 -.->|Failover| ALB2
    
    ALB1 --> EKS1
    ALB1 --> EKS2
    EKS1 --> RDS1
    EKS2 --> RDS2
    EKS3 --> RDS3
    
    RDS1 -.->|Cross-Region Replication| RDS_DR
    REDIS1 -.->|Backup Replication| REDIS_DR
    S3_PRIMARY -.->|CRR| S3_DR
    
    subgraph "GitOps & CI/CD Layer"
        JENKINS[Jenkins<br/>Enterprise CI/CD]
        ARGOCD[ArgoCD<br/>GitOps Deployment]
        GITHUB[GitHub<br/>Source Control]
        ECR[Amazon ECR<br/>Container Registry]
        CODECOMMIT[AWS CodeCommit<br/>Enterprise Git]
    end
    
    GITHUB --> JENKINS
    JENKINS --> ECR
    ECR --> ARGOCD
    ARGOCD --> EKS1
    ARGOCD --> EKS2
    CODECOMMIT --> JENKINS
    
    EKS1 --> BEDROCK_P
    EKS2 --> SAGEMAKER_P
    LAMBDA_P --> BEDROCK_P
```

---

## 🤖 AWS Bedrock Integration

### ⚡ Serverless LLM Processing

```mermaid
graph TB
    subgraph "Nura Core Application"
        API[📡 Nura API Gateway]
        CORE[🔧 Core Service]
        AGENT[🤖 Agent Orchestrator]
    end
    
    subgraph "AWS Bedrock Models"
        CLAUDE3[🧠 Claude-3 Sonnet<br/>Main Reasoning]
        CLAUDE_INSTANT[⚡ Claude-3 Haiku<br/>Quick Responses]
        LLAMA2[💻 Llama-2 70B<br/>Code Analysis]
        TITAN[🔤 Amazon Titan<br/>Embeddings]
        COHERE[📝 Cohere Command<br/>Summarization]
    end
    
    subgraph "Model Router & Cache"
        ROUTER[🔄 Bedrock Model Router]
        CACHE[⚡ Redis Model Cache]
        METRICS[📊 CloudWatch Metrics]
    end
    
    CORE --> ROUTER
    AGENT --> ROUTER
    ROUTER --> CLAUDE3
    ROUTER --> CLAUDE_INSTANT
    ROUTER --> LLAMA2
    ROUTER --> TITAN
    ROUTER --> COHERE
    ROUTER --> CACHE
    ROUTER --> METRICS
```

### ⚙️ Bedrock Model Configuration

```python
# backend/src/services/bedrock_service.py
import boto3
import json
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass

class BedrockModel(Enum):
    CLAUDE_3_SONNET = "anthropic.claude-3-sonnet-20240229-v1:0"
    CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0"
    LLAMA_2_70B = "meta.llama2-70b-chat-v1"
    TITAN_EMBEDDINGS = "amazon.titan-embed-text-v1"
    COHERE_COMMAND = "cohere.command-text-v14"

@dataclass
class BedrockConfig:
    model_id: str
    max_tokens: int
    temperature: float
    top_p: float
    region: str = "us-east-1"

class BedrockModelRouter:
    def __init__(self):
        self.client = boto3.client('bedrock-runtime')
        self.model_configs = {
            BedrockModel.CLAUDE_3_SONNET: BedrockConfig(
                model_id=BedrockModel.CLAUDE_3_SONNET.value,
                max_tokens=4000,
                temperature=0.1,
                top_p=0.9
            ),
            BedrockModel.CLAUDE_3_HAIKU: BedrockConfig(
                model_id=BedrockModel.CLAUDE_3_HAIKU.value,
                max_tokens=1000,
                temperature=0.3,
                top_p=0.9
            ),
            BedrockModel.LLAMA_2_70B: BedrockConfig(
                model_id=BedrockModel.LLAMA_2_70B.value,
                max_tokens=2000,
                temperature=0.1,
                top_p=0.9
            )
        }
    
    async def route_request(self, 
                          query: str, 
                          agent_type: str, 
                          complexity_score: float) -> BedrockModel:
        """Smart routing based on query complexity and agent type"""
        
        # High complexity or architecture questions → Claude-3 Sonnet
        if complexity_score > 0.7 or agent_type == "architect":
            return BedrockModel.CLAUDE_3_SONNET
        
        # Code analysis → Llama-2 70B
        elif agent_type == "dev" and "code" in query.lower():
            return BedrockModel.LLAMA_2_70B
        
        # Quick responses → Claude-3 Haiku
        else:
            return BedrockModel.CLAUDE_3_HAIKU
    
    async def invoke_model(self, 
                          model: BedrockModel, 
                          prompt: str,
                          system_prompt: Optional[str] = None) -> Dict:
        """Invoke Bedrock model with proper formatting"""
        
        config = self.model_configs[model]
        
        if model in [BedrockModel.CLAUDE_3_SONNET, BedrockModel.CLAUDE_3_HAIKU]:
            # Anthropic Claude-3 format
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": config.max_tokens,
                "temperature": config.temperature,
                "top_p": config.top_p,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            if system_prompt:
                body["system"] = system_prompt
                
        elif model == BedrockModel.LLAMA_2_70B:
            # Meta Llama-2 format
            body = {
                "prompt": f"<s>[INST] {prompt} [/INST]",
                "max_gen_len": config.max_tokens,
                "temperature": config.temperature,
                "top_p": config.top_p
            }
        
        try:
            response = self.client.invoke_model(
                modelId=config.model_id,
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json"
            )
            
            response_body = json.loads(response['body'].read())
            
            # Extract text based on model type
            if model in [BedrockModel.CLAUDE_3_SONNET, BedrockModel.CLAUDE_3_HAIKU]:
                return {
                    "text": response_body["content"][0]["text"],
                    "usage": response_body.get("usage", {}),
                    "model": model.value
                }
            elif model == BedrockModel.LLAMA_2_70B:
                return {
                    "text": response_body["generation"],
                    "usage": {
                        "prompt_tokens": response_body.get("prompt_token_count", 0),
                        "completion_tokens": response_body.get("generation_token_count", 0)
                    },
                    "model": model.value
                }
                
        except Exception as e:
            raise Exception(f"Bedrock model invocation failed: {str(e)}")

# Example integration in agent orchestrator
class AgentOrchestrator:
    def __init__(self):
        self.bedrock_router = BedrockModelRouter()
    
    async def process_message(self, message: str, agent_type: str) -> Dict:
        # Calculate complexity
        complexity = await self.calculate_complexity(message)
        
        # Route to appropriate model
        model = await self.bedrock_router.route_request(
            query=message,
            agent_type=agent_type,
            complexity_score=complexity
        )
        
        # Generate system prompt based on agent type
        system_prompt = self.get_agent_system_prompt(agent_type)
        
        # Invoke Bedrock model
        response = await self.bedrock_router.invoke_model(
            model=model,
            prompt=message,
            system_prompt=system_prompt
        )
        
        return response
```

---

## 🔄 GitOps with ArgoCD

### 🔄 GitFlow Strategy

```mermaid
graph TB
    subgraph "Development Flow"
        DEV_BRANCH[feature/dev-branch]
        DEVELOP[develop]
        MAIN[main]
        RELEASE[release/v1.x]
        HOTFIX[hotfix/critical-fix]
    end
    
    subgraph "CI Pipeline (Jenkins)"
        BUILD[Build & Test]
        SECURITY[Security Scan]
        PACKAGE[Package Docker]
        PUSH_ECR[Push to ECR]
    end
    
    subgraph "CD Pipeline (ArgoCD)"
        DEV_SYNC[Dev Environment<br/>Auto-Sync]
        STAGING_SYNC[Staging Environment<br/>Manual Sync]
        PROD_SYNC[Production Environment<br/>Manual Approval]
    end
    
    subgraph "K8s Manifests Repository"
        DEV_MANIFESTS[dev/manifests]
        STAGING_MANIFESTS[staging/manifests]
        PROD_MANIFESTS[production/manifests]
    end
    
    DEV_BRANCH --> BUILD
    DEVELOP --> BUILD
    MAIN --> BUILD
    RELEASE --> BUILD
    
    BUILD --> SECURITY
    SECURITY --> PACKAGE
    PACKAGE --> PUSH_ECR
    
    PUSH_ECR --> DEV_MANIFESTS
    DEV_MANIFESTS --> DEV_SYNC
    
    DEVELOP --> STAGING_MANIFESTS
    STAGING_MANIFESTS --> STAGING_SYNC
    
    MAIN --> PROD_MANIFESTS
    PROD_MANIFESTS --> PROD_SYNC
```

### ⚙️ ArgoCD Application Configuration

```yaml
# argocd/applications/nura-dev.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nura-dev
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: nura
  source:
    repoURL: https://github.com/nura-ai/k8s-manifests
    targetRevision: HEAD
    path: environments/development
    helm:
      valueFiles:
        - values-dev.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: nura-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

---
# argocd/applications/nura-staging.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nura-staging
  namespace: argocd
spec:
  project: nura
  source:
    repoURL: https://github.com/nura-ai/k8s-manifests
    targetRevision: develop
    path: environments/staging
    helm:
      valueFiles:
        - values-staging.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: nura-staging
  syncPolicy:
    automated:
      prune: false
      selfHeal: false
    syncOptions:
      - CreateNamespace=true
    manual: true  # Requires manual approval

---
# argocd/applications/nura-production.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nura-production
  namespace: argocd
spec:
  project: nura
  source:
    repoURL: https://github.com/nura-ai/k8s-manifests
    targetRevision: main
    path: environments/production
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: nura-production
  syncPolicy:
    manual: true  # Production requires manual approval
    syncOptions:
      - CreateNamespace=true
      - RespectIgnoreDifferences=true
```

### ⚙️ ArgoCD Project Configuration

```yaml
# argocd/projects/nura-project.yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: nura
  namespace: argocd
spec:
  description: Nura AI System Project
  
  # Source repositories
  sourceRepos:
    - 'https://github.com/nura-ai/k8s-manifests'
    - 'https://github.com/nura-ai/helm-charts'
  
  # Destination clusters and namespaces
  destinations:
    - namespace: 'nura-*'
      server: https://kubernetes.default.svc
    - namespace: argocd
      server: https://kubernetes.default.svc
  
  # Cluster resource allowlist
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
    - group: 'rbac.authorization.k8s.io'
      kind: ClusterRole
    - group: 'rbac.authorization.k8s.io'
      kind: ClusterRoleBinding
    - group: 'networking.k8s.io'
      kind: Ingress
  
  # Namespace resource allowlist
  namespaceResourceWhitelist:
    - group: ''
      kind: ConfigMap
    - group: ''
      kind: Secret
    - group: ''
      kind: Service
    - group: 'apps'
      kind: Deployment
    - group: 'apps'
      kind: StatefulSet
    - group: 'batch'
      kind: Job
    - group: 'batch'
      kind: CronJob
  
  # Security policies
  roles:
    - name: developer
      description: Developer access
      policies:
        - p, proj:nura:developer, applications, get, nura/*, allow
        - p, proj:nura:developer, applications, sync, nura/nura-dev, allow
      groups:
        - nura:developers
    
    - name: devops
      description: DevOps full access
      policies:
        - p, proj:nura:devops, applications, *, nura/*, allow
        - p, proj:nura:devops, repositories, *, *, allow
      groups:
        - nura:devops
```

---

## 🚀 Jenkins Enterprise CI/CD

### 🚀 Jenkinsfile Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:20.10.17-dind
    securityContext:
      privileged: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
  - name: aws-cli
    image: amazon/aws-cli:latest
    command:
    - cat
    tty: true
  - name: python
    image: python:3.11-slim
    command:
    - cat
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }
    
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        ECR_REPOSITORY = 'nura'
        EKS_CLUSTER_NAME = 'nura-cluster'
        ARGOCD_SERVER = 'argocd.nura.ai'
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    env.BRANCH_NAME = env.GIT_BRANCH.replaceAll('origin/', '')
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                container('python') {
                    sh '''
                        pip install --upgrade pip
                        pip install -r backend/requirements.txt
                        pip install -r backend/requirements-test.txt
                    '''
                }
            }
        }
        
        stage('Parallel Testing') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        container('python') {
                            sh '''
                                cd backend
                                pytest tests/unit/ --cov=src --cov-report=xml --junitxml=reports/unit-tests.xml
                            '''
                        }
                    }
                    post {
                        always {
                            junit 'backend/reports/unit-tests.xml'
                            publishCoverage adapters: [
                                coberturaAdapter('backend/coverage.xml')
                            ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        container('python') {
                            sh '''
                                cd backend
                                docker-compose -f docker-compose.test.yml up -d postgres redis
                                sleep 10
                                pytest tests/integration/ --junitxml=reports/integration-tests.xml
                                docker-compose -f docker-compose.test.yml down
                            '''
                        }
                    }
                    post {
                        always {
                            junit 'backend/reports/integration-tests.xml'
                        }
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        container('python') {
                            sh '''
                                pip install bandit safety
                                bandit -r backend/src -f json -o bandit-report.json || true
                                safety check --json --output safety-report.json || true
                            '''
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: '*-report.json', allowEmptyArchive: true
                        }
                    }
                }
            }
        }
        
        stage('Build and Push Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'feature/*'
                }
            }
            steps {
                container('aws-cli') {
                    sh '''
                        aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
                    '''
                }
                container('docker') {
                    sh '''
                        cd backend
                        docker build -t $ECR_REPOSITORY:$IMAGE_TAG --target production .
                        docker tag $ECR_REPOSITORY:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
                        docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
                        
                        # Tag latest for main branch
                        if [ "$BRANCH_NAME" = "main" ]; then
                            docker tag $ECR_REPOSITORY:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$ECR_REPOSITORY:latest
                            docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$ECR_REPOSITORY:latest
                        fi
                    '''
                }
            }
        }
        
        stage('Update GitOps Repository') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    withCredentials([gitUsernamePassword(credentialsId: 'github-gitops-token', gitToolName: 'Default')]) {
                        sh '''
                            git config --global user.email "jenkins@nura.ai"
                            git config --global user.name "Jenkins CI"
                            
                            # Clone GitOps repository
                            git clone https://github.com/nura-ai/k8s-manifests.git gitops-repo
                            cd gitops-repo
                            
                            # Determine environment based on branch
                            if [ "$BRANCH_NAME" = "main" ]; then
                                ENV="production"
                            elif [ "$BRANCH_NAME" = "develop" ]; then
                                ENV="staging"
                            fi
                            
                            # Update image tag in values file
                            sed -i "s|tag: .*|tag: $IMAGE_TAG|g" environments/$ENV/values.yaml
                            
                            # Commit and push changes
                            git add environments/$ENV/values.yaml
                            git commit -m "Update image tag to $IMAGE_TAG for $ENV environment"
                            git push origin main
                        '''
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                anyOf {
                    branch 'feature/*'
                    branch 'develop'
                }
            }
            steps {
                container('kubectl') {
                    sh '''
                        # ArgoCD CLI deployment trigger
                        argocd app sync nura-dev --server $ARGOCD_SERVER --auth-token $ARGOCD_TOKEN
                        argocd app wait nura-dev --timeout 600 --server $ARGOCD_SERVER --auth-token $ARGOCD_TOKEN
                    '''
                }
            }
        }
        
        stage('Approval for Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def deploy = input message: 'Deploy to Production?',
                                     ok: 'Deploy',
                                     parameters: [
                                         choice(name: 'ENVIRONMENT', choices: ['staging', 'production'], description: 'Target Environment'),
                                         booleanParam(name: 'RUN_SMOKE_TESTS', defaultValue: true, description: 'Run smoke tests after deployment')
                                     ]
                    
                    env.TARGET_ENV = deploy.ENVIRONMENT
                    env.RUN_SMOKE_TESTS = deploy.RUN_SMOKE_TESTS
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    environment name: 'TARGET_ENV', value: 'production'
                }
            }
            steps {
                container('kubectl') {
                    sh '''
                        # Sync ArgoCD application for production
                        argocd app sync nura-production --server $ARGOCD_SERVER --auth-token $ARGOCD_TOKEN
                        argocd app wait nura-production --timeout 900 --server $ARGOCD_SERVER --auth-token $ARGOCD_TOKEN
                        
                        # Health check
                        kubectl rollout status deployment/nura-core -n nura-production --timeout=600s
                    '''
                }
            }
        }
        
        stage('Smoke Tests') {
            when {
                allOf {
                    branch 'main'
                    environment name: 'RUN_SMOKE_TESTS', value: 'true'
                }
            }
            steps {
                container('python') {
                    sh '''
                        cd tests/smoke
                        python -m pytest smoke_tests.py --env=production --junitxml=smoke-test-results.xml
                    '''
                }
            }
            post {
                always {
                    junit 'tests/smoke/smoke-test-results.xml'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    slackSend channel: '#deployments',
                             color: 'good',
                             message: "✅ Nura Production Deployment Successful - Build ${env.BUILD_NUMBER}"
                }
            }
        }
        
        failure {
            slackSend channel: '#alerts',
                     color: 'danger',
                     message: "❌ Nura Build Failed - Branch: ${env.BRANCH_NAME}, Build: ${env.BUILD_NUMBER}"
        }
    }
}
```

---

## ⚙️ Infrastructure Components Enhancement

### ⚙️ Additional Infrastructure Components

```hcl
# opentofu/bedrock.tf
# AWS Bedrock Configuration
resource "aws_bedrock_model_invocation_logging_configuration" "main" {
  logging_config {
    cloud_watch_config {
      log_group_name = aws_cloudwatch_log_group.bedrock_logs.name
      role_arn      = aws_iam_role.bedrock_logging.arn
    }
    
    s3_config {
      bucket_name = aws_s3_bucket.bedrock_logs.id
      key_prefix  = "bedrock-logs/"
    }
    
    embedding_data_delivery_enabled = true
    image_data_delivery_enabled     = true
    text_data_delivery_enabled      = true
  }
}

resource "aws_cloudwatch_log_group" "bedrock_logs" {
  name              = "/aws/bedrock/nura"
  retention_in_days = 30
}

# SageMaker Endpoint for custom models
resource "aws_sagemaker_endpoint" "custom_llm" {
  count = var.environment == "production" ? 1 : 0
  
  name                 = "${var.project_name}-custom-llm"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.custom_llm[0].name
  
  tags = {
    Name = "${var.project_name}-custom-llm-endpoint"
  }
}

resource "aws_sagemaker_endpoint_configuration" "custom_llm" {
  count = var.environment == "production" ? 1 : 0
  
  name = "${var.project_name}-custom-llm-config"
  
  production_variants {
    variant_name           = "primary"
    model_name            = aws_sagemaker_model.custom_llm[0].name
    initial_instance_count = 1
    instance_type         = "ml.g4dn.xlarge"
    initial_variant_weight = 1
  }
}

# Jenkins Infrastructure
resource "aws_instance" "jenkins_master" {
  count = var.environment == "production" ? 1 : 0
  
  ami           = data.aws_ami.jenkins.id
  instance_type = "t3.large"
  
  subnet_id                   = module.vpc.private_subnets[0]
  vpc_security_group_ids      = [aws_security_group.jenkins.id]
  associate_public_ip_address = false
  
  iam_instance_profile = aws_iam_instance_profile.jenkins[0].name
  
  user_data = base64encode(templatefile("${path.module}/jenkins-userdata.sh", {
    efs_id = aws_efs_file_system.jenkins[0].id
  }))
  
  tags = {
    Name = "${var.project_name}-jenkins-master"
  }
}

resource "aws_efs_file_system" "jenkins" {
  count = var.environment == "production" ? 1 : 0
  
  creation_token = "${var.project_name}-jenkins-efs"
  encrypted      = true
  
  tags = {
    Name = "${var.project_name}-jenkins-efs"
  }
}

# ArgoCD Infrastructure
resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
  
  depends_on = [module.eks]
}

resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = kubernetes_namespace.argocd.metadata[0].name
  version    = "5.46.7"
  
  values = [
    templatefile("${path.module}/argocd-values.yaml", {
      hostname = var.argocd_hostname
      certificate_arn = var.ssl_certificate_arn
    })
  ]
  
  depends_on = [
    module.eks,
    kubernetes_namespace.argocd
  ]
}

# Prometheus & Grafana for monitoring
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = "51.9.4"
  
  create_namespace = true
  
  values = [
    file("${path.module}/prometheus-values.yaml")
  ]
  
  depends_on = [module.eks]
}
```

---

## 📦 Containerization Strategy

### 🐳 Docker Architecture

```dockerfile
# Backend Microkernel - Dockerfile
FROM python:3.11-slim as base

# Production optimizations
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Create non-root user
RUN groupadd -r nura && useradd -r -g nura nura
RUN chown -R nura:nura /app
USER nura

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# Multi-stage build for different environments
FROM base as development
ENV ENVIRONMENT=development
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base as production
ENV ENVIRONMENT=production
CMD ["gunicorn", "src.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### 🐳 Docker Compose Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Backend Services
  nura-core:
    build:
      context: ./backend
      target: development
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://nura:nura@postgres:5432/nura_dev
      - REDIS_URL=redis://redis:6379/0
      - AWS_ENDPOINT_URL=http://localstack:4566
    volumes:
      - ./backend:/app
      - /app/venv
    depends_on:
      - postgres
      - redis
      - localstack
    networks:
      - nura-network

  # Database
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: nura_dev
      POSTGRES_USER: nura
      POSTGRES_PASSWORD: nura
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - nura-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - nura-network

  # Local AWS Services (LocalStack)
  localstack:
    image: localstack/localstack:2.3
    ports:
      - "4566:4566"
    environment:
      - SERVICES=lambda,bedrock,s3,secretsmanager
      - DEBUG=1
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "./localstack:/tmp/localstack"
    networks:
      - nura-network

  # Frontend Development
  frontend-streamlit:
    build: ./frontend/streamlit
    ports:
      - "8501:8501"
    environment:
      - API_BASE_URL=http://nura-core:8000
    volumes:
      - ./frontend/streamlit:/app
    depends_on:
      - nura-core
    networks:
      - nura-network

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - nura-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    networks:
      - nura-network

volumes:
  postgres_data:
  redis_data:
  grafana_data:

networks:
  nura-network:
    driver: bridge
```

---

## ☸️ Kubernetes Deployment (EKS)

### ☸️ EKS Cluster Configuration

```yaml
# k8s/cluster/eks-cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: nura-cluster
  region: us-east-1
  version: "1.28"

# VPC Configuration
vpc:
  cidr: "10.0.0.0/16"
  nat:
    gateway: Single # Single NAT Gateway for cost optimization

# Node Groups
nodeGroups:
  # General purpose nodes
  - name: general-purpose
    instanceType: t3.medium
    minSize: 1
    maxSize: 10
    desiredCapacity: 3
    volumeSize: 20
    volumeType: gp3
    ssh:
      allow: false
    labels:
      workload-type: general
    tags:
      Environment: production
      Project: nura
      
  # GPU-optimized nodes for LLM workloads
  - name: gpu-optimized
    instanceType: g4dn.xlarge
    minSize: 0
    maxSize: 5
    desiredCapacity: 1
    volumeSize: 50
    volumeType: gp3
    labels:
      workload-type: gpu
      accelerator: nvidia-tesla-t4
    taints:
      - key: nvidia.com/gpu
        value: "true"
        effect: NoSchedule

# Add-ons
addons:
  - name: vpc-cni
    version: latest
  - name: coredns
    version: latest
  - name: kube-proxy
    version: latest
  - name: aws-ebs-csi-driver
    version: latest

# CloudWatch logging
cloudWatch:
  clusterLogging:
    enable:
      - audit
      - authenticator
      - controllerManager
```

### Application Deployments

```yaml
# k8s/deployments/nura-core-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nura-core
  namespace: default
  labels:
    app: nura-core
    tier: backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: nura-core
  template:
    metadata:
      labels:
        app: nura-core
    spec:
      serviceAccountName: nura-core-sa
      containers:
      - name: nura-core
        image: nura/core:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: nura-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: nura-secrets
              key: redis-url
        - name: AWS_REGION
          value: "us-east-1"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
      nodeSelector:
        workload-type: general

---
apiVersion: v1
kind: Service
metadata:
  name: nura-core-service
  labels:
    app: nura-core
spec:
  selector:
    app: nura-core
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nura-core-ingress
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/ssl-redirect: "443"
spec:
  tls:
  - hosts:
    - api.nura.ai
    secretName: nura-tls
  rules:
  - host: api.nura.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nura-core-service
            port:
              number: 80
```

### GPU-Optimized LLM Deployment

```yaml
# k8s/deployments/llm-processor-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-processor
  labels:
    app: llm-processor
    tier: ml
spec:
  replicas: 2
  selector:
    matchLabels:
      app: llm-processor
  template:
    metadata:
      labels:
        app: llm-processor
    spec:
      tolerations:
      - key: nvidia.com/gpu
        operator: Equal
        value: "true"
        effect: NoSchedule
      containers:
      - name: llm-processor
        image: nura/llm-processor:latest
        ports:
        - containerPort: 8001
        env:
        - name: MODEL_NAME
          value: "claude-3-sonnet"
        - name: GPU_MEMORY_FRACTION
          value: "0.8"
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "8Gi"
            cpu: "2"
          requests:
            nvidia.com/gpu: 1
            memory: "4Gi"
            cpu: "1"
        volumeMounts:
        - name: model-cache
          mountPath: /models
      volumes:
      - name: model-cache
        persistentVolumeClaim:
          claimName: model-cache-pvc
      nodeSelector:
        workload-type: gpu
        accelerator: nvidia-tesla-t4

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: model-cache-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
  storageClassName: gp3
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: nura
  EKS_CLUSTER_NAME: nura-cluster

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: nura_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r backend/requirements.txt
        pip install -r backend/requirements-test.txt

    - name: Run database migrations
      run: |
        cd backend
        alembic upgrade head
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/nura_test

    - name: Run tests
      run: |
        cd backend
        pytest --cov=src --cov-report=xml
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/nura_test
        REDIS_URL: redis://localhost:6379/0

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        target: production
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --region ${{ env.AWS_REGION }} --name ${{ env.EKS_CLUSTER_NAME }}-staging

    - name: Deploy to staging
      run: |
        sed -i 's|IMAGE_TAG|${{ needs.build.outputs.image-tag }}|g' k8s/deployments/nura-core-deployment.yaml
        kubectl apply -f k8s/deployments/ -n staging
        kubectl rollout status deployment/nura-core -n staging --timeout=300s

    - name: Run smoke tests
      run: |
        kubectl wait --for=condition=available --timeout=300s deployment/nura-core -n staging
        # Run basic health checks
        STAGING_URL=$(kubectl get ingress nura-core-ingress -n staging -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        curl -f http://$STAGING_URL/health

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --region ${{ env.AWS_REGION }} --name ${{ env.EKS_CLUSTER_NAME }}

    - name: Deploy to production with blue-green
      run: |
        # Blue-green deployment strategy
        sed -i 's|IMAGE_TAG|${{ needs.build.outputs.image-tag }}|g' k8s/deployments/nura-core-deployment.yaml
        
        # Deploy green version
        kubectl apply -f k8s/deployments/ -l version=green
        kubectl rollout status deployment/nura-core-green --timeout=600s
        
        # Health checks on green
        kubectl wait --for=condition=available --timeout=300s deployment/nura-core-green
        
        # Switch traffic to green
        kubectl patch service nura-core-service -p '{"spec":{"selector":{"version":"green"}}}'
        
        # Remove blue version after successful deployment
        kubectl delete deployment nura-core-blue --ignore-not-found=true

  security-scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ needs.build.outputs.image-tag }}
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
```

---

## Infrastructure as Code (OpenTofu)

### ¿Por qué OpenTofu?

**OpenTofu** es un fork open-source de Terraform mantenido por la Linux Foundation que garantiza:

- **✅ Licencia Open Source**: Licencia MPL-2.0 que garantiza acceso gratuito permanente
- **✅ Compatibilidad 100%**: Compatible con Terraform 1.5.x+ y todos los providers
- **✅ Desarrollo Activo**: Comunidad activa con updates regulares y new features
- **✅ Independencia**: No dependes de decisiones comerciales de HashiCorp
- **✅ Enterprise Ready**: Soporte para state encryption, remote backends, y enterprise features
- **✅ Registry Independiente**: OpenTofu Registry con providers y modules validados

### Migración desde Terraform

```bash
# Instalación OpenTofu
# macOS
brew install opentofu

# Linux
curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh | sh

# Windows
choco install opentofu

# Migración simple: reemplazar 'terraform' por 'tofu'
tofu init
tofu plan
tofu apply
```

### Main Infrastructure

```hcl
# opentofu/main.tf
# OpenTofu configuration - 100% compatible with Terraform syntax
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # Will use OpenTofu Registry automatically
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "s3" {
    bucket         = "nura-opentofu-state"
    key            = "production/opentofu.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "nura-opentofu-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "nura"
      Environment = var.environment
      ManagedBy   = "opentofu"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs             = data.aws_availability_zones.available.names
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  single_nat_gateway = var.environment != "production"
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = var.cluster_name
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster endpoint configuration
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true
  cluster_endpoint_public_access_cidrs = var.allowed_cidr_blocks

  # Cluster add-ons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # Node groups
  eks_managed_node_groups = {
    general = {
      min_size     = 1
      max_size     = 10
      desired_size = 3

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"

      labels = {
        workload-type = "general"
      }

      tags = {
        "k8s.io/cluster-autoscaler/enabled" = "true"
        "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
      }
    }

    gpu = {
      min_size     = 0
      max_size     = 5
      desired_size = 1

      instance_types = ["g4dn.xlarge"]
      capacity_type  = "ON_DEMAND"

      labels = {
        workload-type = "gpu"
        accelerator   = "nvidia-tesla-t4"
      }

      taints = {
        nvidia-gpu = {
          key    = "nvidia.com/gpu"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }

      tags = {
        "k8s.io/cluster-autoscaler/enabled" = "true"
        "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
        "k8s.io/cluster-autoscaler/node-template/label/workload-type" = "gpu"
      }
    }
  }
}

# RDS PostgreSQL with pgvector
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "${var.project_name} DB subnet group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-postgres"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"

  performance_insights_enabled = var.environment == "production"
  monitoring_interval         = var.environment == "production" ? 60 : 0
  monitoring_role_arn        = var.environment == "production" ? aws_iam_role.rds_enhanced_monitoring[0].arn : null

  tags = {
    Name = "${var.project_name}-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = {
    Name = "${var.project_name}-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-redis"
  description                = "Redis cluster for ${var.project_name}"

  port                = 6379
  parameter_group_name = "default.redis7"
  node_type           = var.redis_node_type
  num_cache_clusters  = var.redis_num_cache_nodes

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token

  tags = {
    Name = "${var.project_name}-redis"
  }
}

# Application Load Balancer
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "main" {
  bucket = "${var.project_name}-storage-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "${var.project_name}-main-storage"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "main" {
  bucket = aws_s3_bucket.main.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/eks/${var.cluster_name}/application"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = {
    Environment = var.environment
    Application = var.project_name
  }
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = module.eks.cluster_iam_role_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_name" {
  description = "The name/id of the EKS cluster"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}
```

### Variables

```hcl
# opentofu/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "nura"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "nura-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access EKS cluster endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Database variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "RDS max allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "nura"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "nura"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Redis variables
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 1
}

variable "redis_auth_token" {
  description = "Redis auth token"
  type        = string
  sensitive   = true
}
```

### OpenTofu Deployment Commands

```bash
# Infrastructure deployment with OpenTofu
cd opentofu/

# Initialize OpenTofu (downloads providers from OpenTofu Registry)
tofu init

# Validate configuration
tofu validate

# Plan infrastructure changes
tofu plan -var-file="environments/production.tfvars"

# Apply infrastructure changes
tofu apply -var-file="environments/production.tfvars"

# Destroy infrastructure (careful!)
tofu destroy -var-file="environments/production.tfvars"

# State management
tofu state list
tofu state show aws_eks_cluster.main
tofu import aws_instance.example i-abcd1234

# Multi-environment deployment
for env in development staging production; do
  echo "Deploying to $env environment..."
  tofu workspace select $env || tofu workspace new $env
  tofu plan -var-file="environments/$env.tfvars"
  tofu apply -var-file="environments/$env.tfvars" -auto-approve
done
```

### Environment-Specific Variables

```hcl
# opentofu/environments/production.tfvars
environment = "production"
cluster_name = "nura-cluster-prod"
kubernetes_version = "1.28"

# Instance sizing for production
db_instance_class = "db.r6g.large"
redis_node_type = "cache.r6g.large"

# Security
allowed_cidr_blocks = ["10.0.0.0/8", "172.16.0.0/12"]

# Secrets (use AWS Secrets Manager or environment variables)
db_password = "PLACEHOLDER_USE_SECRETS_MANAGER"
redis_auth_token = "PLACEHOLDER_USE_SECRETS_MANAGER"
```

```hcl
# opentofu/environments/development.tfvars
environment = "development"
cluster_name = "nura-cluster-dev"
kubernetes_version = "1.28"

# Smaller instances for development
db_instance_class = "db.t3.micro"
redis_node_type = "cache.t3.micro"

# More open access for development
allowed_cidr_blocks = ["0.0.0.0/0"]
```

---

## Monitoring & Observability

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Kubernetes API server
  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
    - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
    - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
      action: keep
      regex: default;kubernetes;https

  # Kubernetes nodes
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
    - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
    - action: labelmap
      regex: __meta_kubernetes_node_label_(.+)

  # Kubernetes pods
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
      action: replace
      target_label: __metrics_path__
      regex: (.+)
    - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
      action: replace
      regex: ([^:]+)(?::\d+)?;(\d+)
      replacement: $1:$2
      target_label: __address__

  # Nura application metrics
  - job_name: 'nura-core'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      action: keep
      regex: nura-core
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
      action: replace
      target_label: __address__
      regex: ([^:]+)(?::\d+)?;(\d+)
      replacement: $1:$2

  # AWS CloudWatch metrics
  - job_name: 'cloudwatch'
    ec2_sd_configs:
    - region: us-east-1
      port: 9100
    relabel_configs:
    - source_labels: [__meta_ec2_tag_Environment]
      target_label: environment
```

### Alert Rules

```yaml
# monitoring/alert_rules.yml
groups:
- name: nura.rules
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }} for {{ $labels.job }}"

  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1.0
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected"
      description: "95th percentile latency is {{ $value }}s for {{ $labels.job }}"

  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total[15m]) * 60 * 15 > 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Pod is crash looping"
      description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping"

  - alert: DatabaseConnections
    expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "PostgreSQL connection usage high"
      description: "Database connection usage is {{ $value | humanizePercentage }}"

  - alert: RedisMemoryUsage
    expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Redis memory usage high"
      description: "Redis memory usage is {{ $value | humanizePercentage }}"
```

---

## Disaster Recovery Strategy

### Backup Strategy

```yaml
# backup/backup-strategy.yml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: pg-dump
            image: postgres:15
            command:
            - /bin/bash
            - -c
            - |
              pg_dump $DATABASE_URL > /backup/nura-$(date +%Y%m%d-%H%M%S).sql
              aws s3 cp /backup/nura-$(date +%Y%m%d-%H%M%S).sql s3://nura-backups/database/
              # Keep only last 30 days of backups
              aws s3 ls s3://nura-backups/database/ | sort | head -n -30 | awk '{print $4}' | xargs -I {} aws s3 rm s3://nura-backups/database/{}
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: nura-secrets
                  key: database-url
            - name: AWS_DEFAULT_REGION
              value: "us-east-1"
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            emptyDir: {}
          restartPolicy: OnFailure
```

### Multi-Region Failover

```hcl
# opentofu/disaster-recovery.tf
# Cross-region RDS read replica
resource "aws_db_instance" "replica" {
  count = var.environment == "production" ? 1 : 0

  identifier = "${var.project_name}-replica-${var.dr_region}"

  replicate_source_db = aws_db_instance.main.identifier

  instance_class = var.db_instance_class
  
  # Different region for DR
  provider = aws.dr_region

  skip_final_snapshot = false
  backup_retention_period = 7

  tags = {
    Name = "${var.project_name}-dr-replica"
    Purpose = "disaster-recovery"
  }
}

# S3 cross-region replication
resource "aws_s3_bucket_replication_configuration" "main" {
  count = var.environment == "production" ? 1 : 0

  role   = aws_iam_role.replication[0].arn
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "replicate-to-dr"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.dr[0].arn
      storage_class = "STANDARD_IA"
    }
  }

  depends_on = [aws_s3_bucket_versioning.main]
}

# DR region S3 bucket
resource "aws_s3_bucket" "dr" {
  count = var.environment == "production" ? 1 : 0

  bucket = "${var.project_name}-dr-storage-${random_id.bucket_suffix.hex}"
  
  provider = aws.dr_region

  tags = {
    Name = "${var.project_name}-dr-storage"
    Purpose = "disaster-recovery"
  }
}
```

Esta arquitectura de deployment proporciona:

1. **✅ Multi-Region Deployment**: Primary (us-east-1) + DR (eu-west-1) para máxima disponibilidad
2. **✅ Hybrid Serverless**: Lambda + EKS optimizado para diferentes workloads
3. **✅ Auto-Scaling**: Horizontal scaling basado en métricas reales
4. **✅ CI/CD Pipeline**: GitHub Actions con testing, security scanning y blue-green deployment
5. **✅ Infrastructure as Code**: OpenTofu completo con multi-environment support
6. **✅ Monitoring & Observability**: Prometheus + Grafana + CloudWatch integrados
7. **✅ Disaster Recovery**: Cross-region replication y backup automático
8. **✅ Security**: Network segmentation, encryption at rest/transit, IAM least privilege

## 3. Análisis de Componentes de Infraestructura Identificados

### Componentes Adicionales Integrados

#### 🚀 **AWS Bedrock Integration**
- **Claude-3 Sonnet**: Main reasoning y architectural decisions
- **Claude-3 Haiku**: Quick responses y simple queries  
- **Llama-2 70B**: Code analysis y debugging
- **Amazon Titan**: Embeddings para Advanced RAG
- **Cohere Command**: Summarization y content generation
- **Smart Router**: Routing inteligente basado en complejidad y agent type

#### 🔄 **GitOps con ArgoCD**
- **Development Environment**: Auto-sync para rapid iteration
- **Staging Environment**: Manual approval para validation
- **Production Environment**: Manual approval + smoke tests
- **Multi-Repository**: Separate repos para application code y k8s manifests
- **RBAC Integration**: Role-based access con developers y devops roles

#### 🏗️ **Jenkins Enterprise CI/CD**
- **Kubernetes Agents**: Dynamic pod creation para isolated builds
- **Parallel Testing**: Unit, integration y security scans en paralelo
- **Security Scanning**: Bandit, Safety, Trivy integration
- **GitOps Integration**: Automatic manifest updates post-build
- **Blue-Green Deployments**: Zero-downtime production deployments

#### 📊 **Enhanced Monitoring & Observability**
- **Prometheus Stack**: Metrics collection con custom Nura metrics
- **Grafana Dashboards**: LLM cost tracking, agent performance, system health
- **AWS CloudWatch**: Bedrock invocation logs y model performance
- **Alert Manager**: Proactive alerting para performance degradation
- **Distributed Tracing**: Request flow tracking across microservices

#### 🔐 **Enterprise Security Enhancements**
- **AWS Secrets Manager**: Centralized secrets management
- **IAM Roles & Policies**: Least privilege access patterns
- **Network Segmentation**: Private subnets, security groups, NACLs
- **Encryption**: At-rest y in-transit para todos los components
- **Compliance Logging**: Audit trails para regulatory compliance

#### ⚡ **Performance & Scalability Additions**
- **SageMaker Endpoints**: Custom model hosting para specialized workloads
- **ElastiCache Redis Cluster**: Distributed caching para low latency
- **CloudFront CDN**: Global content delivery para frontend assets
- **Auto Scaling Groups**: Dynamic scaling basado en demand patterns
- **Spot Instances**: Cost optimization para non-critical workloads

### Diagrama de Infraestructura Completo

```mermaid
graph TB
    subgraph "Global Layer"
        CF[CloudFront CDN]
        R53[Route 53 DNS]
        WAF[AWS WAF]
    end
    
    subgraph "CI/CD & GitOps"
        GITHUB[GitHub Source]
        JENKINS[Jenkins CI/CD]
        ARGOCD[ArgoCD GitOps]
        ECR[Amazon ECR]
        GITOPS_REPO[K8s Manifests Repo]
    end
    
    subgraph "Primary Region: us-east-1"
        subgraph "EKS Cluster"
            NURA_CORE[Nura Core Service]
            AGENTS[Agent Orchestrator]
            RAG_SERVICE[Advanced RAG Service]
            OAUTH_SERVICE[OAuth Service]
        end
        
        subgraph "Managed AI Services"
            BEDROCK[AWS Bedrock Models]
            SAGEMAKER[SageMaker Endpoints]
            LAMBDA[Lambda Functions]
        end
        
        subgraph "Data Layer"
            RDS_PRIMARY[RDS PostgreSQL + pgvector]
            RDS_REPLICA1[Read Replica 1]
            RDS_REPLICA2[Read Replica 2]
            REDIS_CLUSTER[ElastiCache Redis Cluster]
        end
        
        subgraph "Monitoring Stack"
            PROMETHEUS[Prometheus]
            GRAFANA[Grafana]
            ALERTMANAGER[Alert Manager]
            CLOUDWATCH[CloudWatch]
        end
        
        subgraph "Security & Secrets"
            SECRETS[AWS Secrets Manager]
            IAM[IAM Roles & Policies]
            VPC[VPC with Private Subnets]
        end
        
        subgraph "Storage & Backup"
            S3_PRIMARY[S3 Primary Bucket]
            EFS[EFS for Jenkins]
            BACKUP_VAULT[AWS Backup Vault]
        end
    end
    
    subgraph "DR Region: eu-west-1"
        EKS_DR[EKS DR Cluster]
        RDS_DR[RDS Cross-Region Replica]
        S3_DR[S3 DR Bucket]
        REDIS_DR[Redis DR Cluster]
    end
    
    %% Flow Connections
    CF --> WAF
    WAF --> R53
    R53 --> EKS_CLUSTER
    
    GITHUB --> JENKINS
    JENKINS --> ECR
    JENKINS --> GITOPS_REPO
    GITOPS_REPO --> ARGOCD
    ARGOCD --> EKS_CLUSTER
    
    NURA_CORE --> AGENTS
    AGENTS --> RAG_SERVICE
    AGENTS --> BEDROCK
    AGENTS --> SAGEMAKER
    NURA_CORE --> RDS_PRIMARY
    NURA_CORE --> REDIS_CLUSTER
    OAUTH_SERVICE --> SECRETS
    
    RDS_PRIMARY --> RDS_DR
    S3_PRIMARY --> S3_DR
    REDIS_CLUSTER --> REDIS_DR
    
    EKS_CLUSTER --> PROMETHEUS
    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERTMANAGER
    BEDROCK --> CLOUDWATCH
```

### Estimación de Costos AWS (Mensual)

| Componente | Tipo Instancia | Costo Estimado (USD) |
|------------|---------------|----------------------|
| **EKS Cluster** | Control Plane | $73 |
| **EC2 Nodes** | 3x t3.medium | $95 |
| **GPU Nodes** | 1x g4dn.xlarge | $320 |
| **RDS PostgreSQL** | db.t3.medium | $65 |
| **ElastiCache Redis** | cache.t3.medium | $45 |
| **AWS Bedrock** | Pay-per-use | $200-500 |
| **SageMaker** | ml.g4dn.xlarge | $280 |
| **Jenkins Instance** | t3.large | $67 |
| **S3 Storage** | 1TB + DR | $45 |
| **CloudWatch Logs** | 50GB/month | $25 |
| **Data Transfer** | Multi-region | $50 |
| **Load Balancers** | 2x ALB | $35 |
| **Route 53** | Hosted zones | $10 |
| **NAT Gateway** | 2x regions | $65 |
| **Total Estimado** | | **$1,380-1,680** |

### Checklist de Componentes Implementados

#### ✅ **Core Infrastructure**
- [x] Multi-region AWS deployment (us-east-1, eu-west-1)
- [x] EKS cluster con auto-scaling y GPU nodes
- [x] RDS PostgreSQL con pgvector extension
- [x] ElastiCache Redis para caching
- [x] VPC con network segmentation

#### ✅ **AI/ML Platform**
- [x] AWS Bedrock integration (Claude-3, Llama-2, Titan)
- [x] SageMaker endpoints para custom models
- [x] Lambda functions para orchestration
- [x] Smart model routing basado en complexity

#### ✅ **CI/CD & GitOps**
- [x] Jenkins enterprise CI/CD pipeline
- [x] ArgoCD GitOps deployment
- [x] GitHub integration con branch strategies
- [x] Amazon ECR para container registry
- [x] Multi-environment deployment (dev, staging, prod)

#### ✅ **Monitoring & Observability**
- [x] Prometheus + Grafana stack
- [x] CloudWatch integration
- [x] Alert Manager para notifications
- [x] Custom metrics para LLM usage y costs
- [x] Distributed tracing capabilities

#### ✅ **Security & Compliance**
- [x] AWS Secrets Manager integration
- [x] IAM roles con least privilege
- [x] Network security (Security Groups, NACLs)
- [x] Encryption at rest y in transit
- [x] Audit logging y compliance tracking

#### ✅ **Storage & Backup**
- [x] S3 buckets con cross-region replication
- [x] EFS para persistent storage (Jenkins)
- [x] AWS Backup para automated snapshots
- [x] Database backup strategies

#### ✅ **Disaster Recovery**
- [x] Cross-region database replication
- [x] Multi-AZ deployment architecture
- [x] Automated failover mechanisms
- [x] Backup retention policies
- [x] DR testing procedures

El sistema está preparado para **escalabilidad global** y **alta disponibilidad** con **deployment automático**, **GitOps workflows**, **AWS Bedrock integration**, y **recovery procedures** completamente probados y documentados.