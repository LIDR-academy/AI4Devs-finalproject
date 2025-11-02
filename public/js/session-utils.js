/**
 * Utilidades para gestión de sesiones
 * Reemplaza el uso obsoleto de localStorage por verificación en servidor
 */

/**
 * Verifica si hay sesión activa en el servidor
 * @returns {Promise<boolean>} true si hay sesión activa
 */
async function checkServerSession() {
    try {
        const response = await api.checkSession();
        return response.success && response.data && response.data.active;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        return false;
    }
}

/**
 * Verifica sesión y redirige al login si no está activa
 * Usar en ventanas emergentes que requieren autenticación
 * @param {string} redirectUrl - URL a la que redirigir si no hay sesión (default: index.html)
 */
async function checkSessionOrRedirect(redirectUrl = 'index.html') {
    const hasSession = await checkServerSession();
    
    if (!hasSession) {
        if (typeof showToast !== 'undefined') {
            showToast('No hay sesión activa o ha expirado', 'error');
        }
        
        setTimeout(() => {
            window.close();
            // Si no se puede cerrar (ventana principal), redirigir
            if (!window.closed) {
                window.location.href = redirectUrl;
            }
        }, 2000);
        
        return false;
    }
    
    return true;
}

/**
 * Obtiene información de la sesión actual del servidor
 * @returns {Promise<object|null>} Datos de la sesión o null si no hay sesión
 */
async function getSessionInfo() {
    try {
        const response = await api.checkSession();
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener información de sesión:', error);
        return null;
    }
}
