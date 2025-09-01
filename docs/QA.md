# Estrategia de Testing - Chatbot de Portfolio Profesional
## Plan de Calidad y Aseguramiento

*Este documento define la estrategia completa de testing para el chatbot de portfolio profesional, incluyendo tipos de pruebas, casos de prueba, cobertura y herramientas de automatización.*

---

## 🎯 Objetivos de la Estrategia de Testing

### **Objetivos Principales:**
- **Validar funcionalidad:** Asegurar que todas las funcionalidades del chatbot funcionen correctamente
- **Garantizar calidad:** Mantener estándares de calidad en todas las entregas
- **Reducir riesgos:** Identificar y mitigar problemas antes de llegar a producción
- **Mejorar experiencia:** Validar que la experiencia del usuario sea óptima
- **Cumplir requisitos:** Verificar que el sistema cumpla con todas las especificaciones BDD

### **Métricas de Éxito:**
- **Cobertura de código:** Mínimo 90% en funcionalidades críticas
- **Tiempo de respuesta:** Máximo 2 segundos para respuestas del chatbot
- **Disponibilidad:** 99.9% de uptime en producción
- **Satisfacción del usuario:** Mínimo 4.5/5 en métricas de UX

---

## 🧪 Tipos de Pruebas y Justificación

### **1. Pruebas Unitarias (Unit Testing)**
**Justificación:** Validar que cada componente individual funcione correctamente de forma aislada.

**Componentes a probar:**
- Funciones de procesamiento de lenguaje natural
- Lógica de búsqueda en documento consolidado
- Validaciones de entrada de usuario
- Funciones de detección de idioma
- Lógica de generación de respuestas

**Herramientas recomendadas:**
- **Python:** pytest, unittest
- **JavaScript/React:** Jest, React Testing Library
- **Cobertura:** Coverage.py, Istanbul

### **2. Pruebas de Integración (Integration Testing)**
**Justificación:** Verificar que los componentes trabajen correctamente juntos y se comuniquen adecuadamente.

**Integraciones a probar:**
- Frontend ↔ Backend API
- Chatbot ↔ LLM Service
- Sistema de logs ↔ Base de datos
- Notificaciones ↔ Servicio de email
- Analytics ↔ Sistema de métricas

**Herramientas recomendadas:**
- **API Testing:** Postman, Insomnia
- **Database Testing:** pytest-django, factory_boy
- **Mock Services:** WireMock, MSW (Mock Service Worker)

### **3. Pruebas de Sistema (System Testing)**
**Justificación:** Validar que todo el sistema funcione como un conjunto integrado según las especificaciones BDD.

**Flujos completos a probar:**
- Conversación completa del chatbot
- Captura y gestión de usuarios
- Generación de analytics
- Sistema de notificaciones
- Descarga de conversaciones

**Herramientas recomendadas:**
- **E2E Testing:** Selenium, Playwright
- **API E2E:** REST Assured, Supertest
- **Performance:** JMeter, K6

### **4. Pruebas de Aceptación (Acceptance Testing)**
**Justificación:** Verificar que el sistema cumpla con los requisitos de negocio definidos en las historias de usuario.

**Criterios de aceptación:**
- Todas las funcionalidades del BDD funcionan correctamente
- Experiencia de usuario cumple con estándares de UX
- Rendimiento cumple con SLAs definidos
- Seguridad cumple con estándares OWASP

**Herramientas recomendadas:**
- **BDD Testing:** Behave (Python), Cucumber
- **User Journey Testing:** Cypress, TestCafe
- **Accessibility Testing:** axe-core, WAVE

### **5. Pruebas de Rendimiento (Performance Testing)**
**Justificación:** Asegurar que el sistema maneje la carga esperada y responda en tiempos aceptables.

**Métricas a validar:**
- Tiempo de respuesta del chatbot (< 2 segundos)
- Capacidad de usuarios concurrentes (mínimo 100)
- Rendimiento bajo carga (stress testing)
- Escalabilidad del sistema

**Herramientas recomendadas:**
- **Load Testing:** JMeter, K6, Artillery
- **Monitoring:** Prometheus, Grafana
- **Profiling:** cProfile, memory_profiler

### **6. Pruebas de Seguridad (Security Testing)**
**Justificación:** Identificar vulnerabilidades y asegurar que el sistema cumpla con estándares de seguridad.

**Áreas de seguridad a probar:**
- Autenticación y autorización
- Protección de datos personales
- Validación de entrada
- Prevención de ataques comunes (OWASP Top 10)
- Seguridad de la API

**Herramientas recomendadas:**
- **Static Analysis:** Bandit, SonarQube
- **Dynamic Testing:** OWASP ZAP, Burp Suite
- **Dependency Scanning:** Safety, npm audit

### **7. Pruebas de Usabilidad (Usability Testing)**
**Justificación:** Validar que la interfaz sea intuitiva y accesible para todos los usuarios.

**Aspectos a evaluar:**
- Navegación intuitiva
- Accesibilidad (WCAG 2.1 AA)
- Responsive design
- Experiencia en diferentes dispositivos
- Accesibilidad para usuarios con discapacidades

**Herramientas recomendadas:**
- **Accessibility Testing:** axe-core, WAVE
- **Responsive Testing:** BrowserStack, LambdaTest
- **User Testing:** UsabilityHub, Hotjar

---

## 📋 Casos de Prueba por Épica

### **Épica 1: Funcionalidad Core del Chatbot**

#### **TC-001: Inicio de Conversación**
**Tipo:** Prueba de Aceptación  
**Prioridad:** Alta  
**Descripción:** Verificar que el usuario pueda iniciar una conversación con el chatbot

**Precondiciones:**
- Usuario está en almapi.dev
- Chatbot está visible y funcional

**Pasos de Prueba:**
1. Usuario hace clic en el chatbot
2. Se abre la interfaz de chat
3. Se muestra mensaje de bienvenida
4. Chatbot está listo para recibir preguntas

**Resultado Esperado:**
- La interfaz se abre correctamente
- El mensaje de bienvenida es apropiado
- El chatbot responde a la primera pregunta

