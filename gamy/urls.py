"""
URL configuration for gamy project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URLs de las aplicaciones
    path('', include('catalog.urls')),
    path('accounts/', include('accounts.urls')),
    path('accounts/', include('allauth.urls')),  # django-allauth URLs (social auth)
    path('library/', include('library.urls')),
    path('requests/', include('game_requests.urls')),
    # URL para cambiar el idioma a través de Django
    path('i18n/', include('django.conf.urls.i18n')),
    # Rosetta UI for editing translations (accessible if `django-rosetta` is installed)
    path('rosetta/', include('rosetta.urls')),
]

# Servir archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
