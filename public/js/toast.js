/**
 * Sistema de notificaciones Toast
 * Componente reutilizable para mostrar mensajes al usuario
 */
class Toast {
    constructor(containerId = 'toastContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Toast container not found:', containerId);
            return;
        }
    }

    show(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-blue-600',
            warning: 'bg-yellow-600'
        };

        toast.className = `px-6 py-3 mb-2 rounded-md text-white transform transition-transform duration-300 ${colors[type] || colors.info}`;
        toast.textContent = message;
        this.container.appendChild(toast);

        // Entrada con animación
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
        });

        // Eliminación automática
        setTimeout(() => {
            toast.style.transform = 'translateY(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Crear instancia global
window.toast = new Toast();
window.showToast = (message, type = 'info') => window.toast.show(message, type);
