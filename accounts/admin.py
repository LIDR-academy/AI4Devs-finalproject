from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'location', 'date_of_birth')
	search_fields = ('user__username', 'user__email')
