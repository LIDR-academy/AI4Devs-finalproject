from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Category, Game, RuleSet, RuleVariant, TrainingVideo


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ('slug', 'name_es', 'name_en', 'name_fr', 'icon', 'created_at')
	search_fields = ('slug', 'name_es', 'name_en', 'name_fr')
	ordering = ('name_es',)
	fieldsets = (
		(_('Identificador'), {
			'fields': ('slug', 'icon')
		}),
		(_('Nombres (Traducciones)'), {
			'fields': ('name_es', 'name_en', 'name_fr')
		}),
		(_('Descripciones (Traducciones)'), {
			'fields': ('description_es', 'description_en', 'description_fr'),
			'classes': ('collapse',)
		}),
	)


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
	list_display = ('name_es', 'get_categories_display', 'min_players', 'max_players', 'get_playtime_display', 'year_published', 'is_active')
	list_filter = ('categories', 'is_active', 'year_published', 'difficulty')
	search_fields = ('name_es', 'name_en', 'name_fr', 'publisher', 'description_es', 'description_en', 'description_fr')
	filter_horizontal = ('categories',)  # Para selección múltiple de categorías
	prepopulated_fields = {'slug': ('name_es',)}
	fieldsets = (
		(_('Información Básica'), {
			'fields': ('name_es', 'name_en', 'name_fr', 'slug', 'publisher', 'year_published', 'image', 'is_active')
		}),
		(_('Descripciones'), {
			'fields': ('description_es', 'description_en', 'description_fr')
		}),
		(_('Características de Juego'), {
			'fields': ('min_players', 'max_players', 'min_playtime', 'max_playtime', 'min_age', 'difficulty', 'categories')
		}),
		(_('Recursos'), {
			'fields': ('rules_url',),
			'classes': ('collapse',)
		}),
	)
	
	def get_categories_display(self, obj):
		return obj.get_categories_display()
	get_categories_display.short_description = _('Categorías')
	
	def get_playtime_display(self, obj):
		if obj.min_playtime and obj.max_playtime:
			return f"{obj.min_playtime}-{obj.max_playtime} min"
		elif obj.min_playtime:
			return f"{obj.min_playtime}+ min"
		return "-"
	get_playtime_display.short_description = _('Tiempo de juego')


@admin.register(RuleSet)
class RuleSetAdmin(admin.ModelAdmin):
	list_display = ('game', 'level', 'language', 'version')


@admin.register(RuleVariant)
class RuleVariantAdmin(admin.ModelAdmin):
	list_display = ('name', 'ruleset', 'is_official')


@admin.register(TrainingVideo)
class TrainingVideoAdmin(admin.ModelAdmin):
	list_display = ('title', 'game', 'platform', 'language')
