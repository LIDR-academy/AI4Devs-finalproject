from django.contrib import admin
from .models import GameRequest


@admin.register(GameRequest)
class GameRequestAdmin(admin.ModelAdmin):
	list_display = ('game_name', 'user', 'status', 'created_at')
	list_filter = ('status', 'created_at')
	search_fields = ('game_name', 'user__username')
