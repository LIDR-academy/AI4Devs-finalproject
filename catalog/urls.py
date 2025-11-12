from django.urls import path
from . import views

app_name = 'catalog'

urlpatterns = [
    # Home
    path('', views.home, name='home'),
    
    # Categorías (CRUD - solo staff)
    path('categories/', views.category_list, name='category_list'),
    path('categories/create/', views.category_create, name='category_create'),
    path('categories/<slug:slug>/edit/', views.category_update, name='category_update'),
    path('categories/<slug:slug>/delete/', views.category_delete, name='category_delete'),
    
    # Juegos (CRUD)
    path('games/', views.game_list, name='game_list'),
    path('games/create/', views.game_create, name='game_create'),
    path('games/<slug:slug>/', views.game_detail, name='game_detail'),
    path('games/<slug:slug>/edit/', views.game_update, name='game_update'),
    path('games/<slug:slug>/delete/', views.game_delete, name='game_delete'),
]

