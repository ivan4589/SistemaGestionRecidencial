// reportes.js - Gestión de reportes y analytics para Residencias Lux

const reportesManager = {
    // Datos de ejemplo
    reportesGenerados: [
        {
            id: 1,
            nombre: 'Reporte Financiero Mayo 2024',
            tipo: 'financiero',
            fechaGeneracion: '01/06/2024 09:30',
            rangoFechas: '01/05/2024 - 31/05/2024',
            tamaño: '2.4 MB',
            estado: 'completado'
        },
        {
            id: 2,
            nombre: 'Análisis de Ocupación Q2',
            tipo: 'ocupacion',
            fechaGeneracion: '28/05/2024 14:15',
            rangoFechas: '01/04/2024 - 30/06/2024',
            tamaño: '1.8 MB',
            estado: 'completado'
        },
        {
            id: 3,
            nombre: 'Reporte Mantenimiento Preventivo',
            tipo: 'mantenimiento',
            fechaGeneracion: '25/05/2024 11:20',
            rangoFechas: '01/01/2024 - 25/05/2024',
            tamaño: '3.1 MB',
            estado: 'completado'
        },
        {
            id: 4,
            nombre: 'Reporte Residentes Activos',
            tipo: 'residentes',
            fechaGeneracion: '20/05/2024 16:45',
            rangoFechas: '01/01/2024 - 20/05/2024',
            tamaño: '1.2 MB',
            estado: 'completado'
        }
    ],

    init: function() {
        this.cargarReportesGenerados();
        this.inicializarEventListeners();
        this.inicializarGraficos();
        this.inicializarFlatpickr();
    },

    inicializarEventListeners: function() {
        // Botones principales
        document.getElementById('generarReporteBtn').addEventListener('click', () => {
            this.openReporteModal();
        });

        document.getElementById('exportarTodoBtn').addEventListener('click', () => {
            this.exportarTodosReportes();
        });

        document.getElementById('aplicarFiltrosReporte').addEventListener('click', () => {
            this.aplicarFiltros();
        });

        // Modal de reporte personalizado
        document.getElementById('generarReportePersonalizadoBtn').addEventListener('click', () => {
            this.generarReportePersonalizado();
        });

        // Búsqueda en tiempo real
        document.getElementById('fechaRange').addEventListener('change', (e) => {
            this.actualizarFiltros();
        });
    },

    inicializarFlatpickr: function() {
        if (typeof flatpickr !== 'undefined') {
            // Rango de fechas principal
            flatpickr('#fechaRange', {
                locale: 'es',
                mode: 'range',
                dateFormat: 'd/m/Y',
                defaultDate: ['01/06/2024', '30/06/2024']
            });

            // Fechas del modal
            flatpickr('#reporteFechaInicio', {
                locale: 'es',
                dateFormat: 'd/m/Y',
                defaultDate: '01/06/2024'
            });

            flatpickr('#reporteFechaFin', {
                locale: 'es',
                dateFormat: 'd/m/Y',
                defaultDate: '30/06/2024'
            });
        }
    },

    cargarReportesGenerados: function() {
        const tbody = document.getElementById('reportesTableBody');
        tbody.innerHTML = '';

        this.reportesGenerados.forEach(reporte => {
            const row = this.crearFilaReporte(reporte);
            tbody.appendChild(row);
        });
    },

    crearFilaReporte: function(reporte) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas ${this.getTipoIcono(reporte.tipo)} text-primary me-3"></i>
                    <div>
                        <strong>${reporte.nombre}</strong>
                        <br>
                        <small class="text-muted">Generado por: Admin Lux</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge-tipo-reporte badge-${reporte.tipo}">
                    ${this.getTipoTexto(reporte.tipo)}
                </span>
            </td>
            <td>${reporte.fechaGeneracion}</td>
            <td>${reporte.rangoFechas}</td>
            <td>${reporte.tamaño}</td>
            <td>
                <span class="estado-reporte ${reporte.estado}">
                    <span class="estado-dot"></span>
                    ${this.getEstadoTexto(reporte.estado)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="reportesManager.verReporte(${reporte.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="reportesManager.descargarReporte(${reporte.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="reportesManager.compartirReporte(${reporte.id})">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    },

    inicializarGraficos: function() {
        this.graficoDesempeno();
        this.graficoDistribucionIngresos();
        this.graficoOcupacionTorre();
        this.graficoMantenimiento();
    },

    graficoDesempeno: function() {
        const ctx = document.getElementById('desempenoChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Ingresos',
                        data: [42000, 39800, 45000, 43200, 45680, 47000],
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Gastos',
                        data: [11500, 12400, 11800, 13200, 12450, 13000],
                        borderColor: '#fd7e14',
                        backgroundColor: 'rgba(253, 126, 20, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    graficoDistribucionIngresos: function() {
        const ctx = document.getElementById('distribucionIngresosChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Renta Mensual', 'Mantenimiento', 'Servicios', 'Multas', 'Otros'],
                datasets: [{
                    data: [38400, 4500, 1800, 600, 380],
                    backgroundColor: [
                        '#0d6efd',
                        '#20c997',
                        '#fd7e14',
                        '#dc3545',
                        '#6f42c1'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '60%'
            }
        });
    },

    graficoOcupacionTorre: function() {
        const ctx = document.getElementById('ocupacionTorreChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Torre A', 'Torre B', 'Torre C'],
                datasets: [{
                    label: 'Ocupación (%)',
                    data: [75, 62, 58],
                    backgroundColor: [
                        'rgba(13, 110, 253, 0.8)',
                        'rgba(32, 201, 151, 0.8)',
                        'rgba(111, 66, 193, 0.8)'
                    ],
                    borderColor: [
                        '#0d6efd',
                        '#20c997',
                        '#6f42c1'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    },

    graficoMantenimiento: function() {
        const ctx = document.getElementById('mantenimientoChart').getContext('2d');
        new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Preventivo', 'Correctivo', 'Emergencia', 'Limpieza', 'Instalación'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        'rgba(13, 110, 253, 0.8)',
                        'rgba(32, 201, 151, 0.8)',
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(111, 66, 193, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    // Funciones de reportes
    openReporteModal: function() {
        document.getElementById('reporteForm').reset();
        
        const modal = new bootstrap.Modal(document.getElementById('reporteModal'));
        modal.show();
    },

    generarReportePersonalizado: function() {
        const form = document.getElementById('reporteForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const reporteData = {
            nombre: document.getElementById('reporteNombre').value,
            tipo: document.getElementById('reporteTipo').value,
            fechaInicio: document.getElementById('reporteFechaInicio').value,
            fechaFin: document.getElementById('reporteFechaFin').value,
            formato: document.querySelector('input[name="formatoSalida"]:checked').value,
            comentarios: document.getElementById('reporteComentarios').value
        };

        this.mostrarLoading();
        
        // Simular generación de reporte
        setTimeout(() => {
            this.ocultarLoading();
            this.agregarReporteGenerado(reporteData);
            this.mostrarVistaPrevia(reporteData);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('reporteModal'));
            modal.hide();
            
            this.showNotification('Reporte generado exitosamente', 'success');
        }, 3000);
    },

    agregarReporteGenerado: function(reporteData) {
        const nuevoReporte = {
            id: Date.now(),
            nombre: reporteData.nombre,
            tipo: reporteData.tipo,
            fechaGeneracion: new Date().toLocaleString('es-ES'),
            rangoFechas: `${reporteData.fechaInicio} - ${reporteData.fechaFin}`,
            tamaño: '2.1 MB',
            estado: 'completado'
        };

        this.reportesGenerados.unshift(nuevoReporte);
        this.cargarReportesGenerados();
    },

    mostrarVistaPrevia: function(reporteData) {
        const contenido = this.generarContenidoVistaPrevia(reporteData);
        document.getElementById('vistaPreviaContent').innerHTML = contenido;
        
        const modal = new bootstrap.Modal(document.getElementById('vistaPreviaModal'));
        modal.show();
    },

    generarContenidoVistaPrevia: function(reporteData) {
        return `
            <div class="vista-previa">
                <div class="vista-previa-header">
                    <h3 class="vista-previa-title">${reporteData.nombre}</h3>
                    <p class="vista-previa-subtitle">Período: ${reporteData.fechaInicio} - ${reporteData.fechaFin}</p>
                    <p class="vista-previa-subtitle">Generado el: ${new Date().toLocaleString('es-ES')}</p>
                </div>
                
                <div class="vista-previa-section">
                    <h4>Resumen Ejecutivo</h4>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="metric-card primary">
                                <div class="metric-icon">
                                    <i class="fas fa-dollar-sign"></i>
                                </div>
                                <div class="metric-info">
                                    <h3>$45,680</h3>
                                    <p>Ingresos Totales</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="metric-card success">
                                <div class="metric-icon">
                                    <i class="fas fa-home"></i>
                                </div>
                                <div class="metric-info">
                                    <h3>66.7%</h3>
                                    <p>Tasa de Ocupación</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="metric-card warning">
                                <div class="metric-icon">
                                    <i class="fas fa-tools"></i>
                                </div>
                                <div class="metric-info">
                                    <h3>12</h3>
                                    <p>Solicitudes Mantenimiento</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="vista-previa-section">
                    <h4>Análisis Detallado</h4>
                    <p>Este reporte incluye un análisis completo de ${this.getTipoTexto(reporteData.tipo)} 
                    para el período especificado. Los datos han sido procesados y validados para garantizar 
                    la precisión de la información presentada.</p>
                    
                    ${reporteData.comentarios ? `
                    <div class="alert alert-info mt-3">
                        <strong>Comentarios:</strong> ${reporteData.comentarios}
                    </div>
                    ` : ''}
                </div>
                
                <div class="vista-previa-section">
                    <h4>Recomendaciones</h4>
                    <ul>
                        <li>Considerar aumentar la capacidad de las áreas comunes debido al alto uso</li>
                        <li>Programar mantenimiento preventivo para los elevadores de la Torre B</li>
                        <li>Revisar estrategia de precios para propiedades disponibles</li>
                    </ul>
                </div>
            </div>
        `;
    },

    // Funciones de acción
    generarReporteMensual: function() {
        this.showNotification('Generando reporte mensual...', 'info');
        setTimeout(() => {
            this.showNotification('Reporte mensual generado', 'success');
        }, 2000);
    },

    generarReporteFinanciero: function() {
        this.showNotification('Generando reporte financiero...', 'info');
        setTimeout(() => {
            this.showNotification('Reporte financiero generado', 'success');
        }, 2000);
    },

    generarReporteOcupacion: function() {
        this.showNotification('Generando reporte de ocupación...', 'info');
        setTimeout(() => {
            this.showNotification('Reporte de ocupación generado', 'success');
        }, 2000);
    },

    generarReportePersonalizado: function() {
        this.openReporteModal();
    },

    generarReporteRapido: function(tipo) {
        const tipos = {
            'pagos-pendientes': 'Reporte de Pagos Pendientes',
            'mantenimiento-pendiente': 'Reporte de Mantenimiento Pendiente',
            'propiedades-disponibles': 'Reporte de Propiedades Disponibles',
            'residentes-nuevos': 'Reporte de Nuevos Residentes',
            'ingresos-mes': 'Reporte de Ingresos del Mes',
            'gastos-mes': 'Reporte de Gastos del Mes'
        };

        this.showNotification(`Generando ${tipos[tipo]}...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`${tipos[tipo]} generado exitosamente`, 'success');
        }, 1500);
    },

    verReporte: function(id) {
        const reporte = this.reportesGenerados.find(r => r.id === id);
        this.showNotification(`Viendo reporte: ${reporte.nombre}`, 'info');
    },

    descargarReporte: function(id = null) {
        if (id) {
            const reporte = this.reportesGenerados.find(r => r.id === id);
            this.showNotification(`Descargando: ${reporte.nombre}`, 'success');
        } else {
            this.showNotification('Descargando reporte actual...', 'success');
        }
    },

    compartirReporte: function(id) {
        const reporte = this.reportesGenerados.find(r => r.id === id);
        this.showNotification(`Compartiendo: ${reporte.nombre}`, 'info');
    },

    exportarGrafico: function(tipo) {
        this.showNotification(`Exportando gráfico ${tipo}...`, 'info');
        setTimeout(() => {
            this.showNotification('Gráfico exportado exitosamente', 'success');
        }, 1000);
    },

    exportarTodosReportes: function() {
        this.showNotification('Exportando todos los reportes...', 'info');
        setTimeout(() => {
            this.showNotification('Todos los reportes han sido exportados', 'success');
        }, 3000);
    },

    aplicarFiltros: function() {
        const fechaRange = document.getElementById('fechaRange').value;
        const tipoReporte = document.getElementById('tipoReporte').value;
        const formato = document.getElementById('formatoReporte').value;
        const torre = document.getElementById('filtroTorre').value;

        this.showNotification('Aplicando filtros...', 'info');
        
        // Simular aplicación de filtros
        setTimeout(() => {
            this.showNotification('Filtros aplicados correctamente', 'success');
        }, 1000);
    },

    actualizarFiltros: function() {
        // Lógica para actualizar filtros en tiempo real
        console.log('Filtros actualizados');
    },

    // Helper functions
    getTipoTexto: function(tipo) {
        const tipos = {
            'financiero': 'Financiero',
            'ocupacion': 'Ocupación',
            'mantenimiento': 'Mantenimiento',
            'residentes': 'Residentes',
            'completo': 'Completo'
        };
        return tipos[tipo] || tipo;
    },

    getTipoIcono: function(tipo) {
        const iconos = {
            'financiero': 'fa-chart-line',
            'ocupacion': 'fa-home',
            'mantenimiento': 'fa-tools',
            'residentes': 'fa-users',
            'completo': 'fa-file-alt'
        };
        return iconos[tipo] || 'fa-file-alt';
    },

    getEstadoTexto: function(estado) {
        const estados = {
            'completado': 'Completado',
            'procesando': 'Procesando',
            'error': 'Error'
        };
        return estados[estado] || estado;
    },

    mostrarLoading: function() {
        document.body.classList.add('loading-report');
    },

    ocultarLoading: function() {
        document.body.classList.remove('loading-report');
    },

    showNotification: function(message, type = 'info') {
        if (typeof AdminDashboard !== 'undefined' && AdminDashboard.showNotification) {
            AdminDashboard.showNotification(message, type);
        } else {
            // Fallback simple
            const alertClass = {
                'success': 'alert-success',
                'warning': 'alert-warning',
                'danger': 'alert-danger',
                'info': 'alert-info'
            }[type] || 'alert-info';

            const alert = document.createElement('div');
            alert.className = `alert ${alertClass} alert-dismissible fade show`;
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            alert.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            
            document.body.appendChild(alert);
            
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    reportesManager.init();
});