# SageMaker BGE-M3 Implementation Guide - Nura Project

**Document Version**: 1.0  
**Last Updated**: September 13, 2025  
**Project**: Nura AI-first Onboarding Platform

## Executive Summary

This document provides the complete technical implementation guide for deploying BGE-M3 embeddings model on AWS SageMaker for the Nura project. The implementation ensures 100% embedding consistency, cost optimization through auto-scaling, and seamless integration with the existing FastAPI backend.

## Architecture Overview

### Deployment Strategy
```yaml
sagemaker_architecture:
  model: "BAAI/bge-m3"
  instance_type: "ml.g4dn.large"
  deployment_type: "Real-time endpoint"
  auto_scaling: "0-5 instances"
  integration: "FastAPI backend via boto3"
  cost_optimization: "Scale-to-zero during low usage"
```

### Cost Analysis Comparison

| Deployment Option | Monthly Cost | Setup Time | Operational Overhead | Recommendation |
|-------------------|--------------|------------|---------------------|----------------|
| **SageMaker** | $180-220/mes | 1-2 days | Zero (fully managed) | ✅ **RECOMMENDED** |
| Self-hosted EKS | $186-986/mes | 1-2 weeks | High (K8s expertise) | ❌ Not recommended |
| Hugging Face API | $50-100/mes | 1 day | Low (rate limited) | 🔄 Development only |

## Step-by-Step Implementation

### Phase 1: Model Preparation (Day 1)

#### 1.1 Create SageMaker Model
```python
# sagemaker_deployment.py
import boto3
import sagemaker
from sagemaker.huggingface import HuggingFaceModel

def create_bge_m3_model():
    """Create BGE-M3 model for SageMaker deployment"""
    
    # Hugging Face Model configuration
    huggingface_model = HuggingFaceModel(
        model_data="s3://sagemaker-models/bge-m3/model.tar.gz",
        transformers_version="4.21",
        pytorch_version="1.12",
        py_version="py39",
        role=sagemaker.get_execution_role(),
        env={
            'HF_MODEL_ID': 'BAAI/bge-m3',
            'HF_TASK': 'feature-extraction',
            'MAX_BATCH_SIZE': '32',
            'MAX_SEQUENCE_LENGTH': '512'
        }
    )
    
    return huggingface_model
```

#### 1.2 Endpoint Configuration
```python
# endpoint_config.py
from sagemaker import Model
from datetime import datetime

def create_endpoint_config():
    """Configure SageMaker endpoint with auto-scaling"""
    
    endpoint_config_name = f"nura-bge-m3-config-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    endpoint_config = {
        'EndpointConfigName': endpoint_config_name,
        'ProductionVariants': [{
            'VariantName': 'primary-variant',
            'ModelName': 'nura-bge-m3-model',
            'InitialInstanceCount': 1,
            'InstanceType': 'ml.g4dn.large',
            'InitialVariantWeight': 1.0,
            'ServerlessConfig': {
                'MemorySizeInMB': 6144,
                'MaxConcurrency': 20,
                'ProvisionedConcurrency': 0  # Scale to zero
            }
        }]
    }
    
    return endpoint_config
```

### Phase 2: Auto-Scaling Setup (Day 1-2)

#### 2.1 Auto-Scaling Policy
```python
# auto_scaling.py
import boto3

def setup_auto_scaling():
    """Configure auto-scaling for cost optimization"""
    
    autoscaling_client = boto3.client('application-autoscaling')
    
    # Register scalable target
    autoscaling_client.register_scalable_target(
        ServiceNamespace='sagemaker',
        ResourceId='endpoint/nura-bge-m3-endpoint/variant/primary-variant',
        ScalableDimension='sagemaker:variant:DesiredInstanceCount',
        MinCapacity=0,  # Scale to zero for cost savings
        MaxCapacity=5,  # Handle multi-tenant load
        RoleArn='arn:aws:iam::ACCOUNT:role/SageMakerAutoScalingRole'
    )
    
    # Create scaling policy
    autoscaling_client.put_scaling_policy(
        PolicyName='nura-bge-m3-scaling-policy',
        ServiceNamespace='sagemaker',
        ResourceId='endpoint/nura-bge-m3-endpoint/variant/primary-variant',
        ScalableDimension='sagemaker:variant:DesiredInstanceCount',
        PolicyType='TargetTrackingScaling',
        TargetTrackingScalingPolicyConfiguration={
            'TargetValue': 70.0,
            'PredefinedMetricSpecification': {
                'PredefinedMetricType': 'SageMakerVariantInvocationsPerInstance'
            },
            'ScaleOutCooldown': 300,
            'ScaleInCooldown': 300
        }
    )
```

