// Funciones de utilidad globales
window.formatDate = function(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Sistema de notificaciones toast
class Toast {
    constructor() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            console.error('Toast container not found');
            return;
        }
    }

    show(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-blue-600'
        };

        toast.className = `px-6 py-3 mb-2 rounded-md text-white transform transition-transform duration-300 ${colors[type]}`;
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

// Crear instancia global del sistema de toast
window.toast = new Toast();
window.showToast = (message, type = 'info') => window.toast.show(message, type);

// Verificación de la base de datos
async function checkDatabase() {
    try {
        // Detectar ambiente: localhost vs producción
        const checkDbUrl = window.location.hostname === 'localhost' 
            ? '/AI4Devs-finalproject/src/api/check-db.php' 
            : '/api/check-db';
        
        console.log('[APP] Checking database at:', checkDbUrl);
        const response = await fetch(checkDbUrl);
        console.log('[APP] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            // Intentar leer el cuerpo de la respuesta para más info
            let errorDetails = '';
            try {
                const text = await response.text();
                console.error('[APP] Error response body:', text);
                errorDetails = text.substring(0, 200); // Primeros 200 caracteres
            } catch (e) {
                console.error('[APP] No se pudo leer el cuerpo del error');
            }
            
            throw new Error(`Error ${response.status}: ${response.statusText}${errorDetails ? ' - ' + errorDetails : ''}`);
        }
        
        const data = await response.json();
        console.log('[APP] Database check response:', data);
        
        // Si el servidor respondió con información de debug, mostrarla
        if (data.debug) {
            console.log('[APP] Debug info:', data.debug);
        }
        if (data.missing_tables) {
            console.log('[APP] Missing tables:', data.missing_tables);
        }
        if (data.error) {
            console.error('[APP] Server error:', data.error);
        }
        
        return data.success;
    } catch (error) {
        console.error('Error al verificar la base de datos:', error);
        return false;
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[APP] DOMContentLoaded event fired');
    console.log('[APP] API_BASE_URL:', API_BASE_URL);
    console.log('[APP] window.location.hostname:', window.location.hostname);
    
    try {
        // Crear instancias de las clases principales PRIMERO
        // (para que los botones funcionen incluso si la DB falla)
        console.log('[APP] Creando instancia de Auth...');
        window.auth = new Auth();
        console.log('[APP] Auth creado:', window.auth);
        
        console.log('[APP] Creando instancia de HerramientasManager...');
        window.herramientas = new HerramientasManager();
        console.log('[APP] HerramientasManager creado');
        
        // Verificar la base de datos después
        console.log('[APP] Verificando base de datos...');
        const dbOk = await checkDatabase();
        console.log('[APP] Database check result:', dbOk);
        
        if (!dbOk) {
            console.log('[APP] Base de datos no inicializada');
            showToast('⚠️ Base de datos no configurada. Contacta al administrador.', 'error');
            
            // Mostrar mensaje de error en la interfaz
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm';
                errorDiv.innerHTML = `
                    <strong class="block mb-2">⚠️ Error de Configuración</strong>
                    <p>La base de datos no está configurada correctamente.</p>
                    <p class="mt-2 text-xs">Por favor, contacta al administrador del sistema.</p>
                `;
                loginForm.appendChild(errorDiv);
            }
            
            // NO bloquear la aplicación, permitir que continúe
            // (Los errores de API se manejarán individualmente)
        }

        // No crear instancia del dashboard en la página principal
        // El dashboard ahora es una ventana separada

        // Configurar el botón para abrir usar herramienta en una nueva ventana
        const btnOpenUsar = document.getElementById('btnOpenUsar');
        if (btnOpenUsar) {
            btnOpenUsar.addEventListener('click', () => {
                // Abrir usar herramienta en una nueva ventana
                const usarWindow = window.open(
                    'usar.html',
                    'UsarHerramienta',
                    'width=700,height=550,scrollbars=yes,resizable=yes'
                );
                
                if (usarWindow) {
                    showToast('Ventana abierta', 'success');
                } else {
                    showToast('Por favor, permite las ventanas emergentes', 'error');
                }
            });
        }

        // Configurar el botón para abrir el dashboard en una nueva ventana
        const btnOpenDashboard = document.getElementById('btnOpenDashboard');
        if (btnOpenDashboard) {
            btnOpenDashboard.addEventListener('click', () => {
                // Abrir dashboard en una nueva ventana
                const dashboardWindow = window.open(
                    'dashboard.html',
                    'Dashboard',
                    'width=1200,height=800,scrollbars=yes,resizable=yes'
                );
                
                if (dashboardWindow) {
                    showToast('Dashboard abierto en nueva ventana', 'success');
                } else {
                    showToast('Por favor, permite las ventanas emergentes para abrir el dashboard', 'error');
                }
            });
        }

        // Configurar el botón para abrir el histórico en una nueva ventana
        const btnOpenHistorico = document.getElementById('btnOpenHistorico');
        if (btnOpenHistorico) {
            btnOpenHistorico.addEventListener('click', () => {
                // Abrir histórico en una nueva ventana
                const historicoWindow = window.open(
                    'historico.html',
                    'Historico',
                    'width=1400,height=800,scrollbars=yes,resizable=yes'
                );
                
                if (historicoWindow) {
                    showToast('Histórico abierto en nueva ventana', 'success');
                } else {
                    showToast('Por favor, permite las ventanas emergentes para abrir el histórico', 'error');
                }
            });
        }

        // Configurar el botón para abrir consultar ubicación en una nueva ventana
        const btnOpenConsultar = document.getElementById('btnOpenConsultar');
        if (btnOpenConsultar) {
            btnOpenConsultar.addEventListener('click', () => {
                // Abrir consultar en una nueva ventana
                const consultarWindow = window.open(
                    'consultar.html',
                    'ConsultarUbicacion',
                    'width=800,height=600,scrollbars=yes,resizable=yes'
                );
                
                if (consultarWindow) {
                    showToast('Consulta abierta en nueva ventana', 'success');
                } else {
                    showToast('Por favor, permite las ventanas emergentes para abrir la consulta', 'error');
                }
            });
        }

        // Configurar el botón para abrir dejar herramienta en una nueva ventana
        const btnOpenDejar = document.getElementById('btnOpenDejar');
        if (btnOpenDejar) {
            btnOpenDejar.addEventListener('click', () => {
                // Abrir dejar herramienta en una nueva ventana
                const dejarWindow = window.open(
                    'dejar.html',
                    'DejarHerramienta',
                    'width=700,height=600,scrollbars=yes,resizable=yes'
                );
                
                if (dejarWindow) {
                    showToast('Ventana abierta', 'success');
                } else {
                    showToast('Por favor, permite las ventanas emergentes', 'error');
                }
            });
        }

        // No inicializar aquí, dejar que auth.checkSession() lo maneje
        // La autenticación se verifica en el constructor de Auth
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        showToast('Error al inicializar la aplicación', 'error');
    }
});

