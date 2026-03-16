// Clase para gestionar el uso de herramientas
class UsarHerramienta {
    constructor() {
        this.form = document.getElementById('usarHerramientaForm');
        this.btnUsar = document.getElementById('btnUsar');
        this.setupEventListeners();
    }

    async init() {
        // Obtener herramienta_id de la URL si existe
        const urlParams = new URLSearchParams(window.location.search);
        this.preselectedHerramientaId = urlParams.get('herramienta_id');
        
        // Cargar datos iniciales
        await this.loadHerramientas();
        await this.loadUbicaciones();
    }

    setupEventListeners() {
        if (this.btnUsar) {
            this.btnUsar.addEventListener('click', () => this.handleUsarHerramienta());
        }
    }

    async loadHerramientas() {
        try {
            const response = await api.getHerramientas();
            
            if (response.success) {
                this.populateHerramientasSelect(response.data);
            } else {
                showToast('Error al cargar herramientas: ' + response.message, 'error');
            }
        } catch (error) {
            showToast('Error al cargar herramientas', 'error');
        }
    }

    async loadUbicaciones() {
        try {
            const response = await api.getUbicaciones();
            
            if (response.success) {
                this.populateUbicacionesSelect(response.data);
            } else {
                showToast('Error al cargar ubicaciones: ' + response.message, 'error');
            }
        } catch (error) {
            showToast('Error al cargar ubicaciones', 'error');
        }
    }

    populateHerramientasSelect(herramientas) {
        const select = this.form.querySelector('select[name="herramienta"]');
        
        if (!herramientas || herramientas.length === 0) {
            select.innerHTML = '<option value="">No hay herramientas disponibles</option>';
            return;
        }

        const options = herramientas.map(h => {
            const isSelected = this.preselectedHerramientaId && h.id == this.preselectedHerramientaId ? 'selected' : '';
            return `<option value="${h.id}" ${isSelected}>${h.nombre}</option>`;
        }).join('');

        select.innerHTML = `<option value="">Seleccione una herramienta</option>${options}`;
        
        // Si hay una herramienta pre-seleccionada, mostrar mensaje
        if (this.preselectedHerramientaId) {
            const herramientaSeleccionada = herramientas.find(h => h.id == this.preselectedHerramientaId);
            if (herramientaSeleccionada) {
                showToast(`Herramienta "${herramientaSeleccionada.nombre}" seleccionada`, 'success');
            }
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

    async handleUsarHerramienta() {
        const herramientaId = this.form.herramienta.value;
        const ubicacionId = this.form.ubicacion.value;
        const fechaFin = this.form.fechaFin.value;

        // Validaciones
        if (!herramientaId || herramientaId === '') {
            showToast('Por favor, seleccione una herramienta', 'error');
            return;
        }
        
        if (!ubicacionId || ubicacionId === '') {
            showToast('Por favor, seleccione una ubicación', 'error');
            return;
        }

        // Validar que la fecha de fin no sea anterior a la fecha actual
        if (fechaFin) {
            const fechaFinDate = new Date(fechaFin);
            const ahora = new Date();
            
            if (fechaFinDate < ahora) {
                showToast('La fecha de fin no puede ser anterior a la fecha actual', 'error');
                return;
            }
        }

        try {
            // Deshabilitar botón mientras se procesa
            if (this.btnUsar) {
                this.btnUsar.disabled = true;
                this.btnUsar.classList.add('opacity-50', 'cursor-not-allowed');
            }

            // 1. Verificar si la herramienta está en uso
            const estadoResponse = await api.getEstadoHerramienta(herramientaId);
            if (estadoResponse.success) {
                const herramienta = estadoResponse.data;
                
                // 2. Si está en uso, mostrar mensaje específico
                if (herramienta.operario_actual) {
                    showToast(
                        `La herramienta está siendo utilizada por ${herramienta.operario_actual} en ${herramienta.ubicacion_actual}`,
                        'error'
                    );
                    return;
                }

                // 3. Si no está en uso:
                // 3.1. Actualizar último registro (si existe)
                if (herramienta.ubicacion_actual) {
                    await api.dejarHerramienta(herramientaId, {
                        ubicacion_id: herramienta.ubicacion_id,
                        fecha_fin: new Date().toISOString()
                    });
                }

                // 3.2. Crear nuevo registro (fecha_inicio usa CURRENT_TIMESTAMP del servidor)
                // El operario_uuid se obtiene de la sesión en el backend (seguridad)
                const response = await api.usarHerramienta(herramientaId, {
                    ubicacion_id: parseInt(ubicacionId),
                    fecha_fin: this.form.fechaFin.value ? this.formatDateForMySQL(this.form.fechaFin.value) : null
                });

                if (response.success) {
                    showToast('Herramienta registrada correctamente', 'success');
                    this.form.reset();
                    
                    // Cerrar la ventana después de 2 segundos
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                } else {
                    showToast(response.message, 'error');
                }
            }
        } catch (error) {
            showToast('Error al registrar uso de herramienta', 'error');
        } finally {
            // Rehabilitar botón
            if (this.btnUsar) {
                this.btnUsar.disabled = false;
                this.btnUsar.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    formatDateForMySQL(dateTimeLocal) {
        if (!dateTimeLocal) return null;
        
        // El formato datetime-local es "YYYY-MM-DDTHH:mm"
        // MySQL espera "YYYY-MM-DD HH:mm:ss"
        return dateTimeLocal.replace('T', ' ') + ':00';
    }
}
