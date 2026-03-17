"""
Gamy Settings Module

Este módulo contiene las configuraciones del proyecto separadas por entorno:
- base.py: Configuraciones comunes a todos los entornos
- local.py: Configuraciones para desarrollo local
- production.py: Configuraciones para producción

Para usar un entorno específico, establecer la variable de entorno:
DJANGO_SETTINGS_MODULE=gamy.settings.local (desarrollo)
DJANGO_SETTINGS_MODULE=gamy.settings.production (producción)
"""

# Por defecto, Django cargará directamente local.py o production.py
# según lo especificado en DJANGO_SETTINGS_MODULE
# Este archivo __init__.py se usa principalmente para documentación