**Criterios de Aceptación:**
- ✅ Interfaz se abre en < 1 segundo
- ✅ Mensaje de bienvenida es personalizado
- ✅ Chatbot responde correctamente a la primera pregunta

#### **TC-002: Conversación en Lenguaje Natural**
**Tipo:** Prueba de Integración  
**Prioridad:** Alta  
**Descripción:** Verificar que el chatbot entienda y responda preguntas en lenguaje natural

**Precondiciones:**
- Chatbot está activo y funcionando
- Usuario ha iniciado una conversación

**Pasos de Prueba:**
1. Usuario escribe "¿Cuál es tu experiencia con React?"
2. Chatbot procesa la consulta
3. Genera respuesta relevante y contextual
4. Mantiene contexto para preguntas de seguimiento

**Resultado Esperado:**
- Chatbot entiende la pregunta sobre React
- Proporciona información específica y relevante
- Mantiene contexto para conversación posterior

**Criterios de Aceptación:**
- ✅ Respuesta se genera en < 2 segundos
- ✅ Información es precisa y verificable
- ✅ Contexto se mantiene para preguntas de seguimiento

#### **TC-003: Respuestas Basadas en Documento Consolidado**
**Tipo:** Prueba de Sistema  
**Prioridad:** Alta  
**Descripción:** Verificar que las respuestas se basen en información real del documento consolidado

**Precondiciones:**
- Documento consolidado está disponible
- Chatbot tiene acceso a la información

**Pasos de Prueba:**
1. Usuario hace pregunta específica sobre experiencia
2. Chatbot consulta documento consolidado
3. Extrae información relevante
4. Genera respuesta precisa y verificable

**Resultado Esperado:**
- Respuesta se basa en información real del documento
- Información es precisa y actualizada
- Se pueden proporcionar ejemplos específicos

**Criterios de Aceptación:**
- ✅ Respuesta se basa en documento consolidado
- ✅ Información es precisa y verificable
- ✅ Se pueden proporcionar ejemplos específicos

#### **TC-004: Descarga de Conversaciones**
**Tipo:** Prueba de Aceptación  
**Prioridad:** Media  
**Descripción:** Verificar que el usuario pueda descargar conversaciones completas

**Precondiciones:**
- Usuario ha completado una conversación
- Función de descarga está habilitada

**Pasos de Prueba:**
1. Usuario solicita descargar conversación
2. Sistema genera archivo descargable
3. Archivo contiene conversación completa
4. Se incluye información de contexto y timestamp

**Resultado Esperado:**
- Se genera archivo descargable
- Archivo contiene conversación completa
- Información está bien formateada

**Criterios de Aceptación:**
- ✅ Archivo se genera en < 5 segundos
- ✅ Contenido es legible y completo
- ✅ Se incluye información de contexto

---

### **Épica 2: Soporte Multilingüe**

#### **TC-005: Detección Automática de Idioma**
**Tipo:** Prueba de Integración  
**Prioridad:** Alta  
**Descripción:** Verificar que el chatbot detecte automáticamente el idioma del usuario

**Precondiciones:**
- Chatbot soporta múltiples idiomas
- Sistema de detección está configurado

**Pasos de Prueba:**
1. Usuario escribe en español
2. Chatbot detecta idioma automáticamente
3. Responde completamente en español
4. Mantiene calidad técnica de la información

**Resultado Esperado:**
- Idioma se detecta correctamente
- Respuesta está completamente en español
- Calidad técnica se mantiene

**Criterios de Aceptación:**
- ✅ Idioma se detecta en < 1 segundo
- ✅ Respuesta está completamente en español
- ✅ Calidad técnica se mantiene

#### **TC-006: Respuestas en Idioma del Usuario**
**Tipo:** Prueba de Sistema  
**Prioridad:** Alta  
**Descripción:** Verificar que las respuestas estén en el idioma del usuario

**Precondiciones:**
- Usuario ha escrito en idioma específico
- Chatbot ha detectado el idioma correctamente

**Pasos de Prueba:**
1. Usuario consulta sobre tecnologías específicas
2. Chatbot responde en idioma del usuario
3. Términos técnicos están en idioma correcto
4. Información es clara y comprensible

**Resultado Esperado:**
- Respuesta está en idioma del usuario
- Términos técnicos son claros
- Información es comprensible

**Criterios de Aceptación:**
- ✅ Respuesta está completamente en idioma del usuario
- ✅ Términos técnicos son claros y apropiados
- ✅ Información es comprensible

---

### **Épica 3: Captura y Gestión de Usuarios**

#### **TC-007: Captura de Datos de Usuario**
**Tipo:** Prueba de Aceptación  
**Prioridad:** Alta  
**Descripción:** Verificar que se capture información básica de usuarios de manera no invasiva

**Precondiciones:**
- Usuario inicia conversación por primera vez
- Sistema de captura está configurado

**Pasos de Prueba:**
1. Usuario inicia conversación
2. Sistema solicita información básica
3. Usuario completa campos requeridos
4. Información se valida y almacena

**Resultado Esperado:**
- Se solicitan solo campos esenciales
- Validación funciona en tiempo real
- Información se almacena de manera segura

**Criterios de Aceptación:**
- ✅ Solo se solicitan campos esenciales
- ✅ Validación funciona en tiempo real
- ✅ Información se almacena de manera segura

#### **TC-008: Gestión de Base de Contactos**
**Tipo:** Prueba de Sistema  
**Prioridad:** Media  
**Descripción:** Verificar que se pueda gestionar la base de contactos efectivamente

**Precondiciones:**
- Base de contactos contiene datos
- Propietario tiene acceso al sistema

**Pasos de Prueba:**
1. Propietario accede al sistema
2. Consulta base de contactos
3. Filtra y busca por criterios
4. Prioriza leads para seguimiento

**Resultado Esperado:**
- Se pueden ver todos los contactos
- Filtros y búsquedas funcionan
- Se pueden priorizar leads

**Criterios de Aceptación:**
- ✅ Se pueden ver todos los contactos
- ✅ Filtros y búsquedas funcionan correctamente
- ✅ Se pueden priorizar leads efectivamente

---

