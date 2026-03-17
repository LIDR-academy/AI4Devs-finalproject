from django.db import models

# Create your models here.
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class GameRequest(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
	game_name = models.CharField(max_length=255)
	publisher = models.CharField(max_length=255, blank=True)
	category = models.CharField(max_length=120, blank=True)
	description = models.TextField(blank=True)
	status = models.CharField(max_length=32, default='pending')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.game_name} ({self.status})"

