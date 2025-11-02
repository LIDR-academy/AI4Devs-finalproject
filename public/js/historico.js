// Clase para gestionar el histórico de usos de herramientas
class Historico {
    constructor() {
        this.historicoBody = document.getElementById('historicoBody');
        this.noDataMessage = document.getElementById('noDataMessage');
        this.totalRegistros = document.getElementById('totalRegistros');
        this.ultimoRefresco = document.getElementById('ultimoRefresco');
        this.btnRefresh = document.getElementById('btnRefreshHistorico');
        
        this.filtroHerramienta = document.getElementById('filtroHerramienta');
        this.filtroOperario = document.getElementById('filtroOperario');
        this.filtroUbicacion = document.getElementById('filtroUbicacion');
        
        // Paginación
        this.paginaActual = 1;
        this.resultadosPorPagina = 25; // Por defecto 25
        this.selectResultadosPorPagina = document.getElementById('resultadosPorPagina');
        this.paginacionContainer = document.getElementById('paginacionContainer');
        this.infoRegistros = document.getElementById('infoRegistros');
        
        this.movimientos = [];
        this.movimientosFiltrados = [];
        this.autoRefreshInterval = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botón de actualización manual
        if (this.btnRefresh) {
            this.btnRefresh.addEventListener('click', () => this.manualRefresh());
        }

        // Filtros en tiempo real
        if (this.filtroHerramienta) {
            this.filtroHerramienta.addEventListener('input', () => {
                this.paginaActual = 1; // Resetear a página 1 al filtrar
                this.aplicarFiltros();
            });
        }
        if (this.filtroOperario) {
            this.filtroOperario.addEventListener('input', () => {
                this.paginaActual = 1;
                this.aplicarFiltros();
            });
        }
        if (this.filtroUbicacion) {
            this.filtroUbicacion.addEventListener('input', () => {
                this.paginaActual = 1;
                this.aplicarFiltros();
            });
        }

        // Selector de resultados por página
        if (this.selectResultadosPorPagina) {
            this.selectResultadosPorPagina.addEventListener('change', (e) => {
                this.resultadosPorPagina = parseInt(e.target.value);
                this.paginaActual = 1;
                this.renderMovimientos();
            });
        }
    }

    async init() {
        console.log('Inicializando histórico...');
        await this.loadMovimientos();
        this.startAutoRefresh();
    }

    async loadMovimientos() {
        try {
            const response = await api.getHistorico();
            
            if (response.success) {
                this.movimientos = response.data || [];
                console.log('Movimientos cargados:', this.movimientos.length);
                this.aplicarFiltros();
                this.actualizarUltimoRefresco();
                return true; // Éxito
            } else {
                console.error('Error al cargar movimientos:', response.message);
                showToast('Error al cargar el histórico', 'error');
                this.mostrarMensajeSinDatos();
                return false; // Error
            }
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            showToast('Error al cargar el histórico', 'error');
            this.mostrarMensajeSinDatos();
            return false; // Error
        }
    }

    aplicarFiltros() {
        const filtroHerr = this.filtroHerramienta?.value.toLowerCase().trim() || '';
        const filtroOper = this.filtroOperario?.value.toLowerCase().trim() || '';
        const filtroUbi = this.filtroUbicacion?.value.toLowerCase().trim() || '';

        this.movimientosFiltrados = this.movimientos.filter(mov => {
            const coincideHerramienta = !filtroHerr || 
                (mov.herramienta_nombre && mov.herramienta_nombre.toLowerCase().includes(filtroHerr));
            
            const coincideOperario = !filtroOper || 
                (mov.operario_nombre && mov.operario_nombre.toLowerCase().includes(filtroOper));
            
            const coincideUbicacion = !filtroUbi || 
                (mov.ubicacion_nombre && mov.ubicacion_nombre.toLowerCase().includes(filtroUbi));

            return coincideHerramienta && coincideOperario && coincideUbicacion;
        });

        console.log(`Filtros aplicados: ${this.movimientosFiltrados.length} de ${this.movimientos.length} registros`);
        this.renderMovimientos();
    }

