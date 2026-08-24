from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    LoginView,
    MeView,
    PermissionListView,
    RefreshView,
    RoleViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("roles", RoleViewSet, basename="role")

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/refresh", RefreshView.as_view(), name="auth-refresh"),
    path("auth/me", MeView.as_view(), name="auth-me"),
    path("permisos", PermissionListView.as_view(), name="permiso-list"),
] + router.urls
