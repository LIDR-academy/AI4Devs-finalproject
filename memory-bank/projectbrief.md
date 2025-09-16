# Project Brief: Nura

## Executive Summary

**Nura** es un sistema multi-agente de inteligencia empresarial AI-first que revoluciona el onboarding de desarrolladores mediante eliminación de barreras psicológicas. Combina la filosofía "Vibe CEO'ing" (usuario dirige, AI ejecuta) con un contexto sin juicio que permite aprendizaje privado sin exposición social.

## Core Problem

Los desarrolladores nuevos requieren **2+ semanas para ser productivos**, no por documentación deficiente, sino por **"amplificación del síndrome del impostor"** en la cultura meritocrática tech donde "no se permite fallar". Esto crea:

- Miedo a hacer preguntas (demostrar incompetencia)
- Onboarding fragmentado y knowledge silos
- Implementaciones frágiles por desconocimiento de reglas de negocio
- Duplicación arquitectónica por ignorancia

## Proposed Solution

**Sistema multi-agente orquestado** que proporciona:

### 🎯 Contexto Sin Juicio
- Máximo 3 opciones por consulta (evita parálisis)
- Formato "Te recuerdo que..." (enseñanza sin condescendencia)
- Aprendizaje privado sin exposición social

### 🤖 Arquitectura Multi-Agente
- **Nura Core**: Orchestrador inteligente
- **Dev Agent**: Análisis de código + context empresarial
- **PM Agent**: Contexto de negocio + reglas empresariales
- **Architect Agent**: Vistas estructurales + dependencias

### 🔍 Knowledge Base Unificado
- Código (Bitbucket) + Documentación (Confluence)
- Vector search con BGE-M3 (consistencia 100%)
- Business context integration automático

## Target Market

**Primary**: Área de Ingeniería (desarrolladores, POs, QA, DevOps)
**Secondary**: C-Level para business intelligence

## Technology Stack

**MVP Stack (Months 1-3)**:
- **Frontend**: Streamlit (Python native, desarrollo 10x más rápido)
- **Backend**: FastAPI + PostgreSQL + pgvector
- **AI**: DSPy + LangGraph + BGE-M3 embeddings
- **LLM**: AWS Bedrock (CodeLlama-70B, Llama-3.1-70B) + commercial fallback
- **Infrastructure**: AWS EKS + managed services

**Evolution Path**:
- **Months 4-5**: Streamlit → React + shadcn + AI SDK
- **Months 6-8**: Multi-tenancy + advanced agents
- **Months 9-12**: Enterprise platform + business intelligence

## Success Metrics

**MVP Validation (3 months)**:
- 5 developers daily usage por 4 semanas consecutivas
- >90% satisfaction "cómodo preguntando vs colegas"
- Zero crisis de confianza (respuestas incorrectas)
- 50% reducción preguntas a seniors
- 1 semana productividad efectiva vs 2 semanas actuales

**Business Goals**:
- Reducir ramp-up time 50% (2→1 semanas)
- Incrementar velocity 35%
- ROI 385% primer año
- Adopción orgánica >80%

## Investment & ROI

**Investment**: $260K desarrollo + $6K operacional año 1
**Savings**: $450K+ anuales vs soluciones comerciales
**Break-even**: Mes 7
**Cost Target**: <$670/mes AWS operational

## Unique Value Proposition

1. **Psychological Safety**: Elimina miedo al fracaso mediante AI mentorship
2. **Business Context Integration**: Une código con contexto empresarial
3. **Consistency Guaranteed**: BGE-M3 unified embeddings
4. **Cost Optimized**: Stack opensource vs $450K+ comercial
5. **Flexible Architecture**: Local models + commercial fallback

## Risk Mitigation

**Technical**: Multi-fallback en todos componentes críticos
**Business**: MVP validation con 5 developers reales
**Operational**: Managed services AWS + stack Python unificado

Esta estrategia posiciona a Nura como la solución definitiva para onboarding técnico, transformando un pain point universal en ventaja competitiva empresarial.
