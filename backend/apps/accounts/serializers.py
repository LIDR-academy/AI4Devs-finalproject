from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.models import Permission, Role, User


class EyeMasterTokenObtainPairSerializer(TokenObtainPairSerializer):
   """Issues tokens by email/password without delegating to Django's
   authenticate() backend, so an inactive account can be told apart from a
   plain wrong-credentials error (documentacion-funcional.md §6.1 error
   scenarios), while wrong-email and wrong-password stay indistinguishable
   from each other."""

   username_field = User.USERNAME_FIELD

   def validate(self, attrs):
      email = attrs.get(self.username_field)
      password = attrs.get("password")

      try:
         user = User.objects.get(email=email)
      except User.DoesNotExist:
         raise AuthenticationFailed("Credenciales invalidas.", code="invalid_credentials")

      if not user.check_password(password):
         raise AuthenticationFailed("Credenciales invalidas.", code="invalid_credentials")

      if not user.activo:
         raise AuthenticationFailed("Usuario desactivado.", code="inactive_account")

      self.user = user
      refresh = self.get_token(self.user)
      return {"refresh": str(refresh), "access": str(refresh.access_token)}


class PermissionSerializer(serializers.ModelSerializer):
   class Meta:
      model = Permission
      fields = ["codigo", "descripcion"]


class RoleSerializer(serializers.ModelSerializer):
   permissions = serializers.SlugRelatedField(
      slug_field="codigo", queryset=Permission.objects.all(), many=True, required=False
   )

   class Meta:
      model = Role
      fields = ["id", "nombre", "descripcion", "permissions"]


class MeSerializer(serializers.ModelSerializer):
   rol = serializers.CharField(source="rol.nombre", allow_null=True)
   permissions = serializers.SerializerMethodField()

   class Meta:
      model = User
      fields = ["id", "email", "nombre", "rol", "permissions"]

   def get_permissions(self, obj: User) -> list[str]:
      return obj.permission_codes()


class UserSerializer(serializers.ModelSerializer):
   password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
   rol = serializers.SlugRelatedField(slug_field="nombre", queryset=Role.objects.all())

   class Meta:
      model = User
      fields = ["id", "email", "nombre", "rol", "activo", "password"]

   def create(self, validated_data):
      password = validated_data.pop("password", None)
      if not password:
         raise serializers.ValidationError({"password": "Este campo es obligatorio."})
      user = User(**validated_data)
      user.set_password(password)
      user.save()
      return user

   def update(self, instance, validated_data):
      password = validated_data.pop("password", None)
      for attr, value in validated_data.items():
         setattr(instance, attr, value)
      if password:
         instance.set_password(password)
      instance.save()
      return instance