### **Épica 4: Sistema de Analytics y Estadísticas**

#### **TC-009: Generación de Estadísticas de Uso**
**Tipo:** Prueba de Sistema  
**Prioridad:** Media  
**Descripción:** Verificar que se generen estadísticas de uso en tiempo real

**Precondiciones:**
- Usuarios interactúan con el chatbot
- Sistema de analytics está configurado

**Pasos de Prueba:**
1. Usuarios interactúan con chatbot
2. Sistema registra interacciones
3. Genera estadísticas en tiempo real
4. Identifica patrones de comportamiento

**Resultado Esperado:**
- Se generan estadísticas en tiempo real
- Se identifican patrones de comportamiento
- Información se presenta de manera clara

**Criterios de Aceptación:**
- ✅ Estadísticas se generan en tiempo real
- ✅ Patrones se identifican correctamente
- ✅ Información se presenta de manera clara

#### **TC-010: Análisis de Preguntas Frecuentes**
**Tipo:** Prueba de Sistema  
**Prioridad:** Media  
**Descripción:** Verificar que se identifiquen preguntas frecuentes para mejoras

**Precondiciones:**
- Se han registrado múltiples preguntas
- Sistema de análisis está configurado

**Pasos de Prueba:**
1. Sistema analiza patrones de preguntas
2. Identifica preguntas más comunes
3. Categoriza por tema y frecuencia
4. Prioriza oportunidades de mejora

**Resultado Esperado:**
- Se identifican preguntas frecuentes
- Se categorizan correctamente
- Se priorizan mejoras apropiadamente

**Criterios de Aceptación:**
- ✅ Preguntas frecuentes se identifican correctamente
- ✅ Categorización es apropiada
- ✅ Mejoras se priorizan efectivamente

---

### **Épica 5: Experiencia del Usuario y UI/UX**

#### **TC-011: Interfaz Responsive del Chatbot**
**Tipo:** Prueba de Usabilidad  
**Prioridad:** Alta  
**Descripción:** Verificar que el chatbot funcione en diferentes dispositivos

**Precondiciones:**
- Chatbot está desplegado
- Diferentes dispositivos están disponibles

**Pasos de Prueba:**
1. Usuario accede desde dispositivo móvil
2. Abre el chatbot
3. Interfaz se adapta al tamaño de pantalla
4. Todos los elementos son accesibles

**Resultado Esperado:**
- Interfaz se adapta correctamente
- Elementos son accesibles
- Experiencia es consistente

**Criterios de Aceptación:**
- ✅ Interfaz se adapta al tamaño de pantalla
- ✅ Todos los elementos son accesibles
- ✅ Experiencia es consistente entre dispositivos

#### **TC-012: Estados de Interfaz del Chat**
**Tipo:** Prueba de Usabilidad  
**Prioridad:** Media  
**Descripción:** Verificar que los estados del chatbot sean claros y visibles

**Precondiciones:**
- Chatbot está funcionando
- Diferentes estados están implementados

**Pasos de Prueba:**
1. Chatbot está minimizado
2. Usuario hace clic para expandir
3. Se expande suavemente
4. Transición es natural y fluida

**Resultado Esperado:**
- Estados son claros y visibles
- Transiciones son suaves
- Usuario entiende el estado actual

**Criterios de Aceptación:**
- ✅ Estados son claros y visibles
- ✅ Transiciones son suaves y naturales
- ✅ Usuario entiende el estado actual

---

### **Épica 6: Integración y Despliegue**

#### **TC-013: Integración con Portfolio Existente**
**Tipo:** Prueba de Integración  
**Prioridad:** Alta  
**Descripción:** Verificar que el chatbot se integre nativamente con almapi.dev

**Precondiciones:**
- Portfolio existente está funcionando
- Chatbot está configurado para integración

**Pasos de Prueba:**
1. Chatbot se despliega en almapi.dev
2. Se integra con sitio existente
3. Mantiene identidad visual
4. Experiencia es coherente

**Resultado Esperado:**
- Integración es nativa y fluida
- Identidad visual se mantiene
- Experiencia es coherente

**Criterios de Aceptación:**
- ✅ Integración es nativa y fluida
- ✅ Identidad visual se mantiene
- ✅ Experiencia es coherente con el resto del sitio

#### **TC-014: Sistema de Logs y Monitoreo**
**Tipo:** Prueba de Sistema  
**Prioridad:** Media  
**Descripción:** Verificar que se generen logs detallados para monitoreo

**Precondiciones:**
- Sistema de logging está configurado
- Operaciones del chatbot están ejecutándose

**Pasos de Prueba:**
1. Se ejecuta operación del chatbot
2. Sistema registra actividad
3. Genera log detallado
4. Incluye información para debugging

**Resultado Esperado:**
- Se generan logs detallados
- Información es útil para debugging
- Historial se mantiene completo

**Criterios de Aceptación:**
- ✅ Se generan logs detallados
- ✅ Información es útil para debugging
- ✅ Historial se mantiene completo

---

## 🔧 Estrategia de Automatización

### **Pirámide de Testing**

```
        /\
       /  \     Manual Testing (5%)
      /____\     E2E Testing (15%)
     /      \    Integration Testing (30%)
    /________\   Unit Testing (50%)
```

### **Automatización por Nivel**

#### **Nivel 1: Pruebas Unitarias (50%)**
**Objetivo:** Automatización completa de pruebas unitarias
**Herramientas:** pytest, Jest, React Testing Library
**Cobertura objetivo:** 90%+

**Componentes a automatizar:**
- Funciones de procesamiento de lenguaje natural
- Lógica de búsqueda y filtrado
- Validaciones de entrada
- Funciones de utilidad

#### **Nivel 2: Pruebas de Integración (30%)**
**Objetivo:** Automatización de pruebas de integración críticas
**Herramientas:** pytest-django, Supertest, MSW
**Cobertura objetivo:** 80%+

**Integraciones a automatizar:**
- API endpoints principales
- Integración con base de datos
- Servicios externos (LLM, email)
- Sistema de logs

#### **Nivel 3: Pruebas E2E (15%)**
**Objetivo:** Automatización de flujos críticos de usuario
**Herramientas:** Playwright, Cypress
**Cobertura objetivo:** 60%+

