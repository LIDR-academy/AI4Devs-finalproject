from django.db import models

# Create your models here.
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from catalog.models import Game


class UserGameLibrary(models.Model):
	class Status(models.TextChoices):
		OWNED = 'owned', _('Owned')
		WISHLIST = 'wishlist', _('Wishlist')

	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='library_items')
	game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='user_entries')
	date_added = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=16, choices=Status.choices, default=Status.OWNED)

	class Meta:
		unique_together = (('user', 'game'),)

	def __str__(self):
		return f"{self.user} - {self.game.name} ({self.status})"