### Phase 3: FastAPI Integration (Day 2)

#### 3.1 Embedding Service Implementation
```python
# nura_embedding_service.py
import boto3
import json
import asyncio
from typing import List, Dict, Any
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class NuraSageMakerEmbeddingService:
    def __init__(self, endpoint_name: str = "nura-bge-m3-endpoint"):
        self.endpoint_name = endpoint_name
        self.sagemaker_runtime = boto3.client(
            'sagemaker-runtime',
            region_name='us-east-1'
        )
        
    async def get_embeddings(
        self, 
        texts: List[str], 
        batch_size: int = 32
    ) -> List[List[float]]:
        """
        Generate embeddings using SageMaker BGE-M3 endpoint
        
        Args:
            texts: List of text strings to embed
            batch_size: Batch size for processing
            
        Returns:
            List of embedding vectors
        """
        try:
            all_embeddings = []
            
            # Process in batches for optimal performance
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                
                # Prepare payload for SageMaker
                payload = {
                    "inputs": batch_texts,
                    "parameters": {
                        "normalize": True,
                        "pooling": "cls",
                        "truncate": True
                    }
                }
                
                # Invoke SageMaker endpoint
                response = await self._invoke_endpoint(payload)
                batch_embeddings = self._parse_response(response)
                
                all_embeddings.extend(batch_embeddings)
                
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Embedding service error: {str(e)}"
            )
    
    async def _invoke_endpoint(self, payload: Dict[Any, Any]) -> Dict:
        """Async wrapper for SageMaker endpoint invocation"""
        
        def _sync_invoke():
            return self.sagemaker_runtime.invoke_endpoint(
                EndpointName=self.endpoint_name,
                ContentType='application/json',
                Body=json.dumps(payload),
                Accept='application/json'
            )
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, _sync_invoke)
        
        return json.loads(response['Body'].read().decode('utf-8'))
    
    def _parse_response(self, response: Dict) -> List[List[float]]:
        """Parse SageMaker response to extract embeddings"""
        
        if 'embeddings' in response:
            return response['embeddings']
        elif isinstance(response, list):
            return response
        else:
            raise ValueError(f"Unexpected response format: {response}")
    
    async def embed_code(self, code_snippets: List[str]) -> List[List[float]]:
        """Specialized method for code embeddings"""
        
        # Add code-specific preprocessing if needed
        processed_snippets = [
            f"Code: {snippet}" for snippet in code_snippets
        ]
        
        return await self.get_embeddings(processed_snippets)
    
    async def embed_docs(self, documents: List[str]) -> List[List[float]]:
        """Specialized method for documentation embeddings"""
        
        # Add doc-specific preprocessing if needed
        processed_docs = [
            f"Documentation: {doc}" for doc in documents
        ]
        
        return await self.get_embeddings(processed_docs)
    
    async def embed_business(self, processes: List[str]) -> List[List[float]]:
        """Specialized method for business context embeddings"""
        
        # Add business-specific preprocessing if needed
        processed_processes = [
            f"Business Process: {process}" for process in processes
        ]
        
        return await self.get_embeddings(processed_processes)
```

#### 3.2 FastAPI Endpoints
```python
# api/embeddings.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from nura_embedding_service import NuraSageMakerEmbeddingService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/embeddings", tags=["embeddings"])

# Initialize embedding service
embedding_service = NuraSageMakerEmbeddingService()

class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100)
    context_type: Optional[str] = Field("general", regex="^(code|docs|business|general)$")
    normalize: bool = Field(True)

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    count: int
    model: str = "BGE-M3"
    service: str = "SageMaker"

@router.post("/generate", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """
    Generate embeddings for input texts using SageMaker BGE-M3
    """
    try:
        # Route to specialized methods based on context
        if request.context_type == "code":
            embeddings = await embedding_service.embed_code(request.texts)
        elif request.context_type == "docs":
            embeddings = await embedding_service.embed_docs(request.texts)
        elif request.context_type == "business":
            embeddings = await embedding_service.embed_business(request.texts)
        else:
            embeddings = await embedding_service.get_embeddings(request.texts)
        
        return EmbeddingResponse(
            embeddings=embeddings,
            count=len(embeddings)
        )
        
    except Exception as e:
        logger.error(f"Embedding generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embeddings: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for embedding service"""
    try:
        # Test with a simple embedding
        test_embedding = await embedding_service.get_embeddings(["Health check"])
        
        return {
            "status": "healthy",
            "service": "SageMaker BGE-M3",
            "endpoint": embedding_service.endpoint_name,
            "embedding_dimensions": len(test_embedding[0]) if test_embedding else 0
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
```

