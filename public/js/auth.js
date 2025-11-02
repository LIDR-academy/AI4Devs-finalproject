// Gestión de autenticación
class Auth {
    constructor() {
        console.log('[AUTH] Constructor llamado');
        // Referencias a elementos del DOM
        this.loginContainer = document.getElementById('loginForm');
        this.emailForm = document.getElementById('emailForm');
        this.codeForm = document.getElementById('codeForm');
        this.mainContent = document.getElementById('mainContent');
        this.btnLogout = document.getElementById('btnLogout');
        
        console.log('[AUTH] Elementos DOM:', {
            loginContainer: !!this.loginContainer,
            emailForm: !!this.emailForm,
            codeForm: !!this.codeForm,
            mainContent: !!this.mainContent,
            btnLogout: !!this.btnLogout
        });
        
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        console.log('[AUTH] setupEventListeners llamado');
        // Prevenir el envío de formularios
        this.emailForm.addEventListener('submit', (e) => e.preventDefault());
        this.codeForm.addEventListener('submit', (e) => e.preventDefault());

        const btnSendCode = document.getElementById('btnSendCode');
        const btnValidateCode = document.getElementById('btnValidateCode');
        
        console.log('[AUTH] Botones encontrados:', {
            btnSendCode: !!btnSendCode,
            btnValidateCode: !!btnValidateCode
        });
        
        // Manejar clicks en botones
        if (btnSendCode) {
            console.log('[AUTH] Agregando listener a btnSendCode');
            btnSendCode.addEventListener('click', () => {
                console.log('[AUTH] btnSendCode CLICK detectado');
                this.handleLoginSubmit();
            });
        }
        
        if (btnValidateCode) {
            btnValidateCode.addEventListener('click', () => this.handleCodeSubmit());
        }
        
        if (this.btnLogout) {
            this.btnLogout.addEventListener('click', () => this.handleLogout());
        }

        // Manejar la tecla Enter en los inputs
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleLoginSubmit();
                }
            });
        }

        const codeInput = document.getElementById('code');
        if (codeInput) {
            codeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleCodeSubmit();
                }
            });
        }
    }

    async handleLoginSubmit() {
        console.log('[AUTH] handleLoginSubmit llamado');
        const emailInput = document.getElementById('email');
        console.log('[AUTH] emailInput encontrado:', !!emailInput);
        
        if (!emailInput) {
            showToast('Error: Campo de email no encontrado', 'error');
            return;
        }
        
        const email = emailInput.value?.trim();
        console.log('[AUTH] Email value:', email);
        
        if (!email) {
            showToast('Por favor, ingrese un email', 'error');
            return;
        }
        
        console.log('[AUTH] Enviando código a:', email);
        
        try {
            const response = await api.sendLoginCode(email);
            console.log('[AUTH] Respuesta recibida:', response);
            
            // Manejar rate limiting
            if (response.statusCode === 429) {
                const remainingAttempts = response.data?.remaining_attempts;
                const blockTime = response.data?.block_time_remaining;
                
                let message = response.message;
                if (remainingAttempts !== undefined) {
                    message += ` Intentos restantes: ${remainingAttempts}`;
                }
                if (blockTime) {
                    const minutes = Math.ceil(blockTime / 60);
                    message += ` Bloqueado por ${minutes} minutos.`;
                }
                
                showToast(message, 'error');
                return;
            }
            
            if (response.success) {
                this.showCodeValidation(email);
                showToast('Código enviado correctamente', 'success');
            } else {
                showToast(response.message, 'error');
            }
        } catch (error) {
            console.error('Error al enviar código:', error);
            showToast('Error al enviar el código', 'error');
        }
    }

    async handleCodeSubmit() {
        const email = sessionStorage.getItem('tempEmail');
        if (!email) {
            showToast('Error: No se encontró el email para validar', 'error');
            this.showLogin();
            return;
        }

        const codeInput = document.getElementById('code');
        if (!codeInput) {
            showToast('Error: Campo de código no encontrado', 'error');
            return;
        }

        const codigo = codeInput.value;
        if (!codigo) {
            showToast('Por favor, ingrese el código de verificación', 'error');
            return;
        }
        
        try {
            const response = await api.validateCode(email, codigo);
            
            // Manejar rate limiting
            if (response.statusCode === 429) {
                const remainingAttempts = response.data?.remaining_attempts;
                const blockTime = response.data?.block_time_remaining;
                
                let message = response.message;
                if (remainingAttempts !== undefined) {
                    message += ` Intentos restantes: ${remainingAttempts}`;
                }
                if (blockTime) {
                    const minutes = Math.ceil(blockTime / 60);
                    message += ` Bloqueado por ${minutes} minutos.`;
                }
                
                showToast(message, 'error');
                return;
            }
            
            if (response.success) {
                // La sesión ahora se gestiona con httpOnly cookies en el servidor
                // No guardamos nada en localStorage por seguridad
                sessionStorage.removeItem('tempEmail');
                
                // Obtener token CSRF para peticiones futuras
                await api.getCsrfToken();
                
                this.showMainContent();
                showToast('Sesión iniciada correctamente', 'success');
                
                // Inicializar herramientas y dashboard después del login
                if (window.herramientas) {
                    window.herramientas.init();
                }
                if (window.dashboard) {
                    window.dashboard.init();
                }
            } else {
                showToast(response.message, 'error');
            }
        } catch (error) {
            console.error('Error al validar código:', error);
            showToast('Error al validar el código', 'error');
        }
    }

    async handleLogout() {
        try {
            const response = await api.logout();
            
            if (response.success) {
                this.clearSession();
                this.showLogin();
                showToast('Sesión cerrada correctamente', 'success');
            } else {
                showToast('Error al cerrar sesión: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Aunque falle, limpiamos el frontend
            this.clearSession();
            this.showLogin();
            showToast('Sesión cerrada', 'success');
        }
    }

    clearSession() {
        // Ya no usamos localStorage para sesiones (se usan httpOnly cookies)
        // Solo limpiamos el email temporal
        sessionStorage.removeItem('tempEmail');
        
        // CRÍTICO: Limpiar token CSRF cacheado para evitar 403 en siguiente login
        if (window.api && typeof window.api === 'object') {
            window.api.csrfToken = null;
        }
    }

    async checkSession() {
        // Verificar si hay parámetros en la URL (código y email desde el email)
        const urlParams = new URLSearchParams(window.location.search);
        const codigoFromUrl = urlParams.get('codigo');
        const emailFromUrl = urlParams.get('email');
        
        if (codigoFromUrl && emailFromUrl) {
            console.log('[AUTH] Código y email detectados en URL:', { codigo: codigoFromUrl, email: emailFromUrl });
            
            // Mostrar el formulario de validación de código
            this.showCodeValidation(emailFromUrl);
            
            // Esperar un momento para que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Prellenar el campo del código (el campo se llama "code" en el HTML)
            const inputCodigo = document.getElementById('code');
            if (inputCodigo) {
                inputCodigo.value = codigoFromUrl;
                console.log('[AUTH] Campo de código prellenado:', codigoFromUrl);
            } else {
                console.error('[AUTH] No se encontró el campo de código');
            }
            
            // Limpiar los parámetros de la URL para evitar confusión
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // No continuar con la verificación de sesión
            return;
        }
        
        // Verificar en el servidor si hay una sesión activa
        try {
            const serverResponse = await api.checkSession();
            
            if (serverResponse.success && serverResponse.data) {
                // Hay sesión activa en el servidor
                // Obtener token CSRF para peticiones futuras
                await api.getCsrfToken();
                
                this.showMainContent();
                return;
            }
        } catch (error) {
            console.error('[Auth] Error al verificar sesión en el servidor:', error);
        }
        
        // No hay sesión activa, mostrar login
        this.showLogin();
    }

    showLogin() {
        this.loginContainer.classList.remove('hidden');
        this.emailForm.classList.remove('hidden');
        this.codeForm.classList.add('hidden');
        this.mainContent.classList.add('hidden');
        this.emailForm.reset();
    }

    showCodeValidation(email) {
        sessionStorage.setItem('tempEmail', email);
        this.emailForm.classList.add('hidden');
        this.codeForm.classList.remove('hidden');
        this.mainContent.classList.add('hidden');
        this.codeForm.reset();
    }

    showMainContent() {
        this.loginContainer.classList.add('hidden');
        this.mainContent.classList.remove('hidden');
        
        // Inicializar dashboard y herramientas si existen
        if (window.dashboard && typeof window.dashboard.init === 'function') {
            window.dashboard.init();
        }
        if (window.herramientas && typeof window.herramientas.init === 'function') {
            window.herramientas.init();
        }
    }
}