**Flujos a automatizar:**
- Inicio de conversación
- Conversación básica
- Captura de datos de usuario
- Descarga de conversaciones

#### **Nivel 4: Pruebas Manuales (5%)**
**Objetivo:** Validación de aspectos que requieren intervención humana
**Áreas:** Usabilidad, accesibilidad, experiencia de usuario

---

## 📊 Métricas de Cobertura y Calidad

### **Cobertura de Código**
- **Funcionalidades críticas:** 95%+
- **Funcionalidades estándar:** 90%+
- **Funcionalidades opcionales:** 80%+
- **Cobertura total del proyecto:** 90%+

### **Métricas de Calidad**
- **Densidad de bugs:** < 0.1 bugs por 100 líneas de código
- **Tiempo de resolución:** < 24 horas para bugs críticos
- **Tasa de reincidencia:** < 5% de bugs reabiertos
- **Satisfacción del usuario:** 4.5/5 en métricas de UX

### **Métricas de Rendimiento**
- **Tiempo de respuesta:** < 2 segundos para respuestas del chatbot
- **Disponibilidad:** 99.9% de uptime
- **Capacidad de usuarios:** 100+ usuarios concurrentes
- **Escalabilidad:** Incremento lineal del rendimiento

---

## 🚀 Plan de Implementación

### **Fase 1: Preparación (Semana 1)**
- Configuración de herramientas de testing
- Definición de estándares de calidad
- Configuración de entornos de testing
- Creación de scripts de automatización básicos

### **Fase 2: Implementación Básica (Semanas 2-3)**
- Implementación de pruebas unitarias
- Configuración de pruebas de integración
- Implementación de pruebas E2E básicas
- Configuración de CI/CD pipeline

### **Fase 3: Implementación Avanzada (Semanas 4-5)**
- Implementación de pruebas de rendimiento
- Configuración de pruebas de seguridad
- Implementación de pruebas de usabilidad
- Optimización de automatización

### **Fase 4: Validación y Optimización (Semana 6)**
- Validación de cobertura de pruebas
- Optimización de tiempos de ejecución
- Documentación de procedimientos
- Entrenamiento del equipo

---

## 🛠️ Herramientas y Tecnologías

### **Testing Framework**
- **Python Backend:** pytest, pytest-django, factory_boy
- **JavaScript Frontend:** Jest, React Testing Library, MSW
- **E2E Testing:** Playwright, Cypress
- **API Testing:** Postman, Insomnia, REST Assured

### **Automatización y CI/CD**
- **CI/CD:** GitHub Actions, GitLab CI
- **Containerización:** Docker, Docker Compose
- **Orquestación:** Kubernetes (opcional)
- **Monitoring:** Prometheus, Grafana

### **Calidad y Análisis**
- **Cobertura:** Coverage.py, Istanbul
- **Análisis estático:** SonarQube, ESLint, Pylint
- **Seguridad:** Bandit, OWASP ZAP
- **Performance:** JMeter, K6, Artillery

---

## 📋 Checklist de Validación

### **Pre-Release**
- [ ] Todas las pruebas unitarias pasan (100%)
- [ ] Todas las pruebas de integración pasan (100%)
- [ ] Pruebas E2E críticas pasan (100%)
- [ ] Cobertura de código >= 90%
- [ ] Pruebas de seguridad completadas
- [ ] Pruebas de rendimiento validadas
- [ ] Pruebas de usabilidad completadas
- [ ] Documentación de testing actualizada

### **Post-Release**
- [ ] Monitoreo de métricas de producción
- [ ] Validación de SLAs de rendimiento
- [ ] Revisión de logs y métricas
- [ ] Análisis de feedback de usuarios
- [ ] Identificación de oportunidades de mejora

---

## 🔍 Proceso de Reporting y Análisis

### **Reportes Diarios**
- Estado de ejecución de pruebas automatizadas
- Métricas de cobertura de código
- Identificación de regresiones
- Tiempo de resolución de bugs

### **Reportes Semanales**
- Resumen de calidad del sprint
- Análisis de tendencias de bugs
- Métricas de rendimiento del sistema
- Recomendaciones de mejora

### **Reportes Mensuales**
- Análisis completo de calidad del proyecto
- Comparación con métricas objetivo
- Identificación de patrones y tendencias
- Plan de acciones de mejora

---

*Esta estrategia de testing proporciona un marco completo para asegurar la calidad del chatbot de portfolio profesional, garantizando que todas las funcionalidades cumplan con los requisitos de negocio y estándares de calidad establecidos.*

## Plan de Testing de Integración

### Testing de Integración Dialogflow + Vertex AI

El testing de integración es fundamental para asegurar que todos los componentes del sistema funcionen correctamente juntos, especialmente la integración entre Dialogflow y Vertex AI.

#### **1. Testing de Integración Dialogflow + Vertex AI**

##### **Objetivos del Testing de Integración**
- Verificar la comunicación correcta entre Dialogflow y Vertex AI
- Validar el flujo completo de procesamiento de mensajes
- Asegurar la consistencia de respuestas
- Probar el manejo de errores y fallbacks

