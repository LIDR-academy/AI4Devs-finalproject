from django.contrib import admin
from .models import UserGameLibrary


@admin.register(UserGameLibrary)
class UserGameLibraryAdmin(admin.ModelAdmin):
	list_display = ('user', 'game', 'status', 'date_added')
	list_filter = ('status',)
	search_fields = ('user__username', 'game__name')
