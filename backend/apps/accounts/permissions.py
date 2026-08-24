from rest_framework.permissions import BasePermission


def RequiresPermission(codigo: str):
   """Factory for a DRF permission class enforcing a single permission code
   against the authenticated user's role (see apps.accounts.models.User).
   """

   class _RequiresPermission(BasePermission):
      message = f"Missing permission: {codigo}"

      def has_permission(self, request, view):
         user = request.user
         return bool(user and user.is_authenticated and user.has_permission(codigo))

   _RequiresPermission.__name__ = f"RequiresPermission[{codigo}]"
   return _RequiresPermission