##### **Estrategia de Testing**
```python
# tests/integration/test_dialogflow_vertex_integration.py
import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from services.dialogflow_service import DialogflowService
from services.vertex_ai_service import VertexAIService
from services.chat_service import ChatService

class TestDialogflowVertexIntegration:
    """Tests de integración entre Dialogflow y Vertex AI"""
    
    @pytest.fixture
    def mock_dialogflow_service(self):
        """Mock del servicio de Dialogflow"""
        service = Mock(spec=DialogflowService)
        service.detect_intent.return_value = {
            "intent": "experience_query",
            "confidence": 0.95,
            "parameters": {"technology": "Python"},
            "fulfillment_text": "Entiendo que quieres saber sobre Python"
        }
        return service
    
    @pytest.fixture
    def mock_vertex_ai_service(self):
        """Mock del servicio de Vertex AI"""
        service = Mock(spec=VertexAIService)
        service.generate_response.return_value = {
            "response": "Tengo más de 5 años de experiencia en Python...",
            "confidence": 0.92,
            "tokens_used": 45
        }
        return service
    
    def test_complete_message_flow(self, mock_dialogflow_service, mock_vertex_ai_service):
        """Test del flujo completo de procesamiento de mensajes"""
        # Configurar mocks
        chat_service = ChatService(
            dialogflow_service=mock_dialogflow_service,
            vertex_ai_service=mock_vertex_ai_service
        )
        
        # Simular mensaje del usuario
        user_message = "¿Cuál es tu experiencia en Python?"
        
        # Procesar mensaje
        result = chat_service.process_message(user_message)
        
        # Verificar que se llamó a Dialogflow
        mock_dialogflow_service.detect_intent.assert_called_once_with(user_message)
        
        # Verificar que se llamó a Vertex AI
        mock_vertex_ai_service.generate_response.assert_called_once()
        
        # Verificar resultado
        assert result["response"] is not None
        assert result["confidence"] > 0.8
        assert "Python" in result["response"]
    
    def test_intent_detection_fallback(self, mock_dialogflow_service, mock_vertex_ai_service):
        """Test de fallback cuando Dialogflow no detecta intent"""
        # Configurar Dialogflow para no detectar intent
        mock_dialogflow_service.detect_intent.return_value = {
            "intent": "default_fallback_intent",
            "confidence": 0.3,
            "parameters": {},
            "fulfillment_text": "No entiendo tu pregunta"
        }
        
        chat_service = ChatService(
            dialogflow_service=mock_dialogflow_service,
            vertex_ai_service=mock_vertex_ai_service
        )
        
        # Procesar mensaje ambiguo
        user_message = "Hola, ¿cómo estás?"
        
        result = chat_service.process_message(user_message)
        
        # Verificar que se usó el fallback
        assert result["response"] is not None
        assert result["confidence"] > 0.5
    
    def test_error_handling_dialogflow_failure(self, mock_dialogflow_service, mock_vertex_ai_service):
        """Test de manejo de errores cuando Dialogflow falla"""
        # Configurar Dialogflow para fallar
        mock_dialogflow_service.detect_intent.side_effect = Exception("Dialogflow API error")
        
        chat_service = ChatService(
            dialogflow_service=mock_dialogflow_service,
            vertex_ai_service=mock_vertex_ai_service
        )
        
        # Procesar mensaje
        user_message = "¿Cuál es tu experiencia?"
        
        # Debe manejar el error graciosamente
        result = chat_service.process_message(user_message)
        
        # Verificar que se generó una respuesta de fallback
        assert result["response"] is not None
        assert "error" not in result
    
    def test_context_preservation_across_messages(self, mock_dialogflow_service, mock_vertex_ai_service):
        """Test de preservación de contexto entre mensajes"""
        chat_service = ChatService(
            dialogflow_service=mock_dialogflow_service,
            vertex_ai_service=mock_vertex_ai_service
        )
        
        # Primera pregunta
        message1 = "¿Cuál es tu experiencia en Python?"
        result1 = chat_service.process_message(message1, conversation_id="conv_123")
        
        # Segunda pregunta relacionada
        message2 = "¿Y en Django también?"
        result2 = chat_service.process_message(message2, conversation_id="conv_123")
        
        # Verificar que se mantiene el contexto
        assert result1["conversation_id"] == result2["conversation_id"]
        assert "Python" in result1["response"]
        assert "Django" in result2["response"]
```

#### **2. Testing de la API Completa con Diferentes Escenarios**

##### **Escenarios de Testing de API**
```python
# tests/integration/test_api_scenarios.py
import pytest
from fastapi.testclient import TestClient
from main import app
import json

class TestAPIScenarios:
    """Tests de escenarios completos de la API"""
    
    @pytest.fixture
    def client(self):
        """Cliente de testing de FastAPI"""
        return TestClient(app)
    
    @pytest.fixture
    def test_user_data(self):
        """Datos de usuario para testing"""
        return {
            "email": "test@example.com",
            "name": "Usuario Test",
            "role": "Software Engineer",
            "company": "Test Corp",
            "industry": "Technology"
        }
    
    def test_complete_user_journey(self, client, test_user_data):
        """Test del journey completo de un usuario"""
        # 1. Crear usuario
        create_response = client.post("/v1/users", json=test_user_data)
        assert create_response.status_code == 201
        
        user_data = create_response.json()["data"]
        user_id = user_data["user_id"]
        
        # 2. Crear conversación
        conversation_data = {
            "user_id": user_id,
            "title": "Consulta sobre experiencia",
            "preferences": {"language": "es", "detail_level": "high"}
        }
        
        conv_response = client.post("/v1/conversations", json=conversation_data)
        assert conv_response.status_code == 201
        
        conversation_data = conv_response.json()["data"]
        conversation_id = conversation_data["conversation_id"]
        session_id = conversation_data["session_id"]
        
        # 3. Enviar mensaje al chatbot
        chat_message = {
            "message": "¿Cuál es tu experiencia en Python?",
            "user_id": user_id,
            "session_id": session_id,
            "context": {
                "user_preferences": {"language": "es", "detail_level": "high"}
            }
        }
        
        chat_response = client.post("/v1/chat", json=chat_message)
        assert chat_response.status_code == 200
        
        chat_data = chat_response.json()["data"]
        assert "response" in chat_data
        assert chat_data["conversation_id"] == conversation_id
        
        # 4. Obtener historial de conversación
        history_response = client.get(f"/v1/conversations/{conversation_id}")
        assert history_response.status_code == 200
        
        history_data = history_response.json()["data"]
        assert len(history_data["messages"]) >= 2  # Mensaje del usuario + respuesta del bot
        
        # 5. Obtener analytics del usuario
        analytics_response = client.get(f"/v1/analytics?user_id={user_id}")
        assert analytics_response.status_code == 200
        
        analytics_data = analytics_response.json()["data"]
        assert analytics_data["metrics"]["users"]["total_users"] >= 1
    
    def test_rate_limiting(self, client, test_user_data):
        """Test de rate limiting de la API"""
        # Crear usuario
        user_response = client.post("/v1/users", json=test_user_data)
        user_id = user_response.json()["data"]["user_id"]
        
        # Enviar múltiples mensajes rápidamente
        session_id = "test_session"
        message_template = {
            "message": "Test message",
            "user_id": user_id,
            "session_id": session_id
        }
        
        # Enviar 10 mensajes (límite por minuto)
        for i in range(10):
            response = client.post("/v1/chat", json=message_template)
            assert response.status_code == 200
        
        # El siguiente mensaje debe ser rechazado
        response = client.post("/v1/chat", json=message_template)
        assert response.status_code == 429
        assert "rate limit" in response.json()["error"]["message"].lower()
    
    def test_error_scenarios(self, client):
        """Test de diferentes escenarios de error"""
        # 1. Usuario no encontrado
        response = client.get("/v1/users/non-existent-id")
        assert response.status_code == 404
        
        # 2. Datos inválidos
        invalid_user_data = {"email": "invalid-email", "name": ""}
        response = client.post("/v1/users", json=invalid_user_data)
        assert response.status_code == 422
        
        # 3. Mensaje vacío
        empty_message = {"message": "", "user_id": "test", "session_id": "test"}
        response = client.post("/v1/chat", json=empty_message)
        assert response.status_code == 422
        
        # 4. Autenticación requerida (sin API key)
        # Nota: Esto depende de la configuración de autenticación
        # response = client.get("/v1/users")
        # assert response.status_code == 401
    
    def test_concurrent_requests(self, client, test_user_data):
        """Test de manejo de requests concurrentes"""
        import asyncio
        import concurrent.futures
        
        # Crear usuario
        user_response = client.post("/v1/users", json=test_user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "concurrent_test_session"
        
        # Función para enviar mensaje
        def send_message(message_num):
            message_data = {
                "message": f"Test message {message_num}",
                "user_id": user_id,
                "session_id": session_id
            }
            return client.post("/v1/chat", json=message_data)
        
        # Enviar 5 mensajes concurrentemente
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(send_message, i) for i in range(5)]
            responses = [future.result() for future in futures]
        
        # Verificar que todos los requests fueron exitosos
        for response in responses:
            assert response.status_code == 200
        
        # Verificar que se crearon 5 mensajes
        # Esto requeriría un endpoint para obtener mensajes de una sesión
```

