from rest_framework import generics, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.audit import emit_audit_event
from apps.accounts.models import Permission, Role, User
from apps.accounts.permissions import RequiresPermission
from apps.accounts.serializers import (
    EyeMasterTokenObtainPairSerializer,
    MeSerializer,
    PermissionSerializer,
    RoleSerializer,
    UserSerializer,
)


class LoginView(TokenObtainPairView):
   permission_classes = [AllowAny]
   serializer_class = EyeMasterTokenObtainPairSerializer

   def post(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      emit_audit_event(serializer.user, "login")
      return Response(serializer.validated_data)


class RefreshView(TokenRefreshView):
   permission_classes = [AllowAny]


class MeView(APIView):
   permission_classes = [IsAuthenticated]

   def get(self, request):
      return Response(MeSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
   queryset = User.objects.select_related("rol").all()
   serializer_class = UserSerializer

   def get_permissions(self):
      if self.action == "create":
         return [RequiresPermission("usuario.crear")()]
      return [RequiresPermission("usuario.editar")()]

   def perform_create(self, serializer):
      user = serializer.save()
      emit_audit_event(self.request.user, "usuario.crear", target_email=user.email)

   def perform_destroy(self, instance):
      self._guard_last_administrator(instance, deactivating=False)
      instance.delete()
      emit_audit_event(self.request.user, "usuario.eliminar", target_email=instance.email)

   def perform_update(self, serializer):
      deactivating = serializer.validated_data.get("activo") is False
      if deactivating:
         self._guard_last_administrator(serializer.instance, deactivating=True)
      user = serializer.save()
      emit_audit_event(self.request.user, "usuario.editar", target_email=user.email)

   @staticmethod
   def _guard_last_administrator(instance: User, *, deactivating: bool):
      if instance.rol is None or instance.rol.nombre != "administrador":
         return
      other_active_admins = (
         User.objects.filter(rol__nombre="administrador", activo=True)
         .exclude(pk=instance.pk)
         .exists()
      )
      if not other_active_admins:
         action = "deactivate" if deactivating else "delete"
         raise ValidationError(
            f"Cannot {action} the last active administrator."
         )


class PermissionListView(generics.ListAPIView):
   """Read-only catalog of every permission code, so the role-management
   screen can render a checkbox per permission (RoleViewSet only exposes
   the codes already attached to a role, not the full catalog)."""

   queryset = Permission.objects.all()
   serializer_class = PermissionSerializer
   permission_classes = [RequiresPermission("rol.editar")]


class RoleViewSet(viewsets.ModelViewSet):
   queryset = Role.objects.prefetch_related("permissions").all()
   serializer_class = RoleSerializer
   permission_classes = [RequiresPermission("rol.editar")]

   def perform_update(self, serializer):
      role = serializer.save()
      emit_audit_event(self.request.user, "rol.editar", role=role.nombre)

   def perform_create(self, serializer):
      role = serializer.save()
      emit_audit_event(self.request.user, "rol.crear", role=role.nombre)
