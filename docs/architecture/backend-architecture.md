# 🔧 Backend Architecture - Nura System

## 🏗️ Arquitectura de Servicios Backend

**Enfoque Arquitectónico**: Microkernel con Bounded Contexts como plugins, implementando Domain-Driven Design con Clean Architecture y Screaming Architecture principles.

**Estrategia de Deployment**: Hybrid serverless con FastAPI containers en AWS Lambda + ECS Fargate para workloads intensivos.

---

## 🏗️ Service Architecture

### 🔧 Microkernel Core Architecture

```python
# src/backend/nura-core/src/kernel/kernel_manager.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import logging
from datetime import datetime

class PluginInterface(ABC):
    """Interface que todos los plugins deben implementar"""
    
    @abstractmethod
    def get_plugin_info(self) -> Dict[str, Any]:
        """Retorna metadata del plugin"""
        pass
    
    @abstractmethod
    async def initialize(self, kernel_context: 'KernelContext') -> bool:
        """Inicializa el plugin"""
        pass
    
    @abstractmethod
    async def shutdown(self) -> bool:
        """Shutdown graceful del plugin"""
        pass
    
    @abstractmethod
    def get_api_routes(self) -> List[Dict[str, Any]]:
        """Retorna las rutas API que expone el plugin"""
        pass
    
    @abstractmethod
    async def handle_event(self, event: 'SystemEvent') -> Optional[Dict[str, Any]]:
        """Maneja eventos del sistema"""
        pass

class KernelContext:
    """Contexto compartido del kernel disponible para todos los plugins"""
    
    def __init__(self):
        self.db_session = None
        self.cache = None
        self.event_bus = None
        self.config = None
        self.logger = logging.getLogger(__name__)
        self.metrics = None

class SystemEvent(BaseModel):
    event_type: str
    source_plugin: str
    target_plugin: Optional[str] = None
    payload: Dict[str, Any]
    timestamp: datetime
    correlation_id: str

class KernelManager:
    """Gestor central del microkernel - nura-core"""
    
    def __init__(self):
        self.plugins: Dict[str, PluginInterface] = {}
        self.app = FastAPI(title="Nura Core API", version="1.0.0")
        self.kernel_context = KernelContext()
        self.event_bus = EventBus()
        self.plugin_registry = PluginRegistry()
        self.health_monitor = HealthMonitor()
        
    async def register_plugin(self, plugin_name: str, plugin: PluginInterface) -> bool:
        """Registra un nuevo plugin en el kernel"""
        try:
            # Validar plugin interface
            if not isinstance(plugin, PluginInterface):
                raise ValueError(f"Plugin {plugin_name} no implementa PluginInterface")
            
            # Inicializar plugin
            success = await plugin.initialize(self.kernel_context)
            if not success:
                raise RuntimeError(f"Failed to initialize plugin {plugin_name}")
            
            # Registrar rutas API
            routes = plugin.get_api_routes()
            for route in routes:
                self.app.add_api_route(**route)
            
            # Agregar al registry
            self.plugins[plugin_name] = plugin
            self.plugin_registry.register(plugin_name, plugin.get_plugin_info())
            
            # Emitir evento de plugin registrado
            event = SystemEvent(
                event_type="plugin_registered",
                source_plugin="kernel",
                payload={"plugin_name": plugin_name},
                timestamp=datetime.utcnow(),
                correlation_id=f"kernel_{datetime.utcnow().timestamp()}"
            )
            await self.event_bus.publish(event)
            
            self.kernel_context.logger.info(f"Plugin {plugin_name} registered successfully")
            return True
            
        except Exception as e:
            self.kernel_context.logger.error(f"Failed to register plugin {plugin_name}: {str(e)}")
            return False
    
    async def unregister_plugin(self, plugin_name: str) -> bool:
        """Hot-swapping: desregistra plugin sin afectar otros"""
        try:
            if plugin_name not in self.plugins:
                return False
            
            plugin = self.plugins[plugin_name]
            
            # Shutdown graceful
            await plugin.shutdown()
            
            # Remover del registry
            del self.plugins[plugin_name]
            self.plugin_registry.unregister(plugin_name)
            
            # Emitir evento
            event = SystemEvent(
                event_type="plugin_unregistered",
                source_plugin="kernel",
                payload={"plugin_name": plugin_name},
                timestamp=datetime.utcnow(),
                correlation_id=f"kernel_{datetime.utcnow().timestamp()}"
            )
            await self.event_bus.publish(event)
            
            return True
            
        except Exception as e:
            self.kernel_context.logger.error(f"Failed to unregister plugin {plugin_name}: {str(e)}")
            return False
    
    async def broadcast_event(self, event: SystemEvent) -> Dict[str, Any]:
        """Broadcast evento a todos los plugins relevantes"""
        results = {}
        
        for plugin_name, plugin in self.plugins.items():
            if event.target_plugin and event.target_plugin != plugin_name:
                continue
                
            try:
                result = await plugin.handle_event(event)
                results[plugin_name] = result
            except Exception as e:
                self.kernel_context.logger.error(f"Plugin {plugin_name} failed to handle event: {str(e)}")
                results[plugin_name] = {"error": str(e)}
        
        return results
    
    def get_plugin_status(self) -> Dict[str, Any]:
        """Status de todos los plugins registrados"""
        return {
            "kernel_status": "active",
            "plugins": {
                name: {
                    "status": "active",
                    "info": plugin.get_plugin_info()
                } for name, plugin in self.plugins.items()
            },
            "total_plugins": len(self.plugins)
        }
```

