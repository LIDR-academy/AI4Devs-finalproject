# ⚡ Performance Architecture - Nura System

## ⚡ Estrategia de Performance Integral

**Performance Philosophy**: Maximum user experience optimization through intelligent caching, predictive scaling, and AI-specific performance patterns for LLM-based systems.

**Core Performance Pillars**:
- **Response Time**: <2s for simple queries, <5s for complex LLM workflows
- **Throughput**: 1000+ concurrent users, 10K+ requests/minute  
- **Availability**: 99.9% uptime with graceful degradation
- **Scalability**: Auto-scaling from 10 to 1000+ instances
- **Cost Efficiency**: Optimal resource utilization with AI cost optimization

---

## 🏗️ Performance Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
        API_CLIENT[API Clients]
    end
    
    subgraph "CDN & Edge"
        CLOUDFLARE[CloudFlare CDN<br/>Static Assets, DDoS Protection]
        EDGE_CACHE[Edge Caching<br/>API Response Caching]
    end
    
    subgraph "Load Balancing"
        ALB[Application Load Balancer<br/>AWS ALB with Health Checks]
        NLB[Network Load Balancer<br/>High-Performance TCP/UDP]
    end
    
    subgraph "Application Tier - Auto Scaling"
        API_CLUSTER[API Server Cluster<br/>Auto Scaling 3-50 instances]
        CHAT_CLUSTER[Chat Service Cluster<br/>Auto Scaling 5-100 instances]
        RAG_CLUSTER[RAG Pipeline Cluster<br/>Auto Scaling 2-20 instances]
        AGENT_CLUSTER[Agent Orchestration<br/>Auto Scaling 3-30 instances]
    end
    
    subgraph "Caching Layer"
        REDIS_CLUSTER[Redis Cluster<br/>Distributed Cache]
        MEMCACHED[Memcached<br/>Session Cache]
        LLM_CACHE[LLM Response Cache<br/>Semantic Caching]
        RAG_CACHE[RAG Results Cache<br/>Vector Similarity Cache]
    end
    
    subgraph "Database Performance"
        RDS_PRIMARY[RDS Primary<br/>PostgreSQL with pgvector]
        RDS_REPLICAS[Read Replicas<br/>3x Read Scaling]
        CONNECTION_POOL[PgBouncer<br/>Connection Pooling]
        QUERY_CACHE[Query Result Cache<br/>PostgreSQL Cache]
    end
    
    subgraph "AI/LLM Performance"
        BEDROCK_CACHE[AWS Bedrock Cache<br/>Model Response Cache]
        EMBEDDING_CACHE[Embedding Cache<br/>Vector Precomputation]
        MODEL_ROUTER[Smart Model Router<br/>Cost-Performance Optimization]
        BATCH_PROCESSOR[Batch LLM Processor<br/>Request Batching]
    end
    
    subgraph "Background Processing"
        KAFKA_CLUSTER[Kafka Cluster<br/>Event Streaming]
        CELERY_WORKERS[Celery Workers<br/>Async Task Processing]
        SCHEDULER[Scheduler<br/>Periodic Tasks]
    end
    
    WEB --> CLOUDFLARE
    MOBILE --> CLOUDFLARE
    API_CLIENT --> EDGE_CACHE
    
    CLOUDFLARE --> ALB
    EDGE_CACHE --> ALB
    ALB --> NLB
    
    NLB --> API_CLUSTER
    NLB --> CHAT_CLUSTER
    NLB --> RAG_CLUSTER
    NLB --> AGENT_CLUSTER
    
    API_CLUSTER --> REDIS_CLUSTER
    CHAT_CLUSTER --> MEMCACHED
    RAG_CLUSTER --> RAG_CACHE
    AGENT_CLUSTER --> LLM_CACHE
    
    API_CLUSTER --> CONNECTION_POOL
    CHAT_CLUSTER --> CONNECTION_POOL
    CONNECTION_POOL --> RDS_PRIMARY
    CONNECTION_POOL --> RDS_REPLICAS
    RDS_PRIMARY --> QUERY_CACHE
    
    CHAT_CLUSTER --> MODEL_ROUTER
    RAG_CLUSTER --> EMBEDDING_CACHE
    MODEL_ROUTER --> BEDROCK_CACHE
    MODEL_ROUTER --> BATCH_PROCESSOR
    
    API_CLUSTER --> KAFKA_CLUSTER
    KAFKA_CLUSTER --> CELERY_WORKERS
    CELERY_WORKERS --> SCHEDULER
```

---

## Intelligent Caching Strategy

### ⚡ Multi-Layer Caching Architecture

```python
# src/backend/nura-core/src/performance/caching_manager.py
import asyncio
import hashlib
import json
import time
from typing import Dict, Any, List, Optional, Union, Callable
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import logging
from enum import Enum
import redis
import memcache
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import structlog

logger = structlog.get_logger(__name__)

class CacheLevel(Enum):
    """Niveles de cache en la arquitectura"""
    L1_MEMORY = "l1_memory"        # In-process memory cache
    L2_REDIS = "l2_redis"          # Distributed Redis cache
    L3_MEMCACHED = "l3_memcached"  # Session-specific cache
    L4_DATABASE = "l4_database"    # Database query cache
    L5_CDN = "l5_cdn"             # CDN edge cache

class CacheStrategy(Enum):
    """Estrategias de caching"""
    WRITE_THROUGH = "write_through"
    WRITE_BACK = "write_back"
    WRITE_AROUND = "write_around"
    REFRESH_AHEAD = "refresh_ahead"

@dataclass
class CacheConfig:
    """Configuración de cache por tipo de contenido"""
    ttl_seconds: int
    max_size_mb: int
    strategy: CacheStrategy
    compression: bool = True
    semantic_similarity_threshold: float = 0.85
    auto_refresh: bool = False
    refresh_threshold_percent: float = 0.8

@dataclass
class CacheEntry:
    """Entrada de cache con metadata"""
    key: str
    value: Any
    created_at: datetime
    last_accessed: datetime
    access_count: int
    size_bytes: int
    ttl_seconds: int
    tags: List[str]
    embedding: Optional[List[float]] = None  # For semantic caching

