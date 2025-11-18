from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from .forms import CustomLoginForm, CustomRegistrationForm
from .models import Profile


def user_login(request):
    """
    Vista para el inicio de sesión de usuarios
    """
    if request.user.is_authenticated:
        return redirect('accounts:dashboard')
    
    if request.method == 'POST':
        form = CustomLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, _(f"Bienvenido de nuevo, {user.first_name or user.username}!"))
                
                # Redirigir al dashboard o a la página anterior
                next_url = request.GET.get('next', 'accounts:dashboard')
                return redirect(next_url)
            else:
                messages.error(request, _("Usuario o contraseña incorrectos."))
        else:
            messages.error(request, _("Por favor, corrige los errores en el formulario."))
    else:
        form = CustomLoginForm()
    
    return render(request, 'accounts/login.html', {'form': form})


def user_register(request):
    """
    Vista para el registro de nuevos usuarios
    """
    if request.user.is_authenticated:
        return redirect('accounts:dashboard')
    
    if request.method == 'POST':
        form = CustomRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Crear perfil automáticamente
            Profile.objects.get_or_create(user=user)
            
            # Autenticar y hacer login automático con backend explícito
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            messages.success(request, _(f"¡Bienvenido a Gamy, {user.first_name}! Tu cuenta ha sido creada exitosamente."))
            return redirect('accounts:dashboard')
        else:
            messages.error(request, _("Por favor, corrige los errores en el formulario."))
    else:
        form = CustomRegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})


@login_required
def user_logout(request):
    """
    Vista para cerrar sesión
    """
    if request.method == 'POST':
        logout(request)
        messages.success(request, _("Has cerrado sesión exitosamente."))
        return redirect('catalog:home')
    
    # Si es GET, redirigir al home
    return redirect('catalog:home')


@login_required
def user_dashboard(request):
    """
    Dashboard del usuario - página principal después del login
    """
    user = request.user
    
    # Obtener o crear el perfil
    profile, created = Profile.objects.get_or_create(user=user)
    
    context = {
        'user': user,
        'profile': profile,
    }
    
    return render(request, 'accounts/dashboard.html', context)
