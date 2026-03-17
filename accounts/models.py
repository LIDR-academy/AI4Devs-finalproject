from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


# Profile model to store additional user information (keeps default User model)
class Profile(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
	bio = models.TextField(blank=True)
	location = models.CharField(max_length=120, blank=True)
	date_of_birth = models.DateField(null=True, blank=True)

	def __str__(self):
		return f"Profile: {self.user.username}"
