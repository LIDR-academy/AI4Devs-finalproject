from django import forms
from django.utils.translation import gettext_lazy as _
from .models import Category, Game


class CategoryForm(forms.ModelForm):
    """
    Formulario para crear/editar categorías con soporte multiidioma
    """
    class Meta:
        model = Category
        fields = ['slug', 'name_es', 'name_en', 'name_fr', 'description_es', 'description_en', 'description_fr', 'icon']
        widgets = {
            'slug': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'strategy, family, party...'
            }),
            'name_es': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'Estrategia'
            }),
            'name_en': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'Strategy'
            }),
            'name_fr': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'Stratégie'
            }),
            'description_es': forms.Textarea(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'rows': 3,
                'placeholder': 'Descripción en español'
            }),
            'description_en': forms.Textarea(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'rows': 3,
                'placeholder': 'Description in English'
            }),
            'description_fr': forms.Textarea(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'rows': 3,
                'placeholder': 'Description en Français'
            }),
            'icon': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': '🎯 (emoji o código de icono)',
                'maxlength': '50'
            }),
        }


class GameForm(forms.ModelForm):
    """
    Formulario para crear/editar juegos con selección múltiple de categorías y soporte multiidioma
    """
    class Meta:
        model = Game
        fields = [
            'name_es', 'name_en', 'name_fr',
            'slug',
            'description_es', 'description_en', 'description_fr',
            'categories',
            'min_players', 'max_players',
            'min_playtime', 'max_playtime',
            'min_age',
            'difficulty',
            'publisher', 'year_published',
            'rules_url',
            'image'
        ]
        widgets = {
            'name_es': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'Nombre del juego en español'
            }),
            'name_en': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'Game name in English'
            }),
            'name_fr': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'Nom du jeu en français'
            }),
            'slug': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'catan, ticket-to-ride...'
            }),
            'description_es': forms.Textarea(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'rows': 4,
                'placeholder': 'Descripción del juego en español'
            }),
            'description_en': forms.Textarea(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'rows': 4,
                'placeholder': 'Game description in English'
            }),
            'description_fr': forms.Textarea(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'rows': 4,
                'placeholder': 'Description du jeu en français'
            }),
            'categories': forms.CheckboxSelectMultiple(attrs={
                'class': 'grid grid-cols-2 md:grid-cols-3 gap-2'
            }),
            'min_players': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'min': '1',
                'placeholder': '1'
            }),
            'max_players': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'min': '1',
                'placeholder': '4'
            }),
            'min_playtime': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'min': '1',
                'placeholder': _('Minutos')
            }),
            'max_playtime': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'min': '1',
                'placeholder': _('Minutos')
            }),
            'min_age': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'min': '1',
                'placeholder': '8'
            }),
            'difficulty': forms.Select(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent'
            }),
            'publisher': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': _('Editorial')
            }),
            'year_published': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'min': '1900',
                'max': '2100',
                'placeholder': '2023'
            }),
            'rules_url': forms.URLInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': 'https://ejemplo.com/reglas.pdf'
            }),
            'image': forms.FileInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'accept': 'image/*'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Personalizar la presentación de categorías en el checkbox
        self.fields['categories'].label_from_instance = lambda obj: f"{obj.icon} {obj.name_es}"