---

## Bounded Context Plugin Implementation

### Agent Orchestration Plugin (Core Business Logic)

```python
# src/backend/plugins/agent-orchestration/src/orchestration_plugin.py
from nura_core.kernel import PluginInterface, KernelContext, SystemEvent
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
import asyncio
import uuid
from datetime import datetime

class AgentOrchestrationPlugin(PluginInterface):
    """Plugin central para orquestación de agentes"""
    
    def __init__(self):
        self.router = APIRouter(prefix="/orchestration", tags=["orchestration"])
        self.agent_coordinator = AgentCoordinator()
        self.workflow_manager = WorkflowManager()
        self.llm_tracker = LLMUsageTracker()
        
    def get_plugin_info(self) -> Dict[str, Any]:
        return {
            "name": "agent-orchestration",
            "version": "1.0.0",
            "description": "Core orchestration for multi-agent workflows",
            "capabilities": ["intent_analysis", "workflow_coordination", "llm_management"],
            "dependencies": ["knowledge-management", "developer-mentorship", "business-intelligence"]
        }
    
    async def initialize(self, kernel_context: KernelContext) -> bool:
        """Inicialización del plugin de orquestación"""
        try:
            self.kernel_context = kernel_context
            self.db = kernel_context.db_session
            self.cache = kernel_context.cache
            self.logger = kernel_context.logger
            
            # Inicializar componentes
            await self.agent_coordinator.initialize(kernel_context)
            await self.workflow_manager.initialize(kernel_context)
            
            self.logger.info("Agent Orchestration Plugin initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Agent Orchestration Plugin: {str(e)}")
            return False
    
    async def shutdown(self) -> bool:
        """Shutdown graceful"""
        try:
            await self.workflow_manager.shutdown()
            await self.agent_coordinator.shutdown()
            return True
        except Exception as e:
            self.logger.error(f"Error during shutdown: {str(e)}")
            return False
    
    def get_api_routes(self) -> List[Dict[str, Any]]:
        """Rutas API del plugin"""
        return [
            {
                "path": "/orchestration/query",
                "endpoint": self.handle_query,
                "methods": ["POST"]
            },
            {
                "path": "/orchestration/workflow/{workflow_id}/status",
                "endpoint": self.get_workflow_status,
                "methods": ["GET"]
            },
            {
                "path": "/orchestration/agent-status/{agent_type}",
                "endpoint": self.get_agent_status,
                "methods": ["GET"]
            }
        ]
    
    async def handle_event(self, event: SystemEvent) -> Optional[Dict[str, Any]]:
        """Manejo de eventos del sistema"""
        try:
            if event.event_type == "knowledge_updated":
                # Re-evaluate active workflows when knowledge changes
                await self.workflow_manager.refresh_context()
                return {"status": "context_refreshed"}
                
            elif event.event_type == "agent_failure":
                # Handle agent failures with fallback strategies
                failed_agent = event.payload.get("agent_type")
                await self.agent_coordinator.handle_agent_failure(failed_agent)
                return {"status": "fallback_activated", "failed_agent": failed_agent}
                
            return None
            
        except Exception as e:
            self.logger.error(f"Error handling event {event.event_type}: {str(e)}")
            return {"error": str(e)}
    
    # === API Endpoints ===
    
    async def handle_query(self, query_request: QueryRequest, background_tasks: BackgroundTasks):
        """Endpoint principal para procesamiento de queries"""
        try:
            # Intent analysis
            intent = await self.agent_coordinator.analyze_intent(query_request.content)
            
            # Create workflow execution
            workflow_id = str(uuid.uuid4())
            workflow = WorkflowExecution(
                id=workflow_id,
                user_id=query_request.user_id,
                conversation_id=query_request.conversation_id,
                intent=intent,
                status="processing"
            )
            
            # Determine execution strategy
            strategy = await self.determine_execution_strategy(intent, query_request)
            
            if strategy == "multi_agent":
                # Complex multi-agent coordination
                result = await self.execute_multi_agent_workflow(workflow, query_request)
            else:
                # Single agent execution
                result = await self.execute_single_agent_workflow(workflow, query_request)
            
            # Track LLM usage
            background_tasks.add_task(
                self.llm_tracker.record_usage,
                workflow_id,
                result.get("llm_metadata", {})
            )
            
            return {
                "workflow_id": workflow_id,
                "response": result["content"],
                "agent_type": result["agent_type"],
                "llm_metadata": result.get("llm_metadata", {}),
                "execution_time_ms": result.get("execution_time_ms", 0)
            }
            
        except Exception as e:
            self.logger.error(f"Error processing query: {str(e)}")
            raise HTTPException(status_code=500, detail="Query processing failed")
    
    async def execute_multi_agent_workflow(self, workflow: WorkflowExecution, query_request: QueryRequest) -> Dict[str, Any]:
        """Ejecución de workflow multi-agent con coordinación"""
        try:
            # Determine required agents
            required_agents = await self.agent_coordinator.determine_required_agents(workflow.intent)
            
            # Execute agents in parallel
            agent_tasks = []
            for agent_type in required_agents:
                task = self.execute_agent_task(agent_type, workflow, query_request)
                agent_tasks.append(task)
            
            # Wait for all agent responses
            agent_responses = await asyncio.gather(*agent_tasks, return_exceptions=True)
            
            # Handle failed agents
            successful_responses = []
            failed_agents = []
            
            for i, response in enumerate(agent_responses):
                if isinstance(response, Exception):
                    failed_agents.append(required_agents[i])
                    self.logger.error(f"Agent {required_agents[i]} failed: {str(response)}")
                else:
                    successful_responses.append(response)
            
            # Synthesize responses using LLM
            if successful_responses:
                synthesis = await self.synthesize_agent_responses(successful_responses, query_request)
                
                # Add failure notices if any
                if failed_agents:
                    synthesis["content"] += f"\n\n⚠️ Note: Some analysis components were unavailable: {', '.join(failed_agents)}"
                
                return synthesis
            else:
                # All agents failed - fallback response
                return {
                    "content": "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
                    "agent_type": "system",
                    "execution_time_ms": 0
                }
                
        except Exception as e:
            self.logger.error(f"Multi-agent workflow execution failed: {str(e)}")
            raise
    
    async def execute_agent_task(self, agent_type: str, workflow: WorkflowExecution, query_request: QueryRequest) -> Dict[str, Any]:
        """Ejecuta tarea individual de un agente específico"""
        try:
            # Emit event to specific agent plugin
            event = SystemEvent(
                event_type="agent_task_request",
                source_plugin="agent-orchestration",
                target_plugin=f"{agent_type.replace('_', '-')}",
                payload={
                    "workflow_id": workflow.id,
                    "query": query_request.content,
                    "context": query_request.context,
                    "intent": workflow.intent
                },
                timestamp=datetime.utcnow(),
                correlation_id=workflow.id
            )
            
            # Send through kernel event bus
            response = await self.kernel_context.event_bus.send_targeted_event(event)
            
            if response and not response.get("error"):
                return response
            else:
                raise Exception(f"Agent {agent_type} returned error: {response.get('error', 'Unknown error')}")
                
        except Exception as e:
            self.logger.error(f"Agent task execution failed for {agent_type}: {str(e)}")
            raise

# Domain Models
class QueryRequest(BaseModel):
    content: str
    user_id: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class WorkflowExecution(BaseModel):
    id: str
    user_id: str
    conversation_id: Optional[str]
    intent: str
    status: str
    created_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None
    agent_executions: List[Dict[str, Any]] = []
    llm_calls: List[Dict[str, Any]] = []
```