    renderMovimientos() {
        if (!this.historicoBody) return;

        if (this.movimientosFiltrados.length === 0) {
            this.mostrarMensajeSinDatos();
            return;
        }

        // Ordenar por dh_created descendente (más reciente primero)
        const movimientosOrdenados = [...this.movimientosFiltrados].sort((a, b) => {
            const fechaA = new Date(a.dh_created || a.fecha_inicio);
            const fechaB = new Date(b.dh_created || b.fecha_inicio);
            return fechaB - fechaA;
        });

        // Calcular paginación
        const totalRegistros = movimientosOrdenados.length;
        const totalPaginas = Math.ceil(totalRegistros / this.resultadosPorPagina);
        
        // Ajustar página actual si está fuera de rango
        if (this.paginaActual > totalPaginas && totalPaginas > 0) {
            this.paginaActual = totalPaginas;
        }
        
        const inicio = (this.paginaActual - 1) * this.resultadosPorPagina;
        const fin = inicio + this.resultadosPorPagina;
        const movimientosPagina = movimientosOrdenados.slice(inicio, fin);

        // Renderizar filas - usando DOM API para prevenir XSS
        this.historicoBody.innerHTML = ''; // Limpiar contenido
        movimientosPagina.forEach(mov => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-700 transition-colors duration-200';

            // Columna: Herramienta
            const tdHerramienta = document.createElement('td');
            tdHerramienta.className = 'px-6 py-4 whitespace-nowrap text-sm font-semibold text-white';
            tdHerramienta.textContent = mov.herramienta_nombre || '-';
            tr.appendChild(tdHerramienta);

            // Columna: Operario
            const tdOperario = document.createElement('td');
            tdOperario.className = 'px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-medium';
            tdOperario.textContent = mov.operario_nombre || '-';
            tr.appendChild(tdOperario);

            // Columna: Ubicación
            const tdUbicacion = document.createElement('td');
            tdUbicacion.className = 'px-6 py-4 whitespace-nowrap text-sm text-slate-300';
            tdUbicacion.textContent = mov.ubicacion_nombre || '-';
            tr.appendChild(tdUbicacion);

            // Columna: Fecha Inicio
            const tdFechaInicio = document.createElement('td');
            tdFechaInicio.className = 'px-6 py-4 whitespace-nowrap text-sm text-slate-300';
            tdFechaInicio.textContent = formatDate(mov.fecha_inicio);
            tr.appendChild(tdFechaInicio);

            // Columna: Fecha Fin
            const tdFechaFin = document.createElement('td');
            tdFechaFin.className = 'px-6 py-4 whitespace-nowrap text-sm text-slate-300';
            if (mov.fecha_fin) {
                tdFechaFin.textContent = formatDate(mov.fecha_fin);
            } else {
                const span = document.createElement('span');
                span.className = 'text-slate-500 italic';
                span.textContent = '-';
                tdFechaFin.appendChild(span);
            }
            tr.appendChild(tdFechaFin);

            this.historicoBody.appendChild(tr);
        });

        // Actualizar contador total
        if (this.totalRegistros) {
            this.totalRegistros.textContent = totalRegistros;
        }

        // Actualizar información de registros mostrados
        if (this.infoRegistros) {
            const registroInicio = totalRegistros > 0 ? inicio + 1 : 0;
            const registroFin = Math.min(fin, totalRegistros);
            this.infoRegistros.textContent = `Mostrando ${registroInicio} - ${registroFin} de ${totalRegistros}`;
        }

        // Renderizar controles de paginación
        this.renderPaginacion(totalPaginas, totalRegistros);