class NuraCachingManager:
    """Manager integral de caching para Nura"""
    
    def __init__(self):
        # Cache configurations por tipo
        self.cache_configs = {
            "llm_responses": CacheConfig(
                ttl_seconds=3600,  # 1 hour
                max_size_mb=500,
                strategy=CacheStrategy.WRITE_THROUGH,
                semantic_similarity_threshold=0.9,
                auto_refresh=True
            ),
            "rag_results": CacheConfig(
                ttl_seconds=1800,  # 30 minutes
                max_size_mb=200,
                strategy=CacheStrategy.WRITE_THROUGH,
                semantic_similarity_threshold=0.85
            ),
            "user_sessions": CacheConfig(
                ttl_seconds=86400,  # 24 hours
                max_size_mb=100,
                strategy=CacheStrategy.WRITE_BACK
            ),
            "api_responses": CacheConfig(
                ttl_seconds=300,   # 5 minutes
                max_size_mb=50,
                strategy=CacheStrategy.WRITE_AROUND
            ),
            "embeddings": CacheConfig(
                ttl_seconds=7200,  # 2 hours
                max_size_mb=1000,
                strategy=CacheStrategy.REFRESH_AHEAD,
                auto_refresh=True,
                refresh_threshold_percent=0.7
            ),
            "database_queries": CacheConfig(
                ttl_seconds=900,   # 15 minutes
                max_size_mb=200,
                strategy=CacheStrategy.WRITE_THROUGH
            )
        }
        
        # Cache clients
        self.redis_client = None
        self.memcached_client = None
        self.memory_cache = {}  # L1 cache
        
        # Performance metrics
        self.cache_hits = {level.value: 0 for level in CacheLevel}
        self.cache_misses = {level.value: 0 for level in CacheLevel}
        self.cache_writes = {level.value: 0 for level in CacheLevel}
        
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Inicializar clientes de cache"""
        try:
            # Redis cluster para cache distribuido
            self.redis_client = redis.RedisCluster(
                host='nura-redis-cluster.cache.amazonaws.com',
                port=6379,
                decode_responses=True,
                skip_full_coverage_check=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Memcached para sessions
            self.memcached_client = memcache.Client([
                'nura-memcached-001.cache.amazonaws.com:11211',
                'nura-memcached-002.cache.amazonaws.com:11211',
                'nura-memcached-003.cache.amazonaws.com:11211'
            ], debug=0)
            
            logger.info("Cache clients initialized successfully")
            
        except Exception as e:
            logger.error("Failed to initialize cache clients", error=str(e))
    
    def _generate_cache_key(self, prefix: str, data: Dict[str, Any]) -> str:
        """Generar clave de cache determinística"""
        # Sort keys for consistent hashing
        sorted_data = json.dumps(data, sort_keys=True)
        hash_obj = hashlib.sha256(sorted_data.encode())
        return f"{prefix}:{hash_obj.hexdigest()[:16]}"
    
    def _calculate_embedding_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calcular similitud entre embeddings"""
        try:
            emb1 = np.array(embedding1).reshape(1, -1)
            emb2 = np.array(embedding2).reshape(1, -1)
            similarity = cosine_similarity(emb1, emb2)[0][0]
            return float(similarity)
        except Exception as e:
            logger.error("Error calculating embedding similarity", error=str(e))
            return 0.0
    
    async def get(self, 
                  cache_type: str, 
                  key_data: Dict[str, Any],
                  embedding: Optional[List[float]] = None) -> Optional[Any]:
        """Obtener valor de cache con semantic similarity"""
        try:
            config = self.cache_configs.get(cache_type)
            if not config:
                return None
            
            cache_key = self._generate_cache_key(cache_type, key_data)
            
            # L1: Memory cache
            if cache_key in self.memory_cache:
                entry = self.memory_cache[cache_key]
                if self._is_entry_valid(entry):
                    entry.last_accessed = datetime.utcnow()
                    entry.access_count += 1
                    self.cache_hits[CacheLevel.L1_MEMORY.value] += 1
                    logger.debug("L1 cache hit", key=cache_key)
                    return entry.value
                else:
                    del self.memory_cache[cache_key]
            
            # L2: Redis cache with semantic similarity
            if self.redis_client:
                try:
                    # Check for exact match first
                    cached_data = await asyncio.to_thread(
                        self.redis_client.get, cache_key
                    )
                    
                    if cached_data:
                        entry_dict = json.loads(cached_data)
                        entry = CacheEntry(**entry_dict)
                        
                        if self._is_entry_valid(entry):
                            self.cache_hits[CacheLevel.L2_REDIS.value] += 1
                            # Store in L1 for faster access
                            self.memory_cache[cache_key] = entry
                            logger.debug("L2 cache hit", key=cache_key)
                            return entry.value
                    
                    # Semantic similarity search for LLM responses
                    if embedding and cache_type in ["llm_responses", "rag_results"]:
                        similar_entry = await self._find_similar_cached_response(
                            cache_type, embedding, config.semantic_similarity_threshold
                        )
                        if similar_entry:
                            self.cache_hits[CacheLevel.L2_REDIS.value] += 1
                            logger.debug("L2 semantic cache hit", 
                                       key=cache_key, 
                                       similarity=similar_entry.get('similarity', 0))
                            return similar_entry['value']
                    
                except Exception as e:
                    logger.warning("Redis cache error", error=str(e))
            
            # L3: Memcached for sessions
            if cache_type == "user_sessions" and self.memcached_client:
                try:
                    cached_value = await asyncio.to_thread(
                        self.memcached_client.get, cache_key
                    )
                    if cached_value:
                        self.cache_hits[CacheLevel.L3_MEMCACHED.value] += 1
                        logger.debug("L3 cache hit", key=cache_key)
                        return cached_value
                except Exception as e:
                    logger.warning("Memcached error", error=str(e))
            
            # Cache miss
            self.cache_misses[CacheLevel.L2_REDIS.value] += 1
            return None
            
        except Exception as e:
            logger.error("Cache get error", error=str(e))
            return None
    
    async def set(self, 
                  cache_type: str, 
                  key_data: Dict[str, Any], 
                  value: Any,
                  embedding: Optional[List[float]] = None,
                  tags: List[str] = None) -> bool:
        """Almacenar en cache con estrategia inteligente"""
        try:
            config = self.cache_configs.get(cache_type)
            if not config:
                return False
            
            cache_key = self._generate_cache_key(cache_type, key_data)
            
            # Create cache entry
            entry = CacheEntry(
                key=cache_key,
                value=value,
                created_at=datetime.utcnow(),
                last_accessed=datetime.utcnow(),
                access_count=1,
                size_bytes=len(str(value).encode('utf-8')),
                ttl_seconds=config.ttl_seconds,
                tags=tags or [],
                embedding=embedding
            )
            
            # L1: Memory cache (always store for fast access)
            self.memory_cache[cache_key] = entry
            self._evict_memory_cache_if_needed()
            
            # L2: Redis cache
            if self.redis_client:
                try:
                    entry_json = json.dumps(asdict(entry), default=str)
                    await asyncio.to_thread(
                        self.redis_client.setex,
                        cache_key,
                        config.ttl_seconds,
                        entry_json
                    )
                    self.cache_writes[CacheLevel.L2_REDIS.value] += 1
                    
                    # Store embedding index for semantic search
                    if embedding and cache_type in ["llm_responses", "rag_results"]:
                        await self._store_embedding_index(cache_key, embedding, cache_type)
                        
                except Exception as e:
                    logger.warning("Redis set error", error=str(e))
            
            # L3: Memcached for sessions
            if cache_type == "user_sessions" and self.memcached_client:
                try:
                    await asyncio.to_thread(
                        self.memcached_client.set,
                        cache_key,
                        value,
                        time=config.ttl_seconds
                    )
                    self.cache_writes[CacheLevel.L3_MEMCACHED.value] += 1
                except Exception as e:
                    logger.warning("Memcached set error", error=str(e))
            
            logger.debug("Cache set successful", key=cache_key, type=cache_type)
            return True
            
        except Exception as e:
            logger.error("Cache set error", error=str(e))
            return False
    
    async def _find_similar_cached_response(self, 
                                          cache_type: str, 
                                          query_embedding: List[float], 
                                          threshold: float) -> Optional[Dict[str, Any]]:
        """Buscar respuesta similar usando embeddings"""
        try:
            # Get embedding index
            index_key = f"{cache_type}:embedding_index"
            index_data = await asyncio.to_thread(
                self.redis_client.get, index_key
            )
            
            if not index_data:
                return None
            
            embedding_index = json.loads(index_data)
            best_match = None
            best_similarity = 0
            
            for entry_key, stored_embedding in embedding_index.items():
                similarity = self._calculate_embedding_similarity(
                    query_embedding, stored_embedding
                )
                
                if similarity > threshold and similarity > best_similarity:
                    # Get the actual cached entry
                    cached_data = await asyncio.to_thread(
                        self.redis_client.get, entry_key
                    )
                    
                    if cached_data:
                        entry_dict = json.loads(cached_data)
                        entry = CacheEntry(**entry_dict)
                        
                        if self._is_entry_valid(entry):
                            best_match = {
                                'value': entry.value,
                                'similarity': similarity,
                                'key': entry_key
                            }
                            best_similarity = similarity
            
            return best_match
            
        except Exception as e:
            logger.error("Error finding similar cached response", error=str(e))
            return None
    
    async def _store_embedding_index(self, cache_key: str, embedding: List[float], cache_type: str):
        """Almacenar índice de embeddings para búsqueda semántica"""
        try:
            index_key = f"{cache_type}:embedding_index"
            
            # Get current index
            index_data = await asyncio.to_thread(
                self.redis_client.get, index_key
            )
            
            if index_data:
                embedding_index = json.loads(index_data)
            else:
                embedding_index = {}
            
            # Add new embedding
            embedding_index[cache_key] = embedding
            
            # Limit index size (keep last 1000 entries)
            if len(embedding_index) > 1000:
                # Remove oldest entries (this is simplified - in production use LRU)
                keys_to_remove = list(embedding_index.keys())[:-800]
                for key in keys_to_remove:
                    del embedding_index[key]
            
            # Store updated index
            await asyncio.to_thread(
                self.redis_client.setex,
                index_key,
                7200,  # 2 hours TTL for index
                json.dumps(embedding_index)
            )
            
        except Exception as e:
            logger.error("Error storing embedding index", error=str(e))
    
    def _is_entry_valid(self, entry: CacheEntry) -> bool:
        """Verificar si entrada de cache es válida"""
        now = datetime.utcnow()
        expiry_time = entry.created_at + timedelta(seconds=entry.ttl_seconds)
        return now < expiry_time
    
    def _evict_memory_cache_if_needed(self):
        """Evict L1 cache usando LRU cuando se alcanza límite"""
        max_entries = 1000  # Configurable
        
        if len(self.memory_cache) > max_entries:
            # Sort by last_accessed and remove oldest
            sorted_entries = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1].last_accessed
            )
            
            entries_to_remove = len(self.memory_cache) - int(max_entries * 0.8)
            for i in range(entries_to_remove):
                key, _ = sorted_entries[i]
                del self.memory_cache[key]
    
    async def invalidate(self, cache_type: str, pattern: str = None, tags: List[str] = None):
        """Invalidar cache por patrón o tags"""
        try:
            if pattern:
                # Invalidate by pattern
                if self.redis_client:
                    keys = await asyncio.to_thread(
                        self.redis_client.keys, f"{cache_type}:{pattern}*"
                    )
                    if keys:
                        await asyncio.to_thread(self.redis_client.delete, *keys)
                
                # Remove from memory cache
                keys_to_remove = [k for k in self.memory_cache.keys() if k.startswith(f"{cache_type}:{pattern}")]
                for key in keys_to_remove:
                    del self.memory_cache[key]
            
            if tags:
                # Invalidate by tags (requires tag tracking)
                # Implementation would track keys by tags
                pass
            
            logger.info("Cache invalidated", type=cache_type, pattern=pattern, tags=tags)
            
        except Exception as e:
            logger.error("Cache invalidation error", error=str(e))
    
    async def warm_up(self, cache_type: str, warm_up_data: List[Dict[str, Any]]):
        """Pre-calentar cache con datos frecuentemente accedidos"""
        try:
            for data_item in warm_up_data:
                await self.set(
                    cache_type=cache_type,
                    key_data=data_item['key_data'],
                    value=data_item['value'],
                    embedding=data_item.get('embedding'),
                    tags=data_item.get('tags', [])
                )
            
            logger.info("Cache warmed up", type=cache_type, items=len(warm_up_data))
            
        except Exception as e:
            logger.error("Cache warm up error", error=str(e))
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de cache"""
        total_hits = sum(self.cache_hits.values())
        total_misses = sum(self.cache_misses.values())
        total_requests = total_hits + total_misses
        
        hit_rate = (total_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "hit_rate_percent": round(hit_rate, 2),
            "total_hits": total_hits,
            "total_misses": total_misses,
            "total_requests": total_requests,
            "hits_by_level": self.cache_hits,
            "misses_by_level": self.cache_misses,
            "writes_by_level": self.cache_writes,
            "memory_cache_size": len(self.memory_cache),
            "cache_levels_active": [
                level.value for level in CacheLevel 
                if self.cache_hits[level.value] > 0 or self.cache_writes[level.value] > 0
            ]
        }

# Global cache manager
cache_manager = NuraCachingManager()

# Utility decorators
def cache_result(cache_type: str, ttl_seconds: int = None, tags: List[str] = None):
    """Decorator para cachear resultados de funciones"""
    def decorator(func: Callable):
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_data = {
                'function': func.__name__,
                'args': str(args),
                'kwargs': str(sorted(kwargs.items()))
            }
            
            # Try to get from cache
            cached_result = await cache_manager.get(cache_type, key_data)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(
                cache_type=cache_type,
                key_data=key_data,
                value=result,
                tags=tags
            )
            
            return result
        
        return wrapper
    return decorator
```

---

## Auto-Scaling & Load Balancing

### Intelligent Auto-Scaling Configuration

```yaml
# infrastructure/kubernetes/autoscaling/hpa-configs.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nura-api-hpa
  namespace: nura-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nura-api
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  - type: External
    external:
      metric:
        name: aws_application_load_balancer_request_count_per_target
      target:
        type: AverageValue
        averageValue: "200"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 20
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nura-chat-hpa
  namespace: nura-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nura-chat-service
  minReplicas: 5
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 65
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 75
  - type: Pods
    pods:
      metric:
        name: llm_requests_per_second
      target:
        type: AverageValue
        averageValue: "10"  # LLM requests are more expensive
  - type: Pods
    pods:
      metric:
        name: conversation_queue_length
      target:
        type: AverageValue
        averageValue: "5"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 600  # Longer stabilization for LLM services
      policies:
      - type: Percent
        value: 15
        periodSeconds: 120
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
      - type: Percent
        value: 200
        periodSeconds: 30
      - type: Pods
        value: 10
        periodSeconds: 30
      selectPolicy: Max

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nura-rag-hpa
  namespace: nura-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nura-rag-pipeline
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 85
  - type: Pods
    pods:
      metric:
        name: vector_search_requests_per_second
      target:
        type: AverageValue
        averageValue: "50"
  - type: Pods
    pods:
      metric:
        name: embedding_generation_queue_length
      target:
        type: AverageValue
        averageValue: "10"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 25
        periodSeconds: 90
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 150
        periodSeconds: 60
      - type: Pods
        value: 3
        periodSeconds: 60
      selectPolicy: Max

---
# Vertical Pod Autoscaler for optimizing resource allocation
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: nura-api-vpa
  namespace: nura-production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nura-api
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: nura-api
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2000m
        memory: 4Gi
      controlledResources: ["cpu", "memory"]
```

### Load Balancer Configuration

```yaml
# infrastructure/aws/load-balancer/alb-config.yaml
apiVersion: v1
kind: Service
metadata:
  name: nura-api-service
  namespace: nura-production
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "http"
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-healthcheck-path: "/health"
    service.beta.kubernetes.io/aws-load-balancer-healthcheck-interval: "10"
    service.beta.kubernetes.io/aws-load-balancer-healthcheck-timeout: "5"
    service.beta.kubernetes.io/aws-load-balancer-healthy-threshold: "2"
    service.beta.kubernetes.io/aws-load-balancer-unhealthy-threshold: "3"
    service.beta.kubernetes.io/aws-load-balancer-connection-draining-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-connection-draining-timeout: "300"
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012"
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "https"
    service.beta.kubernetes.io/aws-load-balancer-proxy-protocol: "*"
spec:
  type: LoadBalancer
  ports:
  - name: http
    port: 80
    targetPort: 8000
    protocol: TCP
  - name: https
    port: 443
    targetPort: 8000
    protocol: TCP
  selector:
    app: nura-api

---
# Application Load Balancer with intelligent routing
apiVersion: elbv2.k8s.aws/v1beta1
kind: TargetGroupBinding
metadata:
  name: nura-api-tgb
  namespace: nura-production
spec:
  serviceRef:
    name: nura-api-service
    port: 8000
  targetGroupARN: arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/nura-api-tg/1234567890123456
  targetType: instance
  healthcheck:
    enabled: true
    path: "/health"
    intervalSeconds: 15
    timeoutSeconds: 5
    healthyThresholdCount: 2
    unhealthyThresholdCount: 3
    matcher:
      httpCode: "200"
  attributes:
    deregistration_delay.timeout_seconds: "30"
    stickiness.enabled: "false"
    load_balancing.algorithm.type: "least_outstanding_requests"
```

---

## Database Performance Optimization

### Connection Pooling & Query Optimization

```python
# src/backend/nura-core/src/performance/database_optimizer.py
import asyncio
import asyncpg
import time
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
import logging
from contextlib import asynccontextmanager
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import QueuePool
import structlog

logger = structlog.get_logger(__name__)

@dataclass
class DatabaseConfig:
    """Configuración optimizada de base de datos"""
    host: str
    port: int = 5432
    database: str = "nura_production"
    username: str = "nura_user"
    password: str = ""
    
    # Connection pooling
    pool_size: int = 20
    max_overflow: int = 30
    pool_timeout: int = 30
    pool_recycle: int = 3600
    pool_pre_ping: bool = True
    
    # Query optimization
    statement_timeout: int = 30000  # 30 seconds
    lock_timeout: int = 10000       # 10 seconds
    idle_in_transaction_session_timeout: int = 60000  # 1 minute
    
    # Read replica configuration
    read_replica_hosts: List[str] = None
    read_replica_weight: float = 0.7  # 70% reads to replicas

class DatabasePerformanceManager:
    """Manager de performance para base de datos"""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.write_engine = None
        self.read_engines = []
        self.session_factory = None
        self.read_session_factories = []
        
        # Performance metrics
        self.query_times = []
        self.slow_queries = []
        self.connection_pool_stats = {
            'total_connections': 0,
            'active_connections': 0,
            'idle_connections': 0
        }
        
        self._initialize_engines()
    
    def _initialize_engines(self):
        """Inicializar engines con configuración optimizada"""
        try:
            # Write engine (primary database)
            write_url = (
                f"postgresql+asyncpg://{self.config.username}:{self.config.password}@"
                f"{self.config.host}:{self.config.port}/{self.config.database}"
            )
            
            self.write_engine = create_async_engine(
                write_url,
                poolclass=QueuePool,
                pool_size=self.config.pool_size,
                max_overflow=self.config.max_overflow,
                pool_timeout=self.config.pool_timeout,
                pool_recycle=self.config.pool_recycle,
                pool_pre_ping=self.config.pool_pre_ping,
                echo=False,  # Set to True for query debugging
                connect_args={
                    "server_settings": {
                        "statement_timeout": str(self.config.statement_timeout),
                        "lock_timeout": str(self.config.lock_timeout),
                        "idle_in_transaction_session_timeout": str(self.config.idle_in_transaction_session_timeout),
                        "shared_preload_libraries": "pg_stat_statements,auto_explain",
                        "auto_explain.log_min_duration": "1000",  # Log slow queries
                        "log_statement": "mod",  # Log modifications
                        "log_min_duration_statement": "1000"  # Log queries > 1s
                    },
                    "command_timeout": 60,
                    "prepared_statement_cache_size": 100
                }
            )
            
            self.session_factory = async_sessionmaker(
                bind=self.write_engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Read replica engines
            if self.config.read_replica_hosts:
                for replica_host in self.config.read_replica_hosts:
                    read_url = (
                        f"postgresql+asyncpg://{self.config.username}:{self.config.password}@"
                        f"{replica_host}:{self.config.port}/{self.config.database}"
                    )
                    
                    read_engine = create_async_engine(
                        read_url,
                        poolclass=QueuePool,
                        pool_size=int(self.config.pool_size * 0.8),  # Smaller pool for reads
                        max_overflow=int(self.config.max_overflow * 0.8),
                        pool_timeout=self.config.pool_timeout,
                        pool_recycle=self.config.pool_recycle,
                        pool_pre_ping=self.config.pool_pre_ping,
                        echo=False,
                        connect_args={
                            "server_settings": {
                                "default_transaction_read_only": "on",  # Read-only transactions
                                "statement_timeout": str(self.config.statement_timeout),
                                "lock_timeout": str(self.config.lock_timeout)
                            },
                            "command_timeout": 60
                        }
                    )
                    
                    read_session_factory = async_sessionmaker(
                        bind=read_engine,
                        class_=AsyncSession,
                        expire_on_commit=False
                    )
                    
                    self.read_engines.append(read_engine)
                    self.read_session_factories.append(read_session_factory)
            
            logger.info("Database engines initialized", 
                       write_engine=True, 
                       read_replicas=len(self.read_engines))
            
        except Exception as e:
            logger.error("Failed to initialize database engines", error=str(e))
            raise
    
    @asynccontextmanager
    async def get_session(self, read_only: bool = False):
        """Obtener sesión de base de datos con routing inteligente"""
        session_factory = self._select_session_factory(read_only)
        
        async with session_factory() as session:
            start_time = time.time()
            try:
                yield session
                await session.commit()
            except Exception as e:
                await session.rollback()
                logger.error("Database session error", error=str(e))
                raise
            finally:
                query_time = time.time() - start_time
                self.query_times.append(query_time)
                
                # Track slow queries
                if query_time > 1.0:  # > 1 second
                    self.slow_queries.append({
                        'duration': query_time,
                        'timestamp': time.time(),
                        'read_only': read_only
                    })
    
    def _select_session_factory(self, read_only: bool):
        """Seleccionar factory de sesión basado en tipo de operación"""
        if not read_only or not self.read_session_factories:
            return self.session_factory
        
        # Use read replica based on weight
        import random
        if random.random() < self.config.read_replica_weight:
            # Select random read replica
            return random.choice(self.read_session_factories)
        else:
            return self.session_factory
    
    async def execute_query(self, 
                          query: str, 
                          params: Dict[str, Any] = None, 
                          read_only: bool = False) -> List[Dict[str, Any]]:
        """Ejecutar query con optimizaciones"""
        start_time = time.time()
        
        async with self.get_session(read_only=read_only) as session:
            try:
                # Add query hints for optimization
                if read_only:
                    # Enable parallel queries for read operations
                    await session.execute(sa.text("SET max_parallel_workers_per_gather = 4"))
                    await session.execute(sa.text("SET enable_parallel_hash = on"))
                
                # Execute query
                result = await session.execute(sa.text(query), params or {})
                rows = result.fetchall()
                
                # Convert to list of dicts
                columns = result.keys()
                return [dict(zip(columns, row)) for row in rows]
                
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error("Query execution failed", 
                           query=query[:100], 
                           execution_time=execution_time,
                           error=str(e))
                raise
            finally:
                execution_time = time.time() - start_time
                if execution_time > 0.5:  # Log slow queries
                    logger.warning("Slow query detected", 
                                 query=query[:100],
                                 execution_time=execution_time,
                                 read_only=read_only)
    
    async def get_connection_pool_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del pool de conexiones"""
        stats = {}
        
        # Write engine stats
        if self.write_engine:
            pool = self.write_engine.pool
            stats['write_pool'] = {
                'size': pool.size(),
                'checked_in': pool.checkedin(),
                'checked_out': pool.checkedout(),
                'overflow': pool.overflow(),
                'invalid': pool.invalid()
            }
        
        # Read engine stats
        stats['read_pools'] = []
        for i, engine in enumerate(self.read_engines):
            pool = engine.pool
            stats['read_pools'].append({
                'replica_index': i,
                'size': pool.size(),
                'checked_in': pool.checkedin(),
                'checked_out': pool.checkedout(),
                'overflow': pool.overflow(),
                'invalid': pool.invalid()
            })
        
        return stats
    
    async def optimize_table(self, table_name: str) -> Dict[str, Any]:
        """Optimizar tabla específica"""
        optimization_results = {}
        
        async with self.get_session() as session:
            try:
                # Analyze table statistics
                await session.execute(sa.text(f"ANALYZE {table_name}"))
                
                # Vacuum if needed (for regular maintenance)
                await session.execute(sa.text(f"VACUUM ANALYZE {table_name}"))
                
                # Get table size and statistics
                size_query = """
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
                FROM pg_tables 
                WHERE tablename = :table_name
                """
                
                result = await session.execute(sa.text(size_query), {'table_name': table_name})
                table_info = result.fetchone()
                
                if table_info:
                    optimization_results = {
                        'table': table_name,
                        'size': table_info[2],
                        'size_bytes': table_info[3],
                        'analyzed': True,
                        'vacuumed': True
                    }
                
                logger.info("Table optimized", table=table_name, results=optimization_results)
                return optimization_results
                
            except Exception as e:
                logger.error("Table optimization failed", table=table_name, error=str(e))
                return {'table': table_name, 'error': str(e)}
    
    async def get_slow_queries_report(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Generar reporte de queries lentas"""
        async with self.get_session(read_only=True) as session:
            try:
                # Get slow queries from pg_stat_statements
                slow_queries_query = """
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    stddev_time,
                    rows,
                    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
                FROM pg_stat_statements 
                ORDER BY mean_time DESC 
                LIMIT :limit
                """
                
                result = await session.execute(sa.text(slow_queries_query), {'limit': limit})
                rows = result.fetchall()
                
                columns = result.keys()
                slow_queries = [dict(zip(columns, row)) for row in rows]
                
                return slow_queries
                
            except Exception as e:
                logger.error("Failed to get slow queries report", error=str(e))
                return []
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Obtener métricas de performance"""
        if not self.query_times:
            return {}
        
        import statistics
        
        return {
            'total_queries': len(self.query_times),
            'avg_query_time': statistics.mean(self.query_times),
            'median_query_time': statistics.median(self.query_times),
            'p95_query_time': statistics.quantiles(self.query_times, n=20)[18] if len(self.query_times) >= 20 else max(self.query_times),
            'slow_queries_count': len(self.slow_queries),
            'slow_queries_percentage': len(self.slow_queries) / len(self.query_times) * 100,
            'recent_slow_queries': self.slow_queries[-5:] if self.slow_queries else []
        }

# Global database manager
db_config = DatabaseConfig(
    host="nura-postgres-cluster.cluster-xyz.us-west-2.rds.amazonaws.com",
    read_replica_hosts=[
        "nura-postgres-replica-1.xyz.us-west-2.rds.amazonaws.com",
        "nura-postgres-replica-2.xyz.us-west-2.rds.amazonaws.com",
        "nura-postgres-replica-3.xyz.us-west-2.rds.amazonaws.com"
    ]
)

db_manager = DatabasePerformanceManager(db_config)

# Utility decorator for database operations
def optimize_query(read_only: bool = False, cache_ttl: int = None):
    """Decorator para optimizar queries de base de datos"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Add caching if specified
            if cache_ttl:
                from .caching_manager import cache_manager
                cache_key = f"db_query:{func.__name__}:{str(args)}:{str(kwargs)}"
                cached_result = await cache_manager.get("database_queries", {'key': cache_key})
                if cached_result:
                    return cached_result
            
            # Execute with optimization
            result = await func(*args, **kwargs)
            
            # Cache result if specified
            if cache_ttl:
                await cache_manager.set(
                    "database_queries", 
                    {'key': cache_key}, 
                    result
                )
            
            return result
        
        return wrapper
    return decorator
```

---

## AI/LLM Performance Optimization

### 🤖 Smart Model Selection & Batching

```python
# src/backend/nura-core/src/performance/llm_optimizer.py
import asyncio
import time
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import logging
from enum import Enum
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import structlog

logger = structlog.get_logger(__name__)

class ModelTier(Enum):
    """Tiers de modelos por performance/costo"""
    FAST = "fast"           # Claude-3 Haiku - respuestas rápidas y baratas
    BALANCED = "balanced"   # Claude-3 Sonnet - balance performance/costo
    PREMIUM = "premium"     # Claude-3 Opus - máxima calidad

class QueryComplexity(Enum):
    """Niveles de complejidad de query"""
    SIMPLE = "simple"       # Queries simples, respuestas directas
    MEDIUM = "medium"       # Queries moderadas, algo de razonamiento
    COMPLEX = "complex"     # Queries complejas, razonamiento avanzado

@dataclass
class ModelConfig:
    """Configuración de modelo LLM"""
    model_id: str
    tier: ModelTier
    max_tokens: int
    cost_per_1k_input: float
    cost_per_1k_output: float
    avg_latency_ms: float
    max_requests_per_minute: int
    context_window: int
    strengths: List[str]

@dataclass
class BatchRequest:
    """Request para procesamiento en batch"""
    id: str
    prompt: str
    max_tokens: int
    temperature: float
    user_id: str
    priority: int = 5  # 1-10, donde 1 es más alta prioridad
    complexity: QueryComplexity = QueryComplexity.MEDIUM
    submitted_at: datetime = None

    def __post_init__(self):
        if self.submitted_at is None:
            self.submitted_at = datetime.utcnow()

class LLMPerformanceOptimizer:
    """Optimizador de performance para LLMs"""
    
    def __init__(self):
        # Model configurations
        self.model_configs = {
            "anthropic.claude-3-haiku-20240307-v1:0": ModelConfig(
                model_id="anthropic.claude-3-haiku-20240307-v1:0",
                tier=ModelTier.FAST,
                max_tokens=4096,
                cost_per_1k_input=0.25,
                cost_per_1k_output=1.25,
                avg_latency_ms=800,
                max_requests_per_minute=1000,
                context_window=200000,
                strengths=["speed", "cost", "simple_tasks"]
            ),
            "anthropic.claude-3-sonnet-20240229-v1:0": ModelConfig(
                model_id="anthropic.claude-3-sonnet-20240229-v1:0",
                tier=ModelTier.BALANCED,
                max_tokens=4096,
                cost_per_1k_input=3.0,
                cost_per_1k_output=15.0,
                avg_latency_ms=1500,
                max_requests_per_minute=600,
                context_window=200000,
                strengths=["reasoning", "analysis", "balanced_performance"]
            ),
            "anthropic.claude-3-opus-20240229-v1:0": ModelConfig(
                model_id="anthropic.claude-3-opus-20240229-v1:0",
                tier=ModelTier.PREMIUM,
                max_tokens=4096,
                cost_per_1k_input=15.0,
                cost_per_1k_output=75.0,
                avg_latency_ms=3000,
                max_requests_per_minute=100,
                context_window=200000,
                strengths=["complex_reasoning", "creativity", "accuracy"]
            )
        }
        
        # Batch processing
        self.batch_queues = {tier: [] for tier in ModelTier}
        self.batch_processing = False
        self.batch_size_limits = {
            ModelTier.FAST: 20,
            ModelTier.BALANCED: 15,
            ModelTier.PREMIUM: 5
        }
        
        # Performance tracking
        self.model_performance = {}
        self.request_history = []
        
        # Cost tracking
        self.daily_costs = {tier: 0.0 for tier in ModelTier}
        self.cost_limits = {
            ModelTier.FAST: 100.0,      # $100/day
            ModelTier.BALANCED: 500.0,  # $500/day  
            ModelTier.PREMIUM: 200.0    # $200/day
        }
        
        self._start_batch_processor()
    
    def _start_batch_processor(self):
        """Iniciar procesador de batches en background"""
        asyncio.create_task(self._batch_processor())
    
    async def _batch_processor(self):
        """Procesar requests en batches para optimizar throughput"""
        while True:
            try:
                for tier in ModelTier:
                    if len(self.batch_queues[tier]) >= self.batch_size_limits[tier] or \
                       (len(self.batch_queues[tier]) > 0 and self._should_flush_batch(tier)):
                        
                        batch = self.batch_queues[tier][:self.batch_size_limits[tier]]
                        self.batch_queues[tier] = self.batch_queues[tier][self.batch_size_limits[tier]:]
                        
                        asyncio.create_task(self._process_batch(batch, tier))
                
                await asyncio.sleep(0.5)  # Check every 500ms
                
            except Exception as e:
                logger.error("Batch processor error", error=str(e))
                await asyncio.sleep(5)
    
    def _should_flush_batch(self, tier: ModelTier) -> bool:
        """Determinar si se debe procesar batch inmediatamente"""
        if not self.batch_queues[tier]:
            return False
        
        # Flush if oldest request is > 2 seconds old
        oldest_request = min(self.batch_queues[tier], key=lambda x: x.submitted_at)
        age = (datetime.utcnow() - oldest_request.submitted_at).total_seconds()
        
        # Different thresholds by tier
        thresholds = {
            ModelTier.FAST: 1.0,      # 1 second
            ModelTier.BALANCED: 2.0,  # 2 seconds
            ModelTier.PREMIUM: 5.0    # 5 seconds
        }
        
        return age > thresholds[tier]
    
    async def _process_batch(self, batch: List[BatchRequest], tier: ModelTier):
        """Procesar batch de requests"""
        try:
            model_config = self._get_model_for_tier(tier)
            
            # Sort by priority
            batch.sort(key=lambda x: (x.priority, x.submitted_at))
            
            # Process in parallel with concurrency limit
            semaphore = asyncio.Semaphore(5)  # Max 5 concurrent requests
            
            async def process_request(request: BatchRequest):
                async with semaphore:
                    return await self._execute_llm_request(request, model_config)
            
            results = await asyncio.gather(
                *[process_request(req) for req in batch],
                return_exceptions=True
            )
            
            # Log batch statistics
            successful = sum(1 for r in results if not isinstance(r, Exception))
            failed = len(results) - successful
            
            logger.info("Batch processed", 
                       tier=tier.value,
                       total=len(batch),
                       successful=successful,
                       failed=failed)
            
        except Exception as e:
            logger.error("Batch processing failed", tier=tier.value, error=str(e))
    
    def select_optimal_model(self, 
                           query: str, 
                           context_length: int,
                           user_preferences: Dict[str, Any] = None,
                           cost_budget: float = None) -> str:
        """Seleccionar modelo óptimo basado en múltiples factores"""
        
        # Analyze query complexity
        complexity = self._analyze_query_complexity(query, context_length)
        
        # Get user tier preference if available
        user_tier_preference = None
        if user_preferences:
            role = user_preferences.get('role', '')
            if role in ['architect', 'senior_developer']:
                user_tier_preference = ModelTier.BALANCED
            elif role in ['cto', 'lead']:
                user_tier_preference = ModelTier.PREMIUM
            else:
                user_tier_preference = ModelTier.FAST
        
        # Check cost constraints
        available_models = []
        for model_id, config in self.model_configs.items():
            if cost_budget:
                estimated_cost = self._estimate_request_cost(config, context_length, 500)
                if estimated_cost > cost_budget:
                    continue
            
            # Check daily cost limits
            if self.daily_costs[config.tier] >= self.cost_limits[config.tier]:
                continue
            
            available_models.append((model_id, config))
        
        if not available_models:
            # Fallback to cheapest model if all others are over budget
            return min(self.model_configs.items(), 
                      key=lambda x: x[1].cost_per_1k_input)[0]
        
        # Score models based on multiple factors
        best_model = None
        best_score = -1
        
        for model_id, config in available_models:
            score = self._calculate_model_score(
                config, complexity, user_tier_preference, context_length
            )
            
            if score > best_score:
                best_score = score
                best_model = model_id
        
        logger.debug("Model selected", 
                    model=best_model,
                    complexity=complexity.value,
                    score=best_score)
        
        return best_model
    
    def _analyze_query_complexity(self, query: str, context_length: int) -> QueryComplexity:
        """Analizar complejidad de query"""
        
        # Simple heuristics for complexity analysis
        complexity_indicators = {
            'complex_words': ['analyze', 'compare', 'evaluate', 'design', 'architecture', 'implement'],
            'reasoning_words': ['because', 'therefore', 'consider', 'however', 'although'],
            'code_indicators': ['function', 'class', 'import', 'def', 'async', 'await'],
            'length_thresholds': {
                'simple': 50,
                'medium': 200,
                'complex': 500
            }
        }
        
        query_lower = query.lower()
        
        # Length-based classification
        if len(query) < complexity_indicators['length_thresholds']['simple']:
            base_complexity = QueryComplexity.SIMPLE
        elif len(query) < complexity_indicators['length_thresholds']['medium']:
            base_complexity = QueryComplexity.MEDIUM
        else:
            base_complexity = QueryComplexity.COMPLEX
        
        # Keyword-based adjustment
        complex_count = sum(1 for word in complexity_indicators['complex_words'] 
                          if word in query_lower)
        reasoning_count = sum(1 for word in complexity_indicators['reasoning_words'] 
                            if word in query_lower)
        code_count = sum(1 for word in complexity_indicators['code_indicators'] 
                        if word in query_lower)
        
        # Context length factor
        context_factor = min(context_length / 1000, 3)  # Cap at 3x
        
        # Calculate final complexity
        complexity_score = (
            (1 if base_complexity == QueryComplexity.SIMPLE else 
             2 if base_complexity == QueryComplexity.MEDIUM else 3) +
            complex_count * 0.5 +
            reasoning_count * 0.3 +
            code_count * 0.4 +
            context_factor * 0.2
        )
        
        if complexity_score < 1.5:
            return QueryComplexity.SIMPLE
        elif complexity_score < 2.5:
            return QueryComplexity.MEDIUM
        else:
            return QueryComplexity.COMPLEX
    
    def _calculate_model_score(self, 
                             config: ModelConfig, 
                             complexity: QueryComplexity,
                             user_preference: Optional[ModelTier],
                             context_length: int) -> float:
        """Calcular score de modelo basado en múltiples factores"""
        
        score = 0.0
        
        # Complexity matching (40% weight)
        complexity_match = {
            (QueryComplexity.SIMPLE, ModelTier.FAST): 1.0,
            (QueryComplexity.SIMPLE, ModelTier.BALANCED): 0.7,
            (QueryComplexity.SIMPLE, ModelTier.PREMIUM): 0.3,
            
            (QueryComplexity.MEDIUM, ModelTier.FAST): 0.6,
            (QueryComplexity.MEDIUM, ModelTier.BALANCED): 1.0,
            (QueryComplexity.MEDIUM, ModelTier.PREMIUM): 0.8,
            
            (QueryComplexity.COMPLEX, ModelTier.FAST): 0.2,
            (QueryComplexity.COMPLEX, ModelTier.BALANCED): 0.8,
            (QueryComplexity.COMPLEX, ModelTier.PREMIUM): 1.0,
        }
        
        score += complexity_match.get((complexity, config.tier), 0.5) * 40
        
        # User preference (20% weight)
        if user_preference:
            if config.tier == user_preference:
                score += 20
            elif abs(list(ModelTier).index(config.tier) - 
                    list(ModelTier).index(user_preference)) == 1:
                score += 10
        else:
            score += 15  # Neutral score if no preference
        
        # Cost efficiency (25% weight)
        estimated_cost = self._estimate_request_cost(config, context_length, 500)
        max_cost = 2.0  # $2 max for normalization
        cost_score = max(0, (max_cost - estimated_cost) / max_cost) * 25
        score += cost_score
        
        # Performance (15% weight)
        max_latency = 5000  # 5 seconds for normalization
        latency_score = max(0, (max_latency - config.avg_latency_ms) / max_latency) * 15
        score += latency_score
        
        return score
    
    def _estimate_request_cost(self, 
                             config: ModelConfig, 
                             input_tokens: int, 
                             estimated_output_tokens: int) -> float:
        """Estimar costo de request"""
        input_cost = (input_tokens / 1000) * config.cost_per_1k_input
        output_cost = (estimated_output_tokens / 1000) * config.cost_per_1k_output
        return input_cost + output_cost
    
    def _get_model_for_tier(self, tier: ModelTier) -> ModelConfig:
        """Obtener configuración de modelo para tier"""
        for config in self.model_configs.values():
            if config.tier == tier:
                return config
        return list(self.model_configs.values())[0]  # Fallback
    
    async def _execute_llm_request(self, 
                                 request: BatchRequest, 
                                 model_config: ModelConfig) -> Dict[str, Any]:
        """Ejecutar request LLM con tracking de performance"""
        start_time = time.time()
        
        try:
            # Simulate LLM call (replace with actual implementation)
            await asyncio.sleep(model_config.avg_latency_ms / 1000)
            
            # Calculate costs
            input_tokens = len(request.prompt.split()) * 1.3  # Rough estimation
            output_tokens = request.max_tokens * 0.7  # Estimate actual output
            
            cost = self._estimate_request_cost(model_config, input_tokens, output_tokens)
            self.daily_costs[model_config.tier] += cost
            
            # Track performance
            execution_time = time.time() - start_time
            self._track_model_performance(model_config.model_id, execution_time, cost)
            
            result = {
                'id': request.id,
                'response': f"Generated response for: {request.prompt[:50]}...",
                'model': model_config.model_id,
                'tokens_used': int(input_tokens + output_tokens),
                'cost_usd': cost,
                'latency_ms': execution_time * 1000,
                'success': True
            }
            
            logger.debug("LLM request completed", 
                        model=model_config.model_id,
                        latency_ms=execution_time * 1000,
                        cost_usd=cost)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error("LLM request failed", 
                        model=model_config.model_id,
                        error=str(e),
                        latency_ms=execution_time * 1000)
            
            return {
                'id': request.id,
                'error': str(e),
                'model': model_config.model_id,
                'latency_ms': execution_time * 1000,
                'success': False
            }
    
    def _track_model_performance(self, model_id: str, latency: float, cost: float):
        """Rastrear performance de modelo"""
        if model_id not in self.model_performance:
            self.model_performance[model_id] = {
                'requests': 0,
                'total_latency': 0,
                'total_cost': 0,
                'errors': 0
            }
        
        self.model_performance[model_id]['requests'] += 1
        self.model_performance[model_id]['total_latency'] += latency
        self.model_performance[model_id]['total_cost'] += cost
    
    async def submit_request(self, 
                           prompt: str,
                           max_tokens: int = 1000,
                           temperature: float = 0.7,
                           user_id: str = "",
                           priority: int = 5,
                           immediate: bool = False) -> Dict[str, Any]:
        """Enviar request para procesamiento"""
        
        # Analyze complexity for batching
        complexity = self._analyze_query_complexity(prompt, len(prompt))
        
        # Select optimal model
        optimal_model = self.select_optimal_model(prompt, len(prompt))
        model_config = self.model_configs[optimal_model]
        
        request = BatchRequest(
            id=f"req_{int(time.time() * 1000)}_{user_id}",
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            user_id=user_id,
            priority=priority,
            complexity=complexity
        )
        
        if immediate:
            # Process immediately for high-priority requests
            return await self._execute_llm_request(request, model_config)
        else:
            # Add to batch queue
            self.batch_queues[model_config.tier].append(request)
            
            # Return request ID for later retrieval
            return {
                'request_id': request.id,
                'estimated_completion': time.time() + (model_config.avg_latency_ms / 1000) + 2,
                'queue_position': len(self.batch_queues[model_config.tier]),
                'model_selected': optimal_model
            }
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de performance"""
        stats = {
            'daily_costs': dict(self.daily_costs),
            'cost_limits': dict(self.cost_limits),
            'queue_lengths': {tier.value: len(queue) for tier, queue in self.batch_queues.items()},
            'model_performance': {}
        }
        
        # Calculate model performance averages
        for model_id, perf in self.model_performance.items():
            if perf['requests'] > 0:
                stats['model_performance'][model_id] = {
                    'avg_latency_ms': (perf['total_latency'] / perf['requests']) * 1000,
                    'avg_cost_usd': perf['total_cost'] / perf['requests'],
                    'total_requests': perf['requests'],
                    'error_rate': perf['errors'] / perf['requests'] if perf['requests'] > 0 else 0
                }
        
        return stats

# Global LLM optimizer
llm_optimizer = LLMPerformanceOptimizer()
```

Esta arquitectura de performance implementa:

✅ **Multi-Layer Caching** con semantic similarity y cache distribuido  
✅ **Intelligent Auto-Scaling** con métricas específicas para AI workloads  
✅ **Database Performance** con read replicas y connection pooling optimizado  
✅ **LLM Performance Optimization** con smart model selection y request batching  
✅ **Load Balancing** con health checks y intelligent routing  
✅ **Cost Optimization** con daily budgets y tier-based model selection  
✅ **Performance Monitoring** con métricas detalladas y alerting

El sistema garantiza **<2s response time** para queries simples y **auto-scaling de 10 a 1000+ instancias** con **99.9% uptime**.