---

## Database Architecture

### Connection Pool y Session Management

```python
# src/backend/nura-core/src/database/session_manager.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from sqlalchemy.orm import declarative_base
from contextlib import asynccontextmanager
import os
from typing import AsyncGenerator

class DatabaseManager:
    """Gestor centralizado de conexiones de base de datos"""
    
    def __init__(self):
        self.engine = None
        self.async_session_maker = None
        
    async def initialize(self, database_url: str, **kwargs):
        """Inicializar engine y session maker"""
        
        # Configuración optimizada para producción
        engine_kwargs = {
            "echo": os.getenv("SQL_DEBUG", "false").lower() == "true",
            "future": True,
            **kwargs
        }
        
        # Pool configuration basado en environment
        if os.getenv("ENVIRONMENT") == "production":
            engine_kwargs.update({
                "poolclass": QueuePool,
                "pool_size": 20,
                "max_overflow": 30,
                "pool_pre_ping": True,
                "pool_recycle": 3600,  # 1 hour
            })
        else:
            engine_kwargs.update({
                "poolclass": NullPool,  # Para development y testing
            })
        
        self.engine = create_async_engine(database_url, **engine_kwargs)
        
        self.async_session_maker = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    
    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Context manager para sessions"""
        async with self.async_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def close(self):
        """Cerrar engine y connections"""
        if self.engine:
            await self.engine.dispose()

# Global database manager instance
db_manager = DatabaseManager()

# Base para modelos SQLAlchemy
Base = declarative_base()

# Dependency para FastAPI
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with db_manager.get_session() as session:
        yield session
```

### Repository Pattern Implementation