#### **3. Testing de Performance y Carga**

##### **Estrategia de Performance Testing**
```python
# tests/performance/test_performance.py
import pytest
import time
import statistics
from fastapi.testclient import TestClient
from main import app
import asyncio
import concurrent.futures

class TestPerformance:
    """Tests de performance y carga de la API"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_response_time_under_load(self, client):
        """Test de tiempo de respuesta bajo carga"""
        # Crear usuario de prueba
        user_data = {
            "email": "perf@test.com",
            "name": "Performance Test User",
            "role": "Tester"
        }
        
        user_response = client.post("/v1/users", json=user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "perf_test_session"
        
        # Enviar múltiples mensajes y medir tiempo de respuesta
        response_times = []
        message_template = {
            "message": "Performance test message",
            "user_id": user_id,
            "session_id": session_id
        }
        
        for i in range(10):
            start_time = time.time()
            response = client.post("/v1/chat", json=message_template)
            end_time = time.time()
            
            assert response.status_code == 200
            response_times.append((end_time - start_time) * 1000)  # Convertir a ms
        
        # Calcular estadísticas
        avg_response_time = statistics.mean(response_times)
        p95_response_time = statistics.quantiles(response_times, n=20)[18]  # 95th percentile
        max_response_time = max(response_times)
        
        # Verificar que cumple con los requisitos de performance
        assert avg_response_time < 2000, f"Tiempo promedio de respuesta muy alto: {avg_response_time:.2f}ms"
        assert p95_response_time < 5000, f"P95 de tiempo de respuesta muy alto: {p95_response_time:.2f}ms"
        assert max_response_time < 10000, f"Tiempo máximo de respuesta muy alto: {max_response_time:.2f}ms"
        
        print(f"Performance Results:")
        print(f"  Average: {avg_response_time:.2f}ms")
        print(f"  P95: {p95_response_time:.2f}ms")
        print(f"  Max: {max_response_time:.2f}ms")
    
    def test_concurrent_user_simulation(self, client):
        """Test de simulación de usuarios concurrentes"""
        # Crear múltiples usuarios
        users = []
        for i in range(10):
            user_data = {
                "email": f"user{i}@test.com",
                "name": f"User {i}",
                "role": "Tester"
            }
            response = client.post("/v1/users", json=user_data)
            users.append(response.json()["data"])
        
        # Simular conversaciones concurrentes
        def simulate_user_conversation(user):
            session_id = f"session_{user['user_id']}"
            messages = [
                "Hola",
                "¿Cuál es tu experiencia?",
                "Gracias"
            ]
            
            response_times = []
            for message in messages:
                chat_data = {
                    "message": message,
                    "user_id": user["user_id"],
                    "session_id": session_id
                }
                
                start_time = time.time()
                response = client.post("/v1/chat", json=chat_data)
                end_time = time.time()
                
                assert response.status_code == 200
                response_times.append((end_time - start_time) * 1000)
            
            return response_times
        
        # Ejecutar conversaciones concurrentemente
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(simulate_user_conversation, user) for user in users]
            all_response_times = [future.result() for future in futures]
        
        # Calcular métricas agregadas
        flat_response_times = [time for times in all_response_times for time in times]
        avg_response_time = statistics.mean(flat_response_times)
        p95_response_time = statistics.quantiles(flat_response_times, n=20)[18]
        
        # Verificar performance bajo carga concurrente
        assert avg_response_time < 3000, f"Tiempo promedio bajo carga muy alto: {avg_response_time:.2f}ms"
        assert p95_response_time < 8000, f"P95 bajo carga muy alto: {p95_response_time:.2f}ms"
        
        print(f"Concurrent Load Performance:")
        print(f"  Total requests: {len(flat_response_times)}")
        print(f"  Average response time: {avg_response_time:.2f}ms")
        print(f"  P95 response time: {p95_response_time:.2f}ms")
    
    def test_memory_usage(self, client):
        """Test de uso de memoria durante operaciones"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Realizar operaciones intensivas
        user_data = {
            "email": "memory@test.com",
            "name": "Memory Test User",
            "role": "Tester"
        }
        
        user_response = client.post("/v1/users", json=user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "memory_test_session"
        
        # Enviar muchos mensajes
        for i in range(50):
            message_data = {
                "message": f"Memory test message {i}",
                "user_id": user_id,
                "session_id": session_id
            }
            response = client.post("/v1/chat", json=message_data)
            assert response.status_code == 200
        
        # Medir memoria después de las operaciones
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Verificar que el uso de memoria es razonable
        assert memory_increase < 100, f"Incremento de memoria muy alto: {memory_increase:.2f}MB"
        
        print(f"Memory Usage:")
        print(f"  Initial: {initial_memory:.2f}MB")
        print(f"  Final: {final_memory:.2f}MB")
        print(f"  Increase: {memory_increase:.2f}MB")
```

