// Clase para gestionar la devolución de herramientas
class DejarHerramienta {
    constructor() {
        this.form = document.getElementById('dejarHerramientaForm');
        this.btnDejar = document.getElementById('btnDejar');
        this.dejarContainer = document.getElementById('dejarHerramientaContainer');
        this.noHerramientasMessage = document.getElementById('noHerramientasMessage');
        this.todasLasHerramientas = [];
        this.setupEventListeners();
    }

    async init() {
        // Cargar datos iniciales
        await this.loadHerramientas();
        await this.loadUbicaciones();
    }

    setupEventListeners() {
        if (this.btnDejar) {
            this.btnDejar.addEventListener('click', () => this.handleDejarHerramienta());
        }
    }

    async loadHerramientas() {
        try {
            const response = await api.getHerramientas();
            
            if (response.success) {
                this.todasLasHerramientas = response.data;
                await this.populateDejarHerramientasSelect();
            } else {
                console.error('Error en respuesta:', response.message);
                showToast('Error al cargar herramientas: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('Error al cargar herramientas:', error);
            showToast('Error al cargar herramientas', 'error');
        }
    }

    async loadUbicaciones() {
        try {
            const response = await api.getUbicaciones();
            
            if (response.success) {
                this.populateUbicacionesSelect(response.data);
            } else {
                console.error('Error en respuesta:', response.message);
                showToast('Error al cargar ubicaciones: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('Error al cargar ubicaciones:', error);
            showToast('Error al cargar ubicaciones', 'error');
        }
    }

    async populateDejarHerramientasSelect() {
        // Obtener información de la sesión del servidor
        const sessionInfo = await getSessionInfo();
        if (!sessionInfo || !sessionInfo.user || !sessionInfo.user.uuid) {
            console.error('No hay sesión activa');
            return;
        }

        const userUuid = sessionInfo.user.uuid;
        
        // Filtrar solo las herramientas que el usuario actual tiene en uso
        // INTERPRETACIÓN: operario_uuid NULL = disponible, NOT NULL = ocupado por alguien
        const herramientasEnUso = this.todasLasHerramientas.filter(h => {
            return h.operario_uuid != null && h.operario_uuid === userUuid;
        });        const dejarSelect = this.form.querySelector('select[name="herramienta"]');

        if (herramientasEnUso.length === 0) {
            // No tiene herramientas en uso: ocultar formulario y mostrar mensaje
            if (this.dejarContainer) {
                this.dejarContainer.classList.add('hidden');
            }
            if (this.noHerramientasMessage) {
                this.noHerramientasMessage.classList.remove('hidden');
            }
            console.log('Usuario no tiene herramientas en uso - formulario oculto, mensaje mostrado');
        } else {
            // Tiene herramientas en uso: mostrar formulario y ocultar mensaje
            if (this.dejarContainer) {
                this.dejarContainer.classList.remove('hidden');
            }
            if (this.noHerramientasMessage) {
                this.noHerramientasMessage.classList.add('hidden');
            }
            
            const options = herramientasEnUso.map(h => 
                `<option value="${h.id}">${h.nombre} (${h.ubicacion_actual || 'Sin ubicación'})</option>`
            ).join('');
            
            if (dejarSelect) {
                dejarSelect.innerHTML = `<option value="">Seleccione la herramienta a devolver</option>${options}`;
            }
            console.log(`Usuario tiene ${herramientasEnUso.length} herramienta(s) en uso`);
        }
    }

    populateUbicacionesSelect(ubicaciones) {
        const options = ubicaciones.map(u => 
            `<option value="${u.id}">${u.nombre}</option>`
        ).join('');

        const select = this.form.querySelector('select[name="ubicacion"]');
        if (select) {
            select.innerHTML = `<option value="">Seleccione una ubicación</option>${options}`;
        }
    }

    async handleDejarHerramienta() {
        const herramientaId = this.form.herramienta.value;
        const ubicacionId = this.form.ubicacion.value;
        
        // Validaciones
        if (!herramientaId || herramientaId === '') {
            showToast('Por favor, seleccione una herramienta', 'error');
            return;
        }
        
        if (!ubicacionId || ubicacionId === '') {
            showToast('Por favor, seleccione una ubicación donde dejar la herramienta', 'error');
            return;
        }
        
        try {
            // Deshabilitar botón mientras se procesa
            if (this.btnDejar) {
                this.btnDejar.disabled = true;
                this.btnDejar.classList.add('opacity-50', 'cursor-not-allowed');
            }

            const response = await api.dejarHerramienta(herramientaId, {
                ubicacion_id: parseInt(ubicacionId)
            });

            if (response.success) {
                showToast('Herramienta devuelta correctamente', 'success');
                this.form.reset();
                
                // Recargar las herramientas para actualizar el desplegable
                await this.loadHerramientas();
                
                // Cerrar la ventana después de 2 segundos
                setTimeout(() => {
                    window.close();
                }, 2000);
            } else {
                showToast(response.message, 'error');
            }
        } catch (error) {
            showToast('Error al devolver herramienta', 'error');
            console.error(error);
        } finally {
            // Rehabilitar botón
            if (this.btnDejar) {
                this.btnDejar.disabled = false;
                this.btnDejar.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }
}