### Phase 4: Monitoring & Optimization (Day 2-3)

#### 4.1 CloudWatch Monitoring
```python
# monitoring.py
import boto3
from datetime import datetime, timedelta

def setup_cloudwatch_monitoring():
    """Setup CloudWatch monitoring for SageMaker endpoint"""
    
    cloudwatch = boto3.client('cloudwatch')
    
    # Custom metrics for Nura-specific monitoring
    metrics = [
        {
            'MetricName': 'EmbeddingRequestLatency',
            'Unit': 'Milliseconds',
            'Dimensions': [
                {
                    'Name': 'EndpointName',
                    'Value': 'nura-bge-m3-endpoint'
                }
            ]
        },
        {
            'MetricName': 'EmbeddingBatchSize',
            'Unit': 'Count',
            'Dimensions': [
                {
                    'Name': 'EndpointName',
                    'Value': 'nura-bge-m3-endpoint'
                }
            ]
        },
        {
            'MetricName': 'CostPerEmbedding',
            'Unit': 'None',
            'Dimensions': [
                {
                    'Name': 'EndpointName',
                    'Value': 'nura-bge-m3-endpoint'
                }
            ]
        }
    ]
    
    # Create CloudWatch alarms for cost monitoring
    cloudwatch.put_metric_alarm(
        AlarmName='Nura-SageMaker-HighCost',
        ComparisonOperator='GreaterThanThreshold',
        EvaluationPeriods=1,
        MetricName='ModelInvocations',
        Namespace='AWS/SageMaker',
        Period=3600,
        Statistic='Sum',
        Threshold=10000,  # Adjust based on expected usage
        ActionsEnabled=True,
        AlarmActions=[
            'arn:aws:sns:us-east-1:ACCOUNT:nura-cost-alerts'
        ],
        AlarmDescription='Alert when SageMaker usage exceeds cost threshold',
        Dimensions=[
            {
                'Name': 'EndpointName',
                'Value': 'nura-bge-m3-endpoint'
            },
        ]
    )
```

#### 4.2 Performance Optimization
```python
# optimization.py
import asyncio
import time
from functools import wraps
from typing import List, Tuple

def optimize_batch_processing(func):
    """Decorator to optimize batch processing for embeddings"""
    
    @wraps(func)
    async def wrapper(self, texts: List[str], **kwargs) -> List[List[float]]:
        start_time = time.time()
        
        # Dynamic batch size based on text length
        avg_length = sum(len(text) for text in texts) / len(texts)
        
        if avg_length < 100:
            batch_size = 64  # Smaller texts, larger batches
        elif avg_length < 300:
            batch_size = 32  # Medium texts, medium batches
        else:
            batch_size = 16  # Larger texts, smaller batches
        
        result = await func(self, texts, batch_size=batch_size, **kwargs)
        
        # Log performance metrics
        elapsed_time = time.time() - start_time
        embeddings_per_second = len(texts) / elapsed_time
        
        print(f"Processed {len(texts)} embeddings in {elapsed_time:.2f}s "
              f"({embeddings_per_second:.1f} embeddings/sec)")
        
        return result
    
    return wrapper

# Apply optimization to embedding service
NuraSageMakerEmbeddingService.get_embeddings = optimize_batch_processing(
    NuraSageMakerEmbeddingService.get_embeddings
)
```

## Integration with Nura Architecture