function hideAllSections() {
    const sections = [
        document.getElementById('dashboardContainer'),
        document.getElementById('historicoContainer')
    ];
    
    sections.forEach(section => section.classList.add('hidden'));
    herramientas.hideAllForms();
    dashboard.stopAutoRefresh();
}

async function cargarHistorico() {
    const historicoBody = document.getElementById('historicoBody');
    try {
        const response = await api.getDashboard(); // Asumimos que incluye el historial
        if (response.success) {
            historicoBody.innerHTML = response.data.map(registro => `
                <tr>
                    <td class="px-6 py-4">${registro.herramienta_nombre}</td>
                    <td class="px-6 py-4">${registro.operario_nombre || '-'}</td>
                    <td class="px-6 py-4">${registro.ubicacion_nombre}</td>
                    <td class="px-6 py-4">${formatDate(registro.fecha_inicio)}</td>
                    <td class="px-6 py-4">${registro.fecha_fin ? formatDate(registro.fecha_fin) : '-'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showToast('Error al cargar el histórico', 'error');
    }
}

// Suprimir errores de extensiones del navegador
window.addEventListener('unhandledrejection', (event) => {
    // Filtrar errores conocidos de extensiones del navegador
    if (event.reason && event.reason.message) {
        const message = event.reason.message;
        if (message.includes('message channel closed') || 
            message.includes('Extension context invalidated')) {
            // Suprimir este error específico de extensiones
            event.preventDefault();
            console.warn('Error de extensión del navegador suprimido:', message);
            return;
        }
    }
    // Dejar que otros errores se manejen normalmente
});