```python
# src/backend/nura-core/src/repositories/base_repository.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import selectinload
import uuid

T = TypeVar('T')

class BaseRepository(Generic[T], ABC):
    """Repository base con operaciones CRUD comunes"""
    
    def __init__(self, session: AsyncSession, model_class: type):
        self.session = session
        self.model_class = model_class
    
    async def create(self, **kwargs) -> T:
        """Crear nueva entidad"""
        if 'id' not in kwargs:
            kwargs['id'] = str(uuid.uuid4())
        
        entity = self.model_class(**kwargs)
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity
    
    async def get_by_id(self, entity_id: str, include_relations: List[str] = None) -> Optional[T]:
        """Obtener por ID con opciones de eager loading"""
        query = select(self.model_class).where(self.model_class.id == entity_id)
        
        if include_relations:
            for relation in include_relations:
                query = query.options(selectinload(getattr(self.model_class, relation)))
        
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
    
    async def list(
        self, 
        limit: int = 100, 
        offset: int = 0,
        filters: Dict[str, Any] = None,
        order_by: str = None
    ) -> List[T]:
        """Listar con paginación y filtros"""
        query = select(self.model_class)
        
        # Aplicar filtros
        if filters:
            for field, value in filters.items():
                if hasattr(self.model_class, field):
                    query = query.where(getattr(self.model_class, field) == value)
        
        # Ordenamiento
        if order_by and hasattr(self.model_class, order_by):
            query = query.order_by(getattr(self.model_class, order_by))
        
        # Paginación
        query = query.limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def update(self, entity_id: str, **kwargs) -> Optional[T]:
        """Actualizar entidad por ID"""
        query = update(self.model_class).where(
            self.model_class.id == entity_id
        ).values(**kwargs).returning(self.model_class)
        
        result = await self.session.execute(query)
        updated_entity = result.scalar_one_or_none()
        
        if updated_entity:
            await self.session.refresh(updated_entity)
        
        return updated_entity
    
    async def delete(self, entity_id: str) -> bool:
        """Eliminar entidad por ID"""
        query = delete(self.model_class).where(self.model_class.id == entity_id)
        result = await self.session.execute(query)
        return result.rowcount > 0
    
    async def count(self, filters: Dict[str, Any] = None) -> int:
        """Contar entidades con filtros opcionales"""
        query = select(func.count(self.model_class.id))
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model_class, field):
                    query = query.where(getattr(self.model_class, field) == value)
        
        result = await self.session.execute(query)
        return result.scalar()

# Implementación específica para Conversaciones
class ConversationRepository(BaseRepository[Conversation]):
    """Repository específico para Conversaciones con métodos de dominio"""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, Conversation)
    
    async def get_user_conversations(
        self, 
        user_id: str, 
        limit: int = 20,
        conversation_type: Optional[str] = None
    ) -> List[Conversation]:
        """Obtener conversaciones de un usuario"""
        filters = {"user_id": user_id}
        if conversation_type:
            filters["conversation_type"] = conversation_type
        
        return await self.list(
            limit=limit,
            filters=filters,
            order_by="updated_at"
        )
    
    async def get_conversation_with_messages(self, conversation_id: str) -> Optional[Conversation]:
        """Obtener conversación con sus mensajes"""
        return await self.get_by_id(
            conversation_id, 
            include_relations=["messages"]
        )
    
    async def update_last_message_at(self, conversation_id: str) -> Optional[Conversation]:
        """Actualizar timestamp del último mensaje"""
        from datetime import datetime
        return await self.update(conversation_id, updated_at=datetime.utcnow())
```

---

## Authentication and Authorization

### JWT Authentication Implementation

```python
# src/backend/nura-core/src/auth/jwt_manager.py
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os

class JWTManager:
    """Gestor de JWT tokens y autenticación"""
    
    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.bearer_scheme = HTTPBearer()
    
    def create_access_token(self, user_data: Dict[str, Any]) -> str:
        """Crear access token"""
        to_encode = user_data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({
            "exp": expire,
            "type": "access",
            "iat": datetime.utcnow()
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: str) -> str:
        """Crear refresh token"""
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode = {
            "user_id": user_id,
            "exp": expire,
            "type": "refresh",
            "iat": datetime.utcnow()
        }
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verificar y decodificar token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None
    
    def hash_password(self, password: str) -> str:
        """Hash de password"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verificar password"""
        return self.pwd_context.verify(plain_password, hashed_password)

# Global JWT manager
jwt_manager = JWTManager()

# FastAPI Dependencies
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """Dependency para obtener usuario actual"""
    token = credentials.credentials
    payload = jwt_manager.verify_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    """Dependency para usuario opcional (endpoints públicos)"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

# Role-based authorization
def require_role(required_role: str):
    """Decorator para requerir rol específico"""
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "user")
        if user_role != required_role and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
```

---

## Error Handling y Middleware

### Global Exception Handler

```python
# src/backend/nura-core/src/middleware/error_handler.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback
import uuid
from datetime import datetime
from typing import Union

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base exception para errores de API"""
    
    def __init__(self, message: str, error_code: str, status_code: int = 500, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ErrorResponse:
    """Formato estandarizado de respuestas de error"""
    
    @staticmethod
    def create_error_response(
        error_code: str,
        message: str,
        status_code: int,
        details: dict = None,
        request_id: str = None
    ) -> dict:
        return {
            "error": {
                "code": error_code,
                "message": message,
                "details": details or {},
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_id or str(uuid.uuid4())
            }
        }

async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """Handler para APIError personalizada"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    logger.error(f"API Error: {exc.error_code} - {exc.message} (Request ID: {request_id})")
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.create_error_response(
            error_code=exc.error_code,
            message=exc.message,
            status_code=exc.status_code,
            details=exc.details,
            request_id=request_id
        )
    )

async def http_exception_handler(request: Request, exc: Union[HTTPException, StarletteHTTPException]) -> JSONResponse:
    """Handler para HTTPException"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail} (Request ID: {request_id})")
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.create_error_response(
            error_code=f"HTTP_{exc.status_code}",
            message=str(exc.detail),
            status_code=exc.status_code,
            request_id=request_id
        )
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler para errores de validación"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    logger.warning(f"Validation Error: {exc.errors()} (Request ID: {request_id})")
    
    return JSONResponse(
        status_code=422,
        content=ErrorResponse.create_error_response(
            error_code="VALIDATION_ERROR",
            message="Request validation failed",
            status_code=422,
            details={"validation_errors": exc.errors()},
            request_id=request_id
        )
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handler general para excepciones no capturadas"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    logger.error(f"Unhandled Exception: {str(exc)} (Request ID: {request_id})")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse.create_error_response(
            error_code="INTERNAL_SERVER_ERROR",
            message="An internal server error occurred",
            status_code=500,
            request_id=request_id
        )
    )

# Request ID Middleware
async def request_id_middleware(request: Request, call_next):
    """Middleware para agregar request ID único"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response
```