        // Ocultar mensaje de sin datos
        if (this.noDataMessage) {
            this.noDataMessage.classList.add('hidden');
        }
    }

    renderPaginacion(totalPaginas, totalRegistros) {
        if (!this.paginacionContainer) return;

        if (totalPaginas <= 1) {
            this.paginacionContainer.innerHTML = '';
            return;
        }

        let html = '<div class="flex items-center justify-center gap-2">';

        // Botón Anterior
        const btnAnteriorDisabled = this.paginaActual === 1;
        html += `
            <button 
                onclick="window.historico.cambiarPagina(${this.paginaActual - 1})"
                ${btnAnteriorDisabled ? 'disabled' : ''}
                class="px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    btnAnteriorDisabled 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:scale-105'
                }">
                ← Anterior
            </button>
        `;

        // Números de página
        const maxBotones = 7;
        let paginaInicio = Math.max(1, this.paginaActual - Math.floor(maxBotones / 2));
        let paginaFin = Math.min(totalPaginas, paginaInicio + maxBotones - 1);

        if (paginaFin - paginaInicio < maxBotones - 1) {
            paginaInicio = Math.max(1, paginaFin - maxBotones + 1);
        }

        // Primera página si no está visible
        if (paginaInicio > 1) {
            html += `
                <button 
                    onclick="window.historico.cambiarPagina(1)"
                    class="px-4 py-2 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 hover:scale-105">
                    1
                </button>
            `;
            if (paginaInicio > 2) {
                html += '<span class="text-slate-400 px-2">...</span>';
            }
        }

        // Botones de páginas
        for (let i = paginaInicio; i <= paginaFin; i++) {
            const esActual = i === this.paginaActual;
            html += `
                <button 
                    onclick="window.historico.cambiarPagina(${i})"
                    class="px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                        esActual 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-110' 
                        : 'bg-slate-700 hover:bg-slate-600 text-white hover:scale-105'
                    }">
                    ${i}
                </button>
            `;
        }

        // Última página si no está visible
        if (paginaFin < totalPaginas) {
            if (paginaFin < totalPaginas - 1) {
                html += '<span class="text-slate-400 px-2">...</span>';
            }
            html += `
                <button 
                    onclick="window.historico.cambiarPagina(${totalPaginas})"
                    class="px-4 py-2 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 hover:scale-105">
                    ${totalPaginas}
                </button>
            `;
        }

        // Botón Siguiente
        const btnSiguienteDisabled = this.paginaActual === totalPaginas;
        html += `
            <button 
                onclick="window.historico.cambiarPagina(${this.paginaActual + 1})"
                ${btnSiguienteDisabled ? 'disabled' : ''}
                class="px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    btnSiguienteDisabled 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:scale-105'
                }">
                Siguiente →
            </button>
        `;

        html += '</div>';
        this.paginacionContainer.innerHTML = html;
    }

    cambiarPagina(numeroPagina) {
        const totalPaginas = Math.ceil(this.movimientosFiltrados.length / this.resultadosPorPagina);
        
        if (numeroPagina < 1 || numeroPagina > totalPaginas) {
            return;
        }

        this.paginaActual = numeroPagina;
        this.renderMovimientos();

        // Scroll suave hacia arriba de la tabla
        if (this.historicoBody) {
            this.historicoBody.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    mostrarMensajeSinDatos() {
        if (this.historicoBody) {
            this.historicoBody.innerHTML = '';
        }
        if (this.noDataMessage) {
            this.noDataMessage.classList.remove('hidden');
        }
        if (this.totalRegistros) {
            this.totalRegistros.textContent = '0';
        }
        if (this.infoRegistros) {
            this.infoRegistros.textContent = 'Mostrando 0 registros';
        }
        if (this.paginacionContainer) {
            this.paginacionContainer.innerHTML = '';
        }
    }

    actualizarUltimoRefresco() {
        if (this.ultimoRefresco) {
            const ahora = new Date();
            this.ultimoRefresco.textContent = formatDate(ahora);
        }
    }

    async manualRefresh() {
        if (!this.btnRefresh) return;

        // Deshabilitar botón y añadir animación
        this.btnRefresh.disabled = true;
        const icon = this.btnRefresh.querySelector('svg');
        if (icon) {
            icon.style.animation = 'spin 1s linear infinite';
        }

        try {
            const ok = await this.loadMovimientos();
            // Solo mostrar toast de éxito si realmente se cargaron los datos
            if (ok) {
                showToast('Histórico actualizado', 'success');
            }
            // Si falló, loadMovimientos ya mostró el toast de error
        } catch (error) {
            console.error('Error al actualizar:', error);
            showToast('Error al actualizar el histórico', 'error');
        } finally {
            // Restaurar botón después de 1 segundo
            setTimeout(() => {
                this.btnRefresh.disabled = false;
                if (icon) {
                    icon.style.animation = '';
                }
            }, 1000);
        }
    }

    startAutoRefresh() {
        // Auto-actualización cada 5 minutos
        this.autoRefreshInterval = setInterval(() => {
            console.log('Auto-actualizando histórico...');
            this.loadMovimientos();
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
}

// Añadir animación de spin para el icono
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Inicializar instancia global cuando el DOM esté listo
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.historico = new Historico();
            window.historico.init();
        });
    } else {
        // DOM ya está listo
        window.historico = new Historico();
        window.historico.init();
    }
}
