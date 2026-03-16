// Clase para gestionar la consulta de ubicación de herramientas
class ConsultarUbicacion {
    constructor() {
        this.form = document.getElementById('consultarUbicacionForm');
        this.resultadoConsulta = document.getElementById('resultadoConsulta');
        this.btnConsultar = document.getElementById('btnConsultar');
        this.setupEventListeners();
    }

    async init() {
        // Cargar herramientas
        await this.loadHerramientas();
    }

    setupEventListeners() {
        if (this.btnConsultar) {
            this.btnConsultar.addEventListener('click', () => this.handleConsultarUbicacion());
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

    populateHerramientasSelect(herramientas) {
        const select = this.form.querySelector('select[name="herramienta"]');
        
        if (!herramientas || herramientas.length === 0) {
            select.innerHTML = '<option value="">No hay herramientas disponibles</option>';
            return;
        }

        const options = herramientas.map(h => 
            `<option value="${h.id}">${h.nombre}</option>`
        ).join('');

        select.innerHTML = `<option value="">Seleccione una herramienta</option>${options}`;
    }

    async handleConsultarUbicacion() {
        const herramientaId = this.form.herramienta.value;
        
        // Validar que se haya seleccionado una herramienta
        if (!herramientaId || herramientaId === '') {
            showToast('Por favor, seleccione una herramienta', 'error');
            return;
        }
        
        try {
            const response = await api.getEstadoHerramienta(herramientaId);
            if (response.success) {
                const herramienta = response.data;
                this.mostrarResultadoConsulta(herramienta);
            } else {
                showToast(response.message, 'error');
            }
        } catch (error) {
            showToast('Error al consultar ubicación', 'error');
        }
    }

    mostrarResultadoConsulta(herramienta) {
        // INTERPRETACIÓN: operario_actual NULL = disponible, NOT NULL = ocupado
        // Determinar si está en uso (tiene operario)
        const enUso = herramienta.operario_actual != null;
        const bgColor = enUso ? 'bg-gradient-to-br from-red-900 to-rose-900 border border-red-600' : 'bg-gradient-to-br from-green-900 to-emerald-900 border border-green-600';
        const estadoTexto = enUso ? 'Ocupado' : 'Disponible';
        const estadoColor = enUso ? 'text-red-400 font-bold' : 'text-green-400 font-bold';
        
        let html = `
            <div class="${bgColor} p-8 rounded-xl space-y-4 shadow-xl">
                <h4 class="font-bold text-white mb-6 text-2xl border-b border-slate-600 pb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Información de la Herramienta
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p class="text-slate-400 text-sm mb-1">Nombre</p>
                        <p class="text-white font-bold text-lg">${herramienta.nombre}</p>
                    </div>
                    <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p class="text-slate-400 text-sm mb-1">Estado</p>
                        <p class="${estadoColor} text-xl">${estadoTexto}</p>
                    </div>
                    <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p class="text-slate-400 text-sm mb-1">Ubicación actual</p>
                        <p class="text-white font-semibold">${herramienta.ubicacion_actual || 'Sin ubicación registrada'}</p>
                    </div>
        `;

        if (enUso) {
            html += `
                    <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p class="text-slate-400 text-sm mb-1">👤 Operario</p>
                        <p class="text-blue-400 font-bold">${herramienta.operario_actual}</p>
                    </div>
                </div>
                <hr class="border-slate-600 my-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p class="text-slate-400 text-sm mb-1">📅 Fecha inicio</p>
                        <p class="text-white font-semibold">${this.formatDate(herramienta.fecha_inicio)}</p>
                    </div>
                    ${herramienta.fecha_solicitud_fin ? `
                        <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <p class="text-slate-400 text-sm mb-1">⏰ Fecha fin prevista</p>
                            <p class="text-orange-400 font-bold">${this.formatDate(herramienta.fecha_solicitud_fin)}</p>
                        </div>
                    ` : '<div class="bg-slate-800 p-4 rounded-lg border border-slate-700"><p class="text-slate-400 italic text-sm">Sin fecha de finalización definida</p></div>'}
                </div>
            `;
        } else {
            html += `
                </div>
                <div class="mt-6 p-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg border border-green-500 shadow-lg">
                    <p class="text-white font-bold text-center text-lg flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Esta herramienta está disponible para usar
                    </p>
                </div>
            `;
        }

        html += '</div>';
        this.resultadoConsulta.innerHTML = html;
        this.resultadoConsulta.classList.remove('hidden');
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }
}