### Corporate OAuth Plugin

```python
# src/backend/nura-oauth/src/oauth_plugin.py
from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
from typing import Dict, Any, Optional, List
import asyncio
import uuid
import secrets
import hashlib
import base64
import json
from datetime import datetime, timedelta
from urllib.parse import urlencode, parse_qs
import httpx
from cryptography.fernet import Fernet
import logging

# OAuth Models
class OAuthConfig(BaseModel):
    client_id: str
    client_secret: str
    redirect_uri: str
    scope: str = "openid email profile https://www.googleapis.com/auth/admin.directory.user.readonly"
    
class OAuthUser(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    domain: str
    verified_email: bool
    hd: Optional[str] = None  # Hosted domain for Google Workspace
    groups: List[str] = []

class AuthorizeRequest(BaseModel):
    domain: Optional[str] = None
    redirect_uri: Optional[str] = None
    
class CallbackRequest(BaseModel):
    code: str
    state: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class CorporateOAuthPlugin(PluginInterface):
    """Plugin for corporate OAuth authentication with Google Workspace"""
    
    def __init__(self):
        self.router = APIRouter(prefix="/oauth", tags=["oauth"])
        self.security = HTTPBearer()
        self.oauth_config: Optional[OAuthConfig] = None
        self.encryption_key: Optional[Fernet] = None
        self.session_store: Dict[str, Any] = {}
        
    def get_plugin_info(self) -> Dict[str, Any]:
        return {
            "name": "corporate-oauth",
            "version": "1.0.0",
            "description": "Corporate OAuth authentication with Google Workspace integration",
            "capabilities": [
                "oauth2_pkce", 
                "google_workspace", 
                "domain_validation", 
                "role_mapping", 
                "sso_sessions"
            ],
            "dependencies": ["security", "user-management"]
        }
    
    async def initialize(self, kernel_context: KernelContext) -> bool:
        """Inicialización del plugin OAuth"""
        try:
            self.kernel_context = kernel_context
            self.db = kernel_context.db_session
            self.cache = kernel_context.cache
            self.logger = kernel_context.logger
            
            # Initialize OAuth configuration
            await self._load_oauth_config()
            
            # Initialize encryption
            self._setup_encryption()
            
            self.logger.info("Corporate OAuth Plugin initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize OAuth Plugin: {str(e)}")
            return False
    
    async def shutdown(self) -> bool:
        """Shutdown graceful"""
        try:
            # Clear sensitive data
            self.session_store.clear()
            self.oauth_config = None
            return True
        except Exception as e:
            self.logger.error(f"Error during OAuth plugin shutdown: {str(e)}")
            return False
    
    def get_api_routes(self) -> List[Dict[str, Any]]:
        """Rutas API del plugin OAuth"""
        return [
            {
                "path": "/oauth/authorize",
                "endpoint": self.initiate_oauth,
                "methods": ["POST"]
            },
            {
                "path": "/oauth/callback",
                "endpoint": self.handle_oauth_callback,
                "methods": ["POST"]
            },
            {
                "path": "/oauth/refresh",
                "endpoint": self.refresh_token,
                "methods": ["POST"]
            },
            {
                "path": "/oauth/revoke",
                "endpoint": self.revoke_token,
                "methods": ["POST"]
            },
            {
                "path": "/oauth/user/profile",
                "endpoint": self.get_user_profile,
                "methods": ["GET"]
            },
            {
                "path": "/oauth/domains",
                "endpoint": self.get_authorized_domains,
                "methods": ["GET"]
            }
        ]
    
    async def handle_event(self, event: SystemEvent) -> Optional[Dict[str, Any]]:
        """Manejo de eventos del sistema"""
        try:
            if event.event_type == "user_login":
                # Update SSO session tracking
                user_id = event.payload.get("user_id")
                await self._create_sso_session(user_id, event.payload)
                return {"status": "sso_session_created"}
                
            elif event.event_type == "user_logout":
                # Cleanup OAuth tokens and SSO sessions
                user_id = event.payload.get("user_id")
                await self._cleanup_user_sessions(user_id)
                return {"status": "sessions_cleaned"}
                
            elif event.event_type == "security_policy_updated":
                # Refresh OAuth configuration
                await self._load_oauth_config()
                return {"status": "oauth_config_refreshed"}
                
            return None
            
        except Exception as e:
            self.logger.error(f"Error handling OAuth event {event.event_type}: {str(e)}")
            return {"error": str(e)}
    
    # === OAuth Implementation ===
    
    def _generate_pkce_pair(self) -> tuple[str, str]:
        """Generate PKCE code verifier and challenge"""
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        return code_verifier, code_challenge
    
    def _setup_encryption(self):
        """Setup encryption for sensitive data"""
        encryption_key = self.kernel_context.config.get("OAUTH_ENCRYPTION_KEY")
        if not encryption_key:
            encryption_key = Fernet.generate_key()
            self.logger.warning("Generated new encryption key. Store securely for production.")
        else:
            encryption_key = encryption_key.encode()
        
        self.encryption_key = Fernet(encryption_key)
    
    def _encrypt_token(self, token: str) -> str:
        """Encrypt OAuth token"""
        return self.encryption_key.encrypt(token.encode()).decode()
    
    def _decrypt_token(self, encrypted_token: str) -> str:
        """Decrypt OAuth token"""
        return self.encryption_key.decrypt(encrypted_token.encode()).decode()
    
    async def _load_oauth_config(self):
        """Load OAuth configuration from database"""
        try:
            # Query active Google OAuth provider
            query = """
                SELECT client_id, client_secret_encrypted, configuration 
                FROM corporate_auth.oauth_providers 
                WHERE provider_type = 'google' AND is_active = true
                LIMIT 1
            """
            result = await self.db.fetch_one(query)
            
            if result:
                decrypted_secret = self._decrypt_token(result['client_secret_encrypted'])
                config_data = result['configuration']
                
                self.oauth_config = OAuthConfig(
                    client_id=result['client_id'],
                    client_secret=decrypted_secret,
                    redirect_uri=config_data.get('redirect_uri', 'http://localhost:3000/auth/callback'),
                    scope=config_data.get('scope', 'openid email profile')
                )
            else:
                raise Exception("No active Google OAuth provider found")
                
        except Exception as e:
            self.logger.error(f"Failed to load OAuth config: {str(e)}")
            raise
    
    async def _validate_corporate_domain(self, email: str) -> Optional[Dict[str, Any]]:
        """Validate if email domain is authorized"""
        domain = email.split('@')[1] if '@' in email else None
        if not domain:
            return None
            
        query = """
            SELECT domain, organization_name, authorized_roles, google_workspace_config
            FROM corporate_auth.corporate_domains 
            WHERE domain = $1 AND domain_status = 'active'
        """
        return await self.db.fetch_one(query, domain)
    
    async def _get_google_user_groups(self, access_token: str, user_email: str) -> List[str]:
        """Get user's Google Groups for role mapping"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {"Authorization": f"Bearer {access_token}"}
                
                # Get user's groups via Admin SDK
                response = await client.get(
                    f"https://admin.googleapis.com/admin/directory/v1/groups",
                    headers=headers,
                    params={"userKey": user_email}
                )
                
                if response.status_code == 200:
                    groups_data = response.json()
                    return [group['email'] for group in groups_data.get('groups', [])]
                
                return []
                
        except Exception as e:
            self.logger.warning(f"Failed to fetch user groups: {str(e)}")
            return []
    
    # === API Endpoints ===
    
    async def initiate_oauth(self, request: AuthorizeRequest):
        """Iniciar flujo OAuth con PKCE"""
        try:
            if not self.oauth_config:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="OAuth not configured"
                )
            
            # Generate PKCE parameters
            code_verifier, code_challenge = self._generate_pkce_pair()
            state = secrets.token_urlsafe(32)
            
            # Store PKCE and session data
            session_data = {
                "code_verifier": code_verifier,
                "domain_filter": request.domain,
                "redirect_uri": request.redirect_uri or self.oauth_config.redirect_uri,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Store in session (use Redis in production)
            self.session_store[state] = session_data
            
            # Build authorization URL
            auth_params = {
                "client_id": self.oauth_config.client_id,
                "redirect_uri": self.oauth_config.redirect_uri,
                "scope": self.oauth_config.scope,
                "response_type": "code",
                "state": state,
                "code_challenge": code_challenge,
                "code_challenge_method": "S256",
                "access_type": "offline",
                "prompt": "consent"
            }
            
            if request.domain:
                auth_params["hd"] = request.domain  # Google Workspace domain hint
            
            authorization_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(auth_params)}"
            
            return {
                "authorization_url": authorization_url,
                "state": state,
                "expires_at": (datetime.utcnow() + timedelta(minutes=10)).isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"OAuth initiation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initiate OAuth flow"
            )
    
    async def handle_oauth_callback(self, callback: CallbackRequest):
        """Manejar callback OAuth y crear sesión"""
        try:
            # Retrieve session data
            session_data = self.session_store.get(callback.state)
            if not session_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired state parameter"
                )
            
            # Exchange code for tokens
            token_data = await self._exchange_code_for_tokens(
                callback.code, 
                session_data["code_verifier"]
            )
            
            # Get user info from Google
            user_info = await self._get_google_user_info(token_data["access_token"])
            
            # Validate corporate domain
            domain_info = await self._validate_corporate_domain(user_info["email"])
            if not domain_info:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email domain not authorized for corporate access"
                )
            
            # Get user groups for role mapping
            user_groups = await self._get_google_user_groups(
                token_data["access_token"], 
                user_info["email"]
            )
            
            # Create or update user
            user = await self._create_or_update_user(user_info, domain_info, user_groups)
            
            # Store OAuth tokens
            await self._store_oauth_tokens(user["id"], token_data)
            
            # Create SSO session
            sso_session = await self._create_sso_session(user["id"], {
                "application": "nura-main",
                "user_agent": callback.state,  # In real implementation, get from request
                "ip_address": "127.0.0.1"  # In real implementation, get from request
            })
            
            # Cleanup session store
            del self.session_store[callback.state]
            
            return {
                "user": user,
                "session_token": sso_session["session_token"],
                "expires_at": sso_session["expires_at"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error(f"OAuth callback error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process OAuth callback"
            )
    
    async def _exchange_code_for_tokens(self, code: str, code_verifier: str) -> Dict[str, Any]:
        """Exchange authorization code for access/refresh tokens"""
        token_data = {
            "client_id": self.oauth_config.client_id,
            "client_secret": self.oauth_config.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.oauth_config.redirect_uri,
            "code_verifier": code_verifier
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data=token_data
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange authorization code"
                )
            
            return response.json()
    
    async def _get_google_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from Google"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user information"
                )
            
            return response.json()
    
    async def _create_or_update_user(self, user_info: Dict, domain_info: Dict, groups: List[str]) -> Dict[str, Any]:
        """Create or update user based on OAuth info"""
        # Map Google Groups to application roles
        user_role = self._map_groups_to_role(groups, domain_info["authorized_roles"])
        
        # Check if user exists
        existing_user = await self.db.fetch_one(
            "SELECT id, email, role FROM public.users WHERE email = $1",
            user_info["email"]
        )
        
        if existing_user:
            # Update existing user
            query = """
                UPDATE public.users 
                SET name = $1, profile_picture_url = $2, role = $3, updated_at = NOW()
                WHERE email = $4
                RETURNING id, email, name, role, created_at, updated_at
            """
            user = await self.db.fetch_one(
                query, 
                user_info["name"], 
                user_info.get("picture"), 
                user_role,
                user_info["email"]
            )
        else:
            # Create new user
            query = """
                INSERT INTO public.users (email, name, profile_picture_url, role, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING id, email, name, role, created_at, updated_at
            """
            user = await self.db.fetch_one(
                query,
                user_info["email"],
                user_info["name"],
                user_info.get("picture"),
                user_role
            )
        
        # Create or update social profile
        await self._update_social_profile(user["id"], user_info, groups)
        
        return dict(user)
    
    def _map_groups_to_role(self, user_groups: List[str], authorized_roles: List[str]) -> str:
        """Map Google Groups to application roles"""
        # Default role mapping logic
        if "admin@company.com" in user_groups:
            return "admin"
        elif "developers@company.com" in user_groups:
            return "developer"
        elif "users@company.com" in user_groups:
            return "user"
        
        # Fallback to first authorized role
        return authorized_roles[0] if authorized_roles else "user"
    
    async def _update_social_profile(self, user_id: str, user_info: Dict, groups: List[str]):
        """Update or create social profile"""
        # Get OAuth provider ID
        provider = await self.db.fetch_one(
            "SELECT id FROM corporate_auth.oauth_providers WHERE provider_type = 'google' AND is_active = true"
        )
        
        if not provider:
            return
        
        profile_data = {
            "groups": groups,
            "hd": user_info.get("hd"),
            "verified_email": user_info.get("verified_email", False)
        }
        
        # Upsert social profile
        query = """
            INSERT INTO corporate_auth.user_social_profiles 
            (user_id, oauth_provider_id, provider_user_id, email, display_name, profile_picture_url, profile_data, last_sync_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
            ON CONFLICT (user_id, oauth_provider_id) 
            DO UPDATE SET 
                provider_user_id = EXCLUDED.provider_user_id,
                email = EXCLUDED.email,
                display_name = EXCLUDED.display_name,
                profile_picture_url = EXCLUDED.profile_picture_url,
                profile_data = EXCLUDED.profile_data,
                last_sync_at = NOW(),
                updated_at = NOW()
        """
        
        await self.db.execute(
            query,
            user_id,
            provider["id"],
            user_info["id"],
            user_info["email"],
            user_info["name"],
            user_info.get("picture"),
            json.dumps(profile_data)
        )
    
    async def _store_oauth_tokens(self, user_id: str, token_data: Dict[str, Any]):
        """Store encrypted OAuth tokens"""
        provider = await self.db.fetch_one(
            "SELECT id FROM corporate_auth.oauth_providers WHERE provider_type = 'google' AND is_active = true"
        )
        
        if not provider:
            return
        
        # Encrypt tokens
        encrypted_access_token = self._encrypt_token(token_data["access_token"])
        encrypted_refresh_token = None
        if token_data.get("refresh_token"):
            encrypted_refresh_token = self._encrypt_token(token_data["refresh_token"])
        
        # Calculate token expiration
        expires_in = token_data.get("expires_in", 3600)
        token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        # Store tokens
        query = """
            INSERT INTO corporate_auth.oauth_tokens 
            (user_id, oauth_provider_id, access_token_encrypted, refresh_token_encrypted, token_expires_at, scopes, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            ON CONFLICT (user_id, oauth_provider_id, is_active) 
            DO UPDATE SET 
                access_token_encrypted = EXCLUDED.access_token_encrypted,
                refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
                token_expires_at = EXCLUDED.token_expires_at,
                scopes = EXCLUDED.scopes,
                updated_at = NOW()
        """
        
        scopes = token_data.get("scope", "").split()
        
        await self.db.execute(
            query,
            user_id,
            provider["id"],
            encrypted_access_token,
            encrypted_refresh_token,
            token_expires_at,
            scopes
        )
    
    async def _create_sso_session(self, user_id: str, session_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create SSO session for cross-application usage"""
        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=8)  # 8 hour sessions
        
        query = """
            INSERT INTO corporate_auth.sso_sessions 
            (user_id, session_token, application, user_agent, ip_address, expires_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id, session_token, expires_at
        """
        
        session = await self.db.fetch_one(
            query,
            user_id,
            session_token,
            session_info.get("application", "nura-main"),
            session_info.get("user_agent"),
            session_info.get("ip_address"),
            expires_at
        )
        
        return dict(session)
    
    async def _cleanup_user_sessions(self, user_id: str):
        """Cleanup user OAuth tokens and SSO sessions"""
        # Deactivate OAuth tokens
        await self.db.execute(
            "UPDATE corporate_auth.oauth_tokens SET is_active = false, updated_at = NOW() WHERE user_id = $1",
            user_id
        )
        
        # Deactivate SSO sessions
        await self.db.execute(
            "UPDATE corporate_auth.sso_sessions SET is_active = false WHERE user_id = $1",
            user_id
        )
    
    async def refresh_token(self, refresh_request: TokenRefreshRequest):
        """Refresh OAuth access token"""
        # Implementation for token refresh
        # ... (complete implementation would follow similar patterns)
        pass
    
    async def revoke_token(self, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
        """Revoke OAuth token and logout"""
        # Implementation for token revocation
        # ... (complete implementation would follow similar patterns)
        pass
    
    async def get_user_profile(self, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
        """Get current user's OAuth profile"""
        # Implementation for getting user profile
        # ... (complete implementation would follow similar patterns)
        pass
    
    async def get_authorized_domains(self):
        """Get list of authorized corporate domains"""
        query = """
            SELECT domain, organization_name, authorized_roles
            FROM corporate_auth.corporate_domains 
            WHERE domain_status = 'active'
            ORDER BY organization_name
        """
        domains = await self.db.fetch_all(query)
        return [dict(domain) for domain in domains]
```

