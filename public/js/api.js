// Configuración de la API
// Detecta automáticamente si está en local o en producción
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/AI4Devs-finalproject/api'  // Local con subdirectorio
    : '/api';                        // Railway en raíz

console.log('[API] API_BASE_URL configurado como:', API_BASE_URL);
console.log('[API] hostname:', window.location.hostname);

// Funciones de la API
const api = {
    csrfToken: null,

    async getCsrfToken() {
        if (this.csrfToken) {
            console.log('[CSRF] Token ya existe:', this.csrfToken);
            return this.csrfToken;
        }
        
        try {
            console.log('[CSRF] Solicitando token...');
            const response = await fetch(`${API_BASE_URL}/csrf-token`, {
                credentials: 'same-origin'
            });
            const data = await response.json();
            console.log('[CSRF] Respuesta:', data);
            if (data.success) {
                this.csrfToken = data.data.token;
                console.log('[CSRF] Token obtenido:', this.csrfToken);
                return this.csrfToken;
            }
        } catch (error) {
            console.error('Error al obtener token CSRF:', error);
        }
        return null;
    },

    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Agregar token CSRF si existe
        if (this.csrfToken) {
            headers['X-CSRF-TOKEN'] = this.csrfToken;
            console.log('[CSRF] Token agregado al header:', this.csrfToken);
        } else {
            console.warn('[CSRF] No hay token disponible para agregar');
        }
        
        return headers;
    },
    async sendLoginCode(email) {
        console.log('[API] sendLoginCode llamado con email:', email);
        console.log('[API] URL completa:', `${API_BASE_URL}/login/send-code`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/login/send-code`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            console.log('[API] Response status:', response.status);
            console.log('[API] Response ok:', response.ok);

            // Obtener el texto de la respuesta primero
            const responseText = await response.text();

            // Intentar parsear como JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Error al parsear JSON:', parseError);
                console.error('Respuesta recibida:', responseText);
                return {
                    success: false,
                    message: 'La respuesta del servidor no es JSON válido'
                };
            }

            // Siempre devolver los datos parseados
            // El servidor ya incluye success: false en caso de error
            return data;
            
        } catch (error) {
            console.error('Error en sendLoginCode:', error);
            return {
                success: false,
                message: error.message || 'Error de conexión con el servidor'
            };
        }
    },

    async validateCode(email, codigo) {
        const response = await fetch(`${API_BASE_URL}/login/validate-code`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo })
        });
        return await response.json();
    },

    async checkSession() {
        try {
            const response = await fetch(`${API_BASE_URL}/login/check-session`, {
                method: 'GET',
                credentials: 'same-origin', // Importante para enviar cookies de sesión
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            return {
                success: false,
                message: error.message || 'Error de conexión con el servidor'
            };
        }
    },

    async logout() {
        try {
            await this.getCsrfToken(); // Obtener token antes de la petición
            const response = await fetch(`${API_BASE_URL}/login/logout`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({}) // Enviar objeto vacío
            });
            return await response.json();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return {
                success: false,
                message: error.message || 'Error de conexión con el servidor'
            };
        }
    },

    async getHerramientas() {
        const response = await fetch(`${API_BASE_URL}/herramientas`, {
            credentials: 'same-origin',
            headers: this.getAuthHeaders()
        });
        return await response.json();
    },

    async getEstadoHerramienta(id) {
        const response = await fetch(`${API_BASE_URL}/herramientas/${id}/estado`, {
            credentials: 'same-origin',
            headers: this.getAuthHeaders()
        });
        return await response.json();
    },

    async usarHerramienta(id, data) {
        await this.getCsrfToken(); // Obtener token antes de la petición
        const response = await fetch(`${API_BASE_URL}/herramientas/${id}/usar`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async dejarHerramienta(id, data) {
        await this.getCsrfToken(); // Obtener token antes de la petición
        const response = await fetch(`${API_BASE_URL}/herramientas/${id}/dejar`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async getHistorial(id) {
        const response = await fetch(`${API_BASE_URL}/herramientas/${id}/historial`, {
            credentials: 'same-origin',
            headers: this.getAuthHeaders()
        });
        return await response.json();
    },

    async getDashboard() {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            credentials: 'same-origin',
            headers: this.getAuthHeaders()
        });
        return await response.json();
    },

    async getUbicaciones() {
        try {
            const response = await fetch(`${API_BASE_URL}/ubicaciones`, {
                credentials: 'same-origin',
                headers: this.getAuthHeaders()
            });
            
            const text = await response.text();
            console.log('Respuesta raw de ubicaciones:', text);
            
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Error parseando JSON de ubicaciones:', e);
                console.error('Texto recibido:', text);
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error en getUbicaciones:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    async getHistorico() {
        try {
            const response = await fetch(`${API_BASE_URL}/historico`, {
                credentials: 'same-origin',
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error en getHistorico:', error);
            return {
                success: false,
                message: error.message || 'Error al obtener el histórico'
            };
        }
    }
};