#### **4. Testing de Seguridad y Vulnerabilidades**

##### **Estrategia de Security Testing**
```python
# tests/security/test_security.py
import pytest
from fastapi.testclient import TestClient
from main import app
import json

class TestSecurity:
    """Tests de seguridad de la API"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_sql_injection_prevention(self, client):
        """Test de prevención de SQL injection"""
        # Intentar SQL injection en diferentes campos
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'hacker@evil.com'); --",
            "admin'--",
            "1' UNION SELECT * FROM users--"
        ]
        
        for malicious_input in malicious_inputs:
            # Intentar en campo de email
            user_data = {
                "email": malicious_input,
                "name": "Test User",
                "role": "Tester"
            }
            
            response = client.post("/v1/users", json=user_data)
            
            # Debe fallar por validación, no por SQL injection
            assert response.status_code in [400, 422]
            assert "sql" not in response.text.lower()
    
    def test_xss_prevention(self, client):
        """Test de prevención de XSS"""
        # Crear usuario primero
        user_data = {
            "email": "xss@test.com",
            "name": "XSS Test User",
            "role": "Tester"
        }
        
        user_response = client.post("/v1/users", json=user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "xss_test_session"
        
        # Intentar XSS en mensajes
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "&#60;script&#62;alert('XSS')&#60;/script&#62;",
            "javascript:void(0)",
            "data:text/html,<script>alert('XSS')</script>"
        ]
        
        for payload in xss_payloads:
            message_data = {
                "message": payload,
                "user_id": user_id,
                "session_id": session_id
            }
            
            response = client.post("/v1/chat", json=message_data)
            
            # Debe procesar el mensaje sin ejecutar scripts
            assert response.status_code == 200
            
            # Verificar que la respuesta no contiene el payload malicioso
            response_data = response.json()["data"]
            assert "<script>" not in response_data["response"]
            assert "javascript:" not in response_data["response"]
    
    def test_rate_limiting_security(self, client):
        """Test de rate limiting como medida de seguridad"""
        # Crear usuario
        user_data = {
            "email": "rate@test.com",
            "name": "Rate Test User",
            "role": "Tester"
        }
        
        user_response = client.post("/v1/users", json=user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "rate_test_session"
        
        # Intentar flood de requests
        message_template = {
            "message": "Test message",
            "user_id": user_id,
            "session_id": session_id
        }
        
        # Enviar requests rápidamente
        responses = []
        for i in range(15):  # Más del límite de 10 por minuto
            response = client.post("/v1/chat", json=message_template)
            responses.append(response)
        
        # Los primeros 10 deben ser exitosos
        for i in range(10):
            assert responses[i].status_code == 200
        
        # Los siguientes deben ser rechazados
        for i in range(10, 15):
            assert responses[i].status_code == 429
    
    def test_authentication_required(self, client):
        """Test de que endpoints protegidos requieren autenticación"""
        # Endpoints que requieren autenticación
        protected_endpoints = [
            ("GET", "/v1/users"),
            ("GET", "/v1/conversations"),
            ("GET", "/v1/analytics"),
            ("POST", "/v1/chat")
        ]
        
        for method, endpoint in protected_endpoints:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint, json={})
            
            # Debe requerir autenticación
            assert response.status_code in [401, 403]
    
    def test_input_validation_security(self, client):
        """Test de validación de entrada como medida de seguridad"""
        # Crear usuario
        user_data = {
            "email": "validation@test.com",
            "name": "Validation Test User",
            "role": "Tester"
        }
        
        user_response = client.post("/v1/users", json=user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "validation_test_session"
        
        # Intentar inputs maliciosos
        malicious_inputs = [
            # Comandos del sistema
            "rm -rf /",
            "del /s /q C:\\",
            "format C:",
            # Path traversal
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\config\\sam",
            # Inyección de comandos
            "| cat /etc/passwd",
            "; ls -la",
            "&& whoami"
        ]
        
        for malicious_input in malicious_inputs:
            message_data = {
                "message": malicious_input,
                "user_id": user_id,
                "session_id": session_id
            }
            
            response = client.post("/v1/chat", json=message_data)
            
            # Debe validar y rechazar inputs maliciosos
            assert response.status_code in [400, 422]
```

#### **5. Testing de Usabilidad y Accesibilidad**