---

## Performance Optimization

### Caching Strategy

```python
# src/backend/nura-core/src/cache/cache_manager.py
import redis.asyncio as redis
import json
import pickle
from typing import Any, Optional, Union, Dict
from datetime import timedelta
import hashlib
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Gestor de cache distribuido con Redis"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_pool = None
        self.redis_url = redis_url
        self.default_ttl = 3600  # 1 hour
        
    async def initialize(self):
        """Inicializar pool de conexiones Redis"""
        self.redis_pool = redis.ConnectionPool.from_url(self.redis_url)
        
    async def get_client(self) -> redis.Redis:
        """Obtener cliente Redis"""
        return redis.Redis(connection_pool=self.redis_pool)
    
    def _generate_key(self, namespace: str, key: str, **kwargs) -> str:
        """Generar clave de cache con namespace"""
        if kwargs:
            # Include additional parameters in key
            params_str = json.dumps(kwargs, sort_keys=True)
            params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
            return f"nura:{namespace}:{key}:{params_hash}"
        return f"nura:{namespace}:{key}"
    
    async def get(self, namespace: str, key: str, **kwargs) -> Optional[Any]:
        """Obtener valor del cache"""
        try:
            client = await self.get_client()
            cache_key = self._generate_key(namespace, key, **kwargs)
            
            value = await client.get(cache_key)
            if value:
                # Try JSON first, then pickle as fallback
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    return pickle.loads(value)
            
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {str(e)}")
            return None
    
    async def set(
        self, 
        namespace: str, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None,
        **kwargs
    ) -> bool:
        """Establecer valor en cache"""
        try:
            client = await self.get_client()
            cache_key = self._generate_key(namespace, key, **kwargs)
            
            # Try JSON first, then pickle as fallback
            try:
                serialized_value = json.dumps(value)
            except TypeError:
                serialized_value = pickle.dumps(value)
            
            ttl = ttl or self.default_ttl
            await client.setex(cache_key, ttl, serialized_value)
            
            return True
            
        except Exception as e:
            logger.error(f"Cache set error: {str(e)}")
            return False
    
    async def delete(self, namespace: str, key: str, **kwargs) -> bool:
        """Eliminar valor del cache"""
        try:
            client = await self.get_client()
            cache_key = self._generate_key(namespace, key, **kwargs)
            
            result = await client.delete(cache_key)
            return result > 0
            
        except Exception as e:
            logger.error(f"Cache delete error: {str(e)}")
            return False
    
    async def invalidate_namespace(self, namespace: str) -> int:
        """Invalidar todo un namespace"""
        try:
            client = await self.get_client()
            pattern = f"nura:{namespace}:*"
            
            keys = await client.keys(pattern)
            if keys:
                return await client.delete(*keys)
            
            return 0
            
        except Exception as e:
            logger.error(f"Cache namespace invalidation error: {str(e)}")
            return 0

# Cache decorators
def cache_result(namespace: str, ttl: int = 3600, key_generator=None):
    """Decorator para cachear resultados de funciones"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            if key_generator:
                cache_key = key_generator(*args, **kwargs)
            else:
                cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await cache_manager.get(namespace, cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(namespace, cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Global cache manager
cache_manager = CacheManager()

# Usage examples
@cache_result("conversation", ttl=1800)  # 30 minutes
async def get_conversation_context(conversation_id: str, user_id: str):
    """Example of cached conversation context"""
    pass

@cache_result("knowledge", ttl=3600)  # 1 hour
async def search_knowledge_base(query: str, domain: str):
    """Example of cached knowledge search"""
    pass
```

Esta arquitectura backend implementa:

1. **Microkernel Pattern** con hot-swapping de plugins
2. **Clean Architecture** con separation of concerns
3. **Repository Pattern** para data access
4. **JWT Authentication** con role-based authorization
5. **Global Error Handling** con respuestas estandarizadas
6. **Performance Optimization** con caching distribuido
7. **Async/Await** patterns para máxima concurrencia
8. **Connection Pooling** optimizado por environment
9. **Event-Driven Architecture** entre plugins
10. **Comprehensive Logging** y observability

La arquitectura está preparada para **escalabilidad horizontal** y **deployment híbrido** (serverless + containers).

¿Continuamos con la siguiente sección **Security Architecture**?