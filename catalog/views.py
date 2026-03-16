from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.core.paginator import Paginator
from .models import Category, Game
from .forms import CategoryForm, GameForm


def home(request):
	"""
	Renderiza la plantilla de la página principal con datos dinámicos.
	"""
	from django.utils.translation import get_language
	
	# Obtener categorías y juegos destacados
	categories = Category.objects.all()[:6]  # Primeras 6 categorías
	featured_games = Game.objects.filter(is_active=True).prefetch_related('categories')[:3]  # 3 juegos destacados
	
	context = {
		'categories': categories,
		'featured_games': featured_games,
		'current_language': get_language(),
	}
	
	return render(request, 'home.html', context)


# ============================================
# Helper function para verificar si es staff
# ============================================
def is_staff_user(user):
	return user.is_staff


# ============================================
# CRUD de Categorías
# ============================================

@login_required
@user_passes_test(is_staff_user)
def category_list(request):
	"""
	Lista todas las categorías (solo para staff)
	"""
	categories = Category.objects.all().order_by('name_es')
	
	context = {
		'categories': categories,
		'total_categories': categories.count(),
	}
	return render(request, 'catalog/category_list.html', context)


@login_required
@user_passes_test(is_staff_user)
def category_create(request):
	"""
	Crear nueva categoría (solo para staff)
	"""
	if request.method == 'POST':
		form = CategoryForm(request.POST)
		if form.is_valid():
			category = form.save()
			messages.success(request, _(f'Categoría "{category.name_es}" creada exitosamente.'))
			return redirect('catalog:category_list')
		else:
			messages.error(request, _('Por favor, corrige los errores en el formulario.'))
	else:
		form = CategoryForm()
	
	return render(request, 'catalog/category_form.html', {'form': form, 'action': 'create'})


@login_required
@user_passes_test(is_staff_user)
def category_update(request, slug):
	"""
	Actualizar categoría existente (solo para staff)
	"""
	category = get_object_or_404(Category, slug=slug)
	
	if request.method == 'POST':
		form = CategoryForm(request.POST, instance=category)
		if form.is_valid():
			category = form.save()
			messages.success(request, _(f'Categoría "{category.name_es}" actualizada exitosamente.'))
			return redirect('catalog:category_list')
		else:
			messages.error(request, _('Por favor, corrige los errores en el formulario.'))
	else:
		form = CategoryForm(instance=category)
	
	return render(request, 'catalog/category_form.html', {'form': form, 'action': 'update', 'category': category})


@login_required
@user_passes_test(is_staff_user)
def category_delete(request, slug):
	"""
	Eliminar categoría (solo para staff)
	"""
	category = get_object_or_404(Category, slug=slug)
	
	if request.method == 'POST':
		category_name = category.name_es
		category.delete()
		messages.success(request, _(f'Categoría "{category_name}" eliminada exitosamente.'))
		return redirect('catalog:category_list')
	
	return render(request, 'catalog/category_confirm_delete.html', {'category': category})


# ============================================
# CRUD de Juegos
# ============================================

def game_list(request):
	"""
	Lista todos los juegos (pública con paginación)
	"""
	games = Game.objects.filter(is_active=True).prefetch_related('categories').order_by('name_es')
	
	# Filtrado por categoría
	category_slug = request.GET.get('category')
	if category_slug:
		games = games.filter(categories__slug=category_slug)
	
	# Búsqueda por nombre (busca en los 3 idiomas)
	search_query = request.GET.get('search')
	if search_query:
		from django.db.models import Q
		games = games.filter(
			Q(name_es__icontains=search_query) |
			Q(name_en__icontains=search_query) |
			Q(name_fr__icontains=search_query)
		)
	
	# Paginación
	paginator = Paginator(games, 12)  # 12 juegos por página
	page_number = request.GET.get('page')
	page_obj = paginator.get_page(page_number)
	
	# Obtener todas las categorías para el filtro
	categories = Category.objects.all().order_by('name_es')
	
	context = {
		'games': page_obj,  # Lista de juegos para mostrar
		'page_obj': page_obj,  # Para la paginación
		'is_paginated': page_obj.has_other_pages(),
		'categories': categories,
		'selected_category': category_slug,
		'search_query': search_query,
		'total_games': games.count(),
	}
	return render(request, 'catalog/game_list.html', context)


def game_detail(request, slug):
	"""
	Detalle de un juego (reglas básicas públicas, detalladas solo para registrados)
	"""
	game = get_object_or_404(Game, slug=slug, is_active=True)
	
	context = {
		'game': game,
		'is_authenticated': request.user.is_authenticated,
	}
	return render(request, 'catalog/game_detail.html', context)


@login_required
@user_passes_test(is_staff_user)
def game_create(request):
	"""
	Crear nuevo juego (solo para staff)
	"""
	if request.method == 'POST':
		form = GameForm(request.POST, request.FILES)
		if form.is_valid():
			game = form.save()
			messages.success(request, _(f'Juego "{game.name_es}" creado exitosamente.'))
			return redirect('catalog:game_detail', slug=game.slug)
		else:
			messages.error(request, _('Por favor, corrige los errores en el formulario.'))
	else:
		form = GameForm()
	
	return render(request, 'catalog/game_form.html', {'form': form, 'action': 'create'})


@login_required
@user_passes_test(is_staff_user)
def game_update(request, slug):
	"""
	Actualizar juego existente (solo para staff)
	"""
	game = get_object_or_404(Game, slug=slug)
	
	if request.method == 'POST':
		form = GameForm(request.POST, request.FILES, instance=game)
		if form.is_valid():
			game = form.save()
			messages.success(request, _(f'Juego "{game.name_es}" actualizado exitosamente.'))
			return redirect('catalog:game_detail', slug=game.slug)
		else:
			messages.error(request, _('Por favor, corrige los errores en el formulario.'))
	else:
		form = GameForm(instance=game)
	
	return render(request, 'catalog/game_form.html', {'form': form, 'action': 'update', 'game': game})


@login_required
@user_passes_test(is_staff_user)
def game_delete(request, slug):
	"""
	Eliminar juego (solo para staff - soft delete)
	"""
	game = get_object_or_404(Game, slug=slug)
	
	if request.method == 'POST':
		game_name = game.name
		game.is_active = False  # Soft delete
		game.save()
		messages.success(request, _(f'Juego "{game_name}" desactivado exitosamente.'))
		return redirect('catalog:game_list')
	
	return render(request, 'catalog/game_confirm_delete.html', {'game': game})
