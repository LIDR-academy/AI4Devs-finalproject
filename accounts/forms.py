from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class CustomLoginForm(AuthenticationForm):
    """
    Formulario personalizado de login con estilos y validaciones
    """
    username = forms.CharField(
        label=_("Correo electrónico o nombre de usuario"),
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
            'placeholder': _('correo@ejemplo.com'),
            'autocomplete': 'username',
        })
    )
    password = forms.CharField(
        label=_("Contraseña"),
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
            'placeholder': _('Tu contraseña'),
            'autocomplete': 'current-password',
        })
    )


class CustomRegistrationForm(UserCreationForm):
    """
    Formulario personalizado de registro con campos adicionales
    """
    email = forms.EmailField(
        label=_("Correo electrónico"),
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
            'placeholder': _('correo@ejemplo.com'),
            'autocomplete': 'email',
        })
    )
    first_name = forms.CharField(
        label=_("Nombre"),
        max_length=150,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
            'placeholder': _('Tu nombre'),
            'autocomplete': 'given-name',
        })
    )
    last_name = forms.CharField(
        label=_("Apellido"),
        max_length=150,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
            'placeholder': _('Tu apellido'),
            'autocomplete': 'family-name',
        })
    )
    password1 = forms.CharField(
        label=_("Contraseña"),
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
            'placeholder': _('Mínimo 8 caracteres'),
            'autocomplete': 'new-password',
        }),
        help_text=_("Tu contraseña debe tener al menos 8 caracteres y no puede ser completamente numérica.")
    )
    password2 = forms.CharField(
        label=_("Confirmar contraseña"),
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
            'placeholder': _('Repite tu contraseña'),
            'autocomplete': 'new-password',
        })
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-game-salmon focus:border-transparent',
                'placeholder': _('Nombre de usuario'),
                'autocomplete': 'username',
            })
        }

    def clean_email(self):
        """
        Validar que el email no esté ya registrado
        """
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(_("Este correo electrónico ya está registrado."))
        return email

    def save(self, commit=True):
        """
        Guardar el usuario con el email
        """
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        if commit:
            user.save()
        return user