### Vector Storage Integration
```python
# vector_storage.py
import asyncpg
import json
from typing import List, Dict, Any
import numpy as np

class NuraVectorStorage:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.embedding_service = NuraSageMakerEmbeddingService()
    
    async def store_embeddings(
        self, 
        texts: List[str], 
        context_type: str, 
        metadata: List[Dict[Any, Any]]
    ):
        """Store texts and their embeddings in PostgreSQL + pgvector"""
        
        # Generate embeddings via SageMaker
        embeddings = await self.embedding_service.get_embeddings(texts)
        
        # Store in PostgreSQL
        conn = await asyncpg.connect(self.db_url)
        
        try:
            for text, embedding, meta in zip(texts, embeddings, metadata):
                await conn.execute("""
                    INSERT INTO nura_embeddings (
                        text_content, 
                        embedding_vector, 
                        context_type, 
                        metadata,
                        created_at
                    ) VALUES ($1, $2, $3, $4, NOW())
                """, 
                text, 
                embedding,  # pgvector handles list conversion
                context_type,
                json.dumps(meta)
                )
        finally:
            await conn.close()
    
    async def semantic_search(
        self, 
        query: str, 
        context_type: str = None, 
        limit: int = 10
    ) -> List[Dict[Any, Any]]:
        """Perform semantic search using SageMaker embeddings"""
        
        # Generate query embedding
        query_embedding = await self.embedding_service.get_embeddings([query])
        query_vector = query_embedding[0]
        
        # Search in PostgreSQL using pgvector
        conn = await asyncpg.connect(self.db_url)
        
        try:
            sql = """
                SELECT 
                    text_content,
                    metadata,
                    embedding_vector <-> $1 as distance
                FROM nura_embeddings
            """
            
            params = [query_vector]
            
            if context_type:
                sql += " WHERE context_type = $2"
                params.append(context_type)
            
            sql += " ORDER BY distance LIMIT ${}".format(len(params) + 1)
            params.append(limit)
            
            results = await conn.fetch(sql, *params)
            
            return [
                {
                    "text": row["text_content"],
                    "metadata": json.loads(row["metadata"]),
                    "similarity": 1 - row["distance"]  # Convert distance to similarity
                }
                for row in results
            ]
            
        finally:
            await conn.close()
```

## Deployment Checklist

### Pre-Deployment Validation
- [ ] AWS SageMaker permissions configured
- [ ] BGE-M3 model uploaded to S3
- [ ] Auto-scaling policies tested
- [ ] CloudWatch monitoring setup
- [ ] Cost alerts configured
- [ ] FastAPI integration tested

### Performance Benchmarks
```yaml
performance_targets:
  latency: "<100ms per embedding"
  throughput: ">1000 embeddings/minute"
  availability: ">99.9% uptime"
  cost: "<$220/mes with auto-scaling"
  
validation_tests:
  - Single text embedding latency
  - Batch processing (32 texts)
  - Auto-scaling under load
  - Scale-to-zero functionality
  - Error handling and recovery
```

### Production Readiness
- [ ] Load testing completed
- [ ] Failover mechanisms tested
- [ ] Monitoring dashboards created
- [ ] Cost optimization verified
- [ ] Documentation updated
- [ ] Team training completed

## Cost Optimization Strategies

### 1. Auto-Scaling Configuration
- **Scale to Zero**: During off-hours (nights, weekends)
- **Predictive Scaling**: Based on usage patterns
- **Multi-AZ**: Only in production, not MVP

### 2. Instance Optimization
- **ml.g4dn.large**: Best cost/performance for BGE-M3
- **Spot Instances**: Not available for SageMaker endpoints
- **Reserved Capacity**: Consider after MVP validation

### 3. Monitoring & Alerts
- **Daily Cost Reports**: Automated via CloudWatch
- **Usage Thresholds**: Alert at 80% of budget
- **Performance Tracking**: Cost per embedding metric

## Conclusion

This SageMaker BGE-M3 implementation provides Nura with a fully managed, cost-optimized, and scalable embedding service that integrates seamlessly with the existing AWS architecture (Bedrock + RDS). The solution eliminates operational overhead while providing enterprise-grade reliability and performance.

**Expected Benefits**:
- **Reduced Setup Time**: 1-2 days vs 1-2 weeks
- **Zero Operational Overhead**: Fully managed by AWS
- **Cost Optimization**: Auto-scaling with scale-to-zero
- **Perfect Integration**: Native AWS ecosystem compatibility
- **Enterprise Reliability**: 99.9% uptime SLA

**Next Steps**:
1. Deploy SageMaker endpoint (Day 1)
2. Integrate with FastAPI backend (Day 2)
3. Performance testing and optimization (Day 3)
4. Production monitoring setup (Day 3-5)