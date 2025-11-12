from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils.text import slugify


class Category(models.Model):
	"""
	Categorías de juegos de mesa (ej: Estrategia, Familiar, Party, etc.)
	Un juego puede pertenecer a múltiples categorías
	Soporta múltiples idiomas: ES, EN, FR
	"""
	# Identificador único (en inglés por convención)
	slug = models.SlugField(max_length=100, unique=True, primary_key=True, verbose_name=_('Slug'))
	
	# Nombres en diferentes idiomas
	name_es = models.CharField(max_length=100, verbose_name=_('Nombre (Español)'))
	name_en = models.CharField(max_length=100, verbose_name=_('Nombre (English)'))
	name_fr = models.CharField(max_length=100, verbose_name=_('Nombre (Français)'))
	
	# Descripciones en diferentes idiomas
	description_es = models.TextField(blank=True, verbose_name=_('Descripción (Español)'))
	description_en = models.TextField(blank=True, verbose_name=_('Descripción (English)'))
	description_fr = models.TextField(blank=True, verbose_name=_('Descripción (Français)'))
	
	# Icono (universal, no necesita traducción)
	icon = models.CharField(max_length=50, blank=True, help_text=_('Emoji o código de icono'))
	
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = _('Categoría')
		verbose_name_plural = _('Categorías')
		ordering = ['name_es']

	def __str__(self):
		return self.name_es

	def get_name(self, language_code=None):
		"""
		Retorna el nombre en el idioma especificado o el idioma actual
		"""
		if language_code is None:
			from django.utils.translation import get_language
			language_code = get_language()
		
		names = {
			'es': self.name_es,
			'en': self.name_en,
			'fr': self.name_fr,
		}
		return names.get(language_code, self.name_es)

	def get_description(self, language_code=None):
		"""
		Retorna la descripción en el idioma especificado o el idioma actual
		"""
		if language_code is None:
			from django.utils.translation import get_language
			language_code = get_language()
		
		descriptions = {
			'es': self.description_es,
			'en': self.description_en,
			'fr': self.description_fr,
		}
		return descriptions.get(language_code, self.description_es)


class Game(models.Model):
	# Nombres en diferentes idiomas
	name_es = models.CharField(max_length=255, verbose_name=_('Nombre (Español)'))
	name_en = models.CharField(max_length=255, verbose_name=_('Nombre (English)'))
	name_fr = models.CharField(max_length=255, verbose_name=_('Nombre (Français)'))
	
	slug = models.SlugField(max_length=255, unique=True, blank=True)
	
	# Descripciones en diferentes idiomas
	description_es = models.TextField(blank=True, verbose_name=_('Descripción (Español)'))
	description_en = models.TextField(blank=True, verbose_name=_('Descripción (English)'))
	description_fr = models.TextField(blank=True, verbose_name=_('Descripción (Français)'))
	
	min_players = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name=_('Jugadores mínimos'))
	max_players = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name=_('Jugadores máximos'))
	min_playtime = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Tiempo mínimo (minutos)'))
	max_playtime = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Tiempo máximo (minutos)'))
	min_age = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name=_('Edad mínima'))
	
	# Relación ManyToMany con categorías
	categories = models.ManyToManyField(Category, related_name='games', blank=True, verbose_name=_('Categorías'))
	
	# Campo antiguo mantenido temporalmente para migración
	category = models.CharField(max_length=120, blank=True, help_text=_('Deprecated: Use categories field'))
	
	# Reglas y recursos
	rules_url = models.URLField(blank=True, verbose_name=_('URL de reglas (PDF)'))
	
	# Dificultad
	DIFFICULTY_CHOICES = [
		('easy', _('Fácil')),
		('medium', _('Media')),
		('hard', _('Difícil')),
		('expert', _('Experto')),
	]
	difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, blank=True, verbose_name=_('Dificultad'))
	
	image = models.ImageField(upload_to='games/', null=True, blank=True, verbose_name=_('Imagen'))
	publisher = models.CharField(max_length=200, blank=True, verbose_name=_('Editorial'))
	year_published = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name=_('Año de publicación'))
	is_active = models.BooleanField(default=True, verbose_name=_('Activo'))
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['name_es']
		verbose_name = _('Juego')
		verbose_name_plural = _('Juegos')

	def save(self, *args, **kwargs):
		if not self.slug and self.name_es:
			self.slug = slugify(self.name_es)
		super().save(*args, **kwargs)

	def __str__(self):
		return self.name_es or f"Game {self.pk}"

	def get_name(self, language_code=None):
		"""
		Retorna el nombre en el idioma especificado o el idioma actual
		"""
		if language_code is None:
			from django.utils.translation import get_language
			language_code = get_language()
		
		names = {
			'es': self.name_es,
			'en': self.name_en,
			'fr': self.name_fr,
		}
		return names.get(language_code, self.name_es)

	def get_description(self, language_code=None):
		"""
		Retorna la descripción en el idioma especificado o el idioma actual
		"""
		if language_code is None:
			from django.utils.translation import get_language
			language_code = get_language()
		
		descriptions = {
			'es': self.description_es,
			'en': self.description_en,
			'fr': self.description_fr,
		}
		return descriptions.get(language_code, self.description_es)

	def get_categories_display(self, language_code=None):
		"""Retorna las categorías como string separado por comas en el idioma especificado o el idioma actual"""
		if language_code is None:
			from django.utils.translation import get_language
			language_code = get_language()
		
		return ", ".join([cat.get_name(language_code) for cat in self.categories.all()])


class RuleSet(models.Model):
	class RuleLevel(models.TextChoices):
		BASIC = 'basic', _('basic')
		DETAILED = 'detailed', _('detailed')
		QUICKSTART = 'quickstart', _('quickstart')
		ADVANCED = 'advanced', _('advanced')

	game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='rulesets')
	level = models.CharField(max_length=20, choices=RuleLevel.choices, default=RuleLevel.BASIC)
	language = models.CharField(max_length=2, default='es')
	version = models.CharField(max_length=32, blank=True)
	source = models.CharField(max_length=120, blank=True)
	content_markdown = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.game.name_es} - {self.get_level_display()} ({self.language})"


class RuleVariant(models.Model):
	ruleset = models.ForeignKey(RuleSet, on_delete=models.CASCADE, related_name='variants')
	name = models.CharField(max_length=150)
	description_markdown = models.TextField(blank=True)
	is_official = models.BooleanField(default=False)
	tags = models.CharField(max_length=255, blank=True, help_text=_('Comma separated tags'))
	min_players_delta = models.IntegerField(null=True, blank=True)
	max_players_delta = models.IntegerField(null=True, blank=True)
	play_time_delta = models.IntegerField(null=True, blank=True)
	min_age_delta = models.IntegerField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.ruleset.game.name_es} - {self.name}"


class TrainingVideo(models.Model):
	class VideoPlatform(models.TextChoices):
		YOUTUBE = 'youtube', 'YouTube'
		VIMEO = 'vimeo', 'Vimeo'
		OTHER = 'other', 'Other'

	game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='videos')
	ruleset = models.ForeignKey(RuleSet, on_delete=models.SET_NULL, null=True, blank=True, related_name='videos')
	title = models.CharField(max_length=255)
	url = models.URLField()
	platform = models.CharField(max_length=20, choices=VideoPlatform.choices, default=VideoPlatform.YOUTUBE)
	language = models.CharField(max_length=2, default='es')
	duration_seconds = models.PositiveIntegerField(null=True, blank=True)
	is_official = models.BooleanField(default=False)
	quality_rating = models.PositiveSmallIntegerField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.title} ({self.game.name_es})"