##### **Estrategia de Usability Testing**
```python
# tests/usability/test_usability.py
import pytest
from fastapi.testclient import TestClient
from main import app

class TestUsability:
    """Tests de usabilidad y accesibilidad de la API"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_response_format_consistency(self, client):
        """Test de consistencia en el formato de respuestas"""
        # Crear usuario
        user_data = {
            "email": "usability@test.com",
            "name": "Usability Test User",
            "role": "Tester"
        }
        
        user_response = client.post("/v1/users", json=user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "usability_test_session"
        
        # Verificar estructura de respuesta de usuario
        assert "success" in user_response.json()
        assert "data" in user_response.json()
        assert "meta" in user_response.json()
        
        # Verificar estructura de respuesta de chat
        message_data = {
            "message": "Test message",
            "user_id": user_id,
            "session_id": session_id
        }
        
        chat_response = client.post("/v1/chat", json=message_data)
        chat_data = chat_response.json()
        
        # Debe tener la misma estructura
        assert "success" in chat_data
        assert "data" in chat_data
        assert "meta" in chat_data
        
        # Verificar que los campos requeridos están presentes
        required_fields = ["message_id", "response", "conversation_id", "user_id", "session_id"]
        for field in required_fields:
            assert field in chat_data["data"]
    
    def test_error_message_clarity(self, client):
        """Test de claridad en mensajes de error"""
        # Intentar crear usuario con datos inválidos
        invalid_user_data = {
            "email": "invalid-email",
            "name": ""
        }
        
        response = client.post("/v1/users", json=invalid_user_data)
        error_data = response.json()
        
        # Verificar que el error es claro y útil
        assert "error" in error_data
        assert "message" in error_data["error"]
        assert "details" in error_data["error"]
        
        # Verificar que los detalles son específicos
        details = error_data["error"]["details"]
        assert len(details) > 0
        
        for detail in details:
            assert "field" in detail
            assert "message" in detail
            assert "value" in detail
    
    def test_response_time_consistency(self, client):
        """Test de consistencia en tiempos de respuesta"""
        # Crear usuario
        user_data = {
            "email": "consistency@test.com",
            "name": "Consistency Test User",
            "role": "Tester"
        }
        
        user_response = client.post("/v1/users", json=user_data)
        user_id = user_response.json()["data"]["user_id"]
        session_id = "consistency_test_session"
        
        # Enviar múltiples mensajes similares
        response_times = []
        message_template = {
            "message": "Test message",
            "user_id": user_id,
            "session_id": session_id
        }
        
        for i in range(5):
            import time
            start_time = time.time()
            response = client.post("/v1/chat", json=message_template)
            end_time = time.time()
            
            assert response.status_code == 200
            response_times.append((end_time - start_time) * 1000)
        
        # Verificar que los tiempos son consistentes (no hay outliers extremos)
        avg_time = sum(response_times) / len(response_times)
        for time in response_times:
            # Ningún tiempo debe ser más de 3x el promedio
            assert time < avg_time * 3
    
    def test_api_documentation_quality(self, client):
        """Test de calidad de la documentación de la API"""
        # Verificar que el endpoint de documentación está disponible
        docs_response = client.get("/docs")
        assert docs_response.status_code == 200
        
        # Verificar que OpenAPI está disponible
        openapi_response = client.get("/openapi.json")
        assert openapi_response.status_code == 200
        
        openapi_data = openapi_response.json()
        
        # Verificar que la documentación es completa
        assert "info" in openapi_data
        assert "paths" in openapi_data
        assert "components" in openapi_data
        
        # Verificar que todos los endpoints están documentados
        required_endpoints = [
            "/chat",
            "/conversations",
            "/users",
            "/analytics",
            "/health"
        ]
        
        for endpoint in required_endpoints:
            assert endpoint in openapi_data["paths"]
        
        # Verificar que los schemas están bien definidos
        assert "schemas" in openapi_data["components"]
        required_schemas = [
            "ChatMessageRequest",
            "ChatMessageResponse",
            "UserResponse",
            "ErrorResponse"
        ]
        
        for schema in required_schemas:
            assert schema in openapi_data["components"]["schemas"]
```

### **Plan de Ejecución de Tests de Integración**

#### **Cronograma de Testing**
```yaml
# testing-schedule.yml
integration_testing_plan:
  phase_1:
    name: "Testing de Integración Core"
    duration: "2 días"
    tests:
      - "Dialogflow + Vertex AI Integration"
      - "API Complete Scenarios"
      - "Basic Performance Testing"
    deliverables:
      - "Reporte de integración core"
      - "Métricas de performance base"
  
  phase_2:
    name: "Testing de Carga y Seguridad"
    duration: "3 días"
    tests:
      - "Load Testing"
      - "Security Testing"
      - "Error Handling"
    deliverables:
      - "Reporte de performance bajo carga"
      - "Auditoría de seguridad"
      - "Plan de mitigación de vulnerabilidades"
  
  phase_3:
    name: "Testing de Usabilidad y Accesibilidad"
    duration: "2 días"
    tests:
      - "API Usability Testing"
      - "Response Format Consistency"
      - "Documentation Quality"
    deliverables:
      - "Reporte de usabilidad"
      - "Mejoras de documentación"
      - "Recomendaciones de UX"

  phase_4:
    name: "Testing de Regresión y Validación"
    duration: "2 días"
    tests:
      - "Regression Testing"
      - "End-to-End Validation"
      - "Production Readiness"
    deliverables:
      - "Reporte final de testing"
      - "Certificación de producción"
      - "Plan de monitoreo continuo"
```

#### **Métricas de Éxito**
```python
# testing_metrics.py
class TestingMetrics:
    """Métricas para evaluar el éxito del testing de integración"""
    
    @staticmethod
    def calculate_test_coverage():
        """Calcular cobertura de testing"""
        return {
            "integration_coverage": "95%",
            "api_endpoint_coverage": "100%",
            "security_test_coverage": "90%",
            "performance_test_coverage": "85%"
        }
    
    @staticmethod
    def define_success_criteria():
        """Definir criterios de éxito"""
        return {
            "performance": {
                "avg_response_time": "< 2 segundos",
                "p95_response_time": "< 5 segundos",
                "max_response_time": "< 10 segundos",
                "concurrent_users": "> 100 usuarios"
            },
            "security": {
                "vulnerabilities_critical": "0",
                "vulnerabilities_high": "0",
                "vulnerabilities_medium": "< 3",
                "authentication_required": "100%"
            },
            "reliability": {
                "uptime": "> 99.9%",
                "error_rate": "< 1%",
                "successful_requests": "> 99%"
            },
            "usability": {
                "response_consistency": "100%",
                "error_message_clarity": "> 95%",
                "documentation_completeness": "100%"
            }
        }
```

Este plan de testing de integración proporciona una cobertura completa para asegurar que todos los componentes del sistema funcionen correctamente juntos, con énfasis en la integración Dialogflow + Vertex AI, testing de la API completa, performance, seguridad y usabilidad.
