// finanzas.js - Gestión financiera para Residencias Lux

const finanzasManager = {
    // Datos de ejemplo
    pagos: [
        {
            id: 1,
            residente: 'María González',
            propiedad: 'Torre A - 301',
            concepto: 'renta',
            fechaVencimiento: '05/06/2024',
            fechaPago: '01/06/2024',
            monto: 1200,
            metodo: 'transferencia',
            estado: 'pagado',
            referencia: 'TRF-001234'
        },
        {
            id: 2,
            residente: 'Carlos López',
            propiedad: 'Torre A - 303',
            concepto: 'renta',
            fechaVencimiento: '05/06/2024',
            fechaPago: null,
            monto: 950,
            metodo: null,
            estado: 'pendiente',
            referencia: null
        },
        {
            id: 3,
            residente: 'Ana Martínez',
            propiedad: 'Torre B - 401',
            concepto: 'mantenimiento',
            fechaVencimiento: '10/06/2024',
            fechaPago: '08/06/2024',
            monto: 150,
            metodo: 'efectivo',
            estado: 'pagado',
            referencia: 'REC-005678'
        },
        {
            id: 4,
            residente: 'Roberto Díaz',
            propiedad: 'Torre B - 402',
            concepto: 'renta',
            fechaVencimiento: '01/06/2024',
            fechaPago: null,
            monto: 1100,
            metodo: null,
            estado: 'vencido',
            referencia: null
        }
    ],

    gastos: [
        {
            id: 1,
            fecha: '01/06/2024',
            concepto: 'Mantenimiento elevadores',
            categoria: 'mantenimiento',
            proveedor: 'Elevadores Modernos SA',
            monto: 2500,
            metodoPago: 'transferencia',
            estado: 'pagado',
            descripcion: 'Mantenimiento preventivo trimestral',
            comprobante: 'FAC-2024-001'
        },
        {
            id: 2,
            fecha: '03/06/2024',
            concepto: 'Limpieza áreas comunes',
            categoria: 'servicios',
            proveedor: 'Limpieza Total',
            monto: 800,
            metodoPago: 'efectivo',
            estado: 'pagado',
            descripcion: 'Limpieza semanal',
            comprobante: 'REC-2024-045'
        },
        {
            id: 3,
            fecha: '05/06/2024',
            concepto: 'Servicios públicos',
            categoria: 'servicios',
            proveedor: 'Compañía Eléctrica',
            monto: 1200,
            metodoPago: 'tarjeta',
            estado: 'pendiente',
            descripcion: 'Electricidad áreas comunes',
            comprobante: 'FAC-LUZ-0678'
        }
    ],

    presupuesto: [
        {
            categoria: 'Mantenimiento',
            presupuesto: 5000,
            gastado: 4200,
            disponible: 800,
            porcentaje: 84
        },
        {
            categoria: 'Servicios Públicos',
            presupuesto: 3000,
            gastado: 2500,
            disponible: 500,
            porcentaje: 83
        },
        {
            categoria: 'Nómina',
            presupuesto: 4000,
            gastado: 4000,
            disponible: 0,
            porcentaje: 100
        },
        {
            categoria: 'Administrativo',
            presupuesto: 2000,
            gastado: 1500,
            disponible: 500,
            porcentaje: 75
        },
        {
            categoria: 'Seguros',
            presupuesto: 1000,
            gastado: 250,
            disponible: 750,
            porcentaje: 25
        }
    ],

    residentes: [
        { id: 1, nombre: 'María González', propiedad: 'Torre A - 301', alquiler: 1200 },
        { id: 2, nombre: 'Carlos López', propiedad: 'Torre A - 303', alquiler: 950 },
        { id: 3, nombre: 'Ana Martínez', propiedad: 'Torre B - 401', alquiler: 1600 },
        { id: 4, nombre: 'Roberto Díaz', propiedad: 'Torre B - 402', alquiler: 1100 }
    ],

    init: function() {
        this.cargarPagos();
        this.cargarGastos();
        this.cargarPresupuesto();
        this.inicializarEventListeners();
        this.inicializarGraficos();
        this.inicializarFlatpickr();
        this.cargarResidentesSelect();
    },

    inicializarEventListeners: function() {
        // Botones principales
        document.getElementById('nuevoPagoBtn').addEventListener('click', () => {
            this.openNuevoPago();
        });

        document.getElementById('generarRecibosBtn').addEventListener('click', () => {
            this.generarRecibos();
        });

        document.getElementById('nuevoGastoBtn').addEventListener('click', () => {
            this.openNuevoGasto();
        });

        // Filtros
        document.getElementById('aplicarFiltrosPagos').addEventListener('click', () => {
            this.aplicarFiltrosPagos();
        });

        document.getElementById('limpiarFiltrosPagos').addEventListener('click', () => {
            this.limpiarFiltrosPagos();
        });

        // Guardar datos
        document.getElementById('guardarPagoBtn').addEventListener('click', () => {
            this.guardarPago();
        });

        document.getElementById('guardarGastoBtn').addEventListener('click', () => {
            this.guardarGasto();
        });

        // Cambio de residente en modal de pago
        document.getElementById('pagoResidente').addEventListener('change', (e) => {
            this.actualizarPropiedadPorResidente(e.target.value);
        });

        // Búsqueda en tiempo real
        document.getElementById('searchPagos').addEventListener('input', (e) => {
            this.filtrarPagos();
        });
    },

    inicializarFlatpickr: function() {
        if (typeof flatpickr !== 'undefined') {
            flatpickr('#pagoFecha', {
                locale: 'es',
                dateFormat: 'd/m/Y',
                defaultDate: 'today'
            });

            flatpickr('#gastoFecha', {
                locale: 'es',
                dateFormat: 'd/m/Y',
                defaultDate: 'today'
            });
        }
    },

    cargarResidentesSelect: function() {
        const select = document.getElementById('pagoResidente');
        select.innerHTML = '<option value="">Seleccionar residente</option>';
        
        this.residentes.forEach(residente => {
            const option = document.createElement('option');
            option.value = residente.id;
            option.textContent = `${residente.nombre} - ${residente.propiedad}`;
            option.setAttribute('data-alquiler', residente.alquiler);
            select.appendChild(option);
        });
    },

    actualizarPropiedadPorResidente: function(residenteId) {
        const propiedadInput = document.getElementById('pagoPropiedad');
        const montoInput = document.getElementById('pagoMonto');
        
        if (residenteId) {
            const residente = this.residentes.find(r => r.id == residenteId);
            if (residente) {
                propiedadInput.value = residente.propiedad;
                montoInput.value = residente.alquiler;
            }
        } else {
            propiedadInput.value = '';
            montoInput.value = '';
        }
    },

    cargarPagos: function() {
        const tbody = document.getElementById('pagosTableBody');
        tbody.innerHTML = '';

        this.pagos.forEach(pago => {
            const row = this.crearFilaPago(pago);
            tbody.appendChild(row);
        });

        this.actualizarTotalPagos();
    },

    crearFilaPago: function(pago) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-cell">
                    <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="${pago.residente}" class="user-avatar-sm">
                    <div>
                        <strong>${pago.residente}</strong>
                        <small class="text-muted d-block">${pago.propiedad}</small>
                    </div>
                </div>
            </td>
            <td>${pago.propiedad}</td>
            <td>
                <span class="badge bg-light text-dark">${this.getConceptoTexto(pago.concepto)}</span>
            </td>
            <td>${pago.fechaVencimiento}</td>
            <td>${pago.fechaPago || '<span class="text-muted">-</span>'}</td>
            <td>
                <strong class="text-success">$${pago.monto.toLocaleString()}</strong>
            </td>
            <td>
                ${pago.metodo ? `
                    <span class="metodo-pago">
                        <i class="fas ${this.getMetodoIcono(pago.metodo)}"></i>
                        ${this.getMetodoTexto(pago.metodo)}
                    </span>
                ` : '<span class="text-muted">-</span>'}
            </td>
            <td>
                <span class="estado-pago ${pago.estado}">
                    <span class="estado-dot"></span>
                    ${this.getEstadoTexto(pago.estado)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="finanzasManager.verPago(${pago.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${pago.estado === 'pendiente' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="finanzasManager.registrarPago(${pago.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-info" onclick="finanzasManager.enviarRecordatorio(${pago.id})">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    },

    cargarGastos: function() {
        const tbody = document.getElementById('gastosTableBody');
        tbody.innerHTML = '';

        this.gastos.forEach(gasto => {
            const row = this.crearFilaGasto(gasto);
            tbody.appendChild(row);
        });
    },

    crearFilaGasto: function(gasto) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${gasto.fecha}</td>
            <td>
                <strong>${gasto.concepto}</strong>
                ${gasto.descripcion ? `<br><small class="text-muted">${gasto.descripcion}</small>` : ''}
            </td>
            <td>
                <span class="badge bg-light text-dark">${this.getCategoriaTexto(gasto.categoria)}</span>
            </td>
            <td>${gasto.proveedor || '-'}</td>
            <td>
                <strong class="text-danger">$${gasto.monto.toLocaleString()}</strong>
            </td>
            <td>
                <span class="metodo-pago">
                    <i class="fas ${this.getMetodoIcono(gasto.metodoPago)}"></i>
                    ${this.getMetodoTexto(gasto.metodoPago)}
                </span>
            </td>
            <td>
                <span class="estado-pago ${gasto.estado}">
                    <span class="estado-dot"></span>
                    ${this.getEstadoTexto(gasto.estado)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="finanzasManager.verGasto(${gasto.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="finanzasManager.editarGasto(${gasto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    },

    cargarPresupuesto: function() {
        const tbody = document.getElementById('presupuestoTableBody');
        tbody.innerHTML = '';

        this.presupuesto.forEach(item => {
            const row = this.crearFilaPresupuesto(item);
            tbody.appendChild(row);
        });
    },

    crearFilaPresupuesto: function(item) {
        const estado = this.getEstadoPresupuesto(item.porcentaje);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.categoria}</strong></td>
            <td>$${item.presupuesto.toLocaleString()}</td>
            <td>$${item.gastado.toLocaleString()}</td>
            <td>$${item.disponible.toLocaleString()}</td>
            <td>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar ${estado.clase}" style="width: ${item.porcentaje}%"></div>
                </div>
                <small>${item.porcentaje}%</small>
            </td>
            <td>
                <span class="badge ${estado.badge}">${estado.texto}</span>
            </td>
        `;
        return row;
    },

    // Filtros y búsquedas
    aplicarFiltrosPagos: function() {
        const estado = document.getElementById('filterEstadoPago').value;
        const mes = document.getElementById('filterMes').value;
        const anio = document.getElementById('filterAnio').value;

        let filtrados = this.pagos;

        if (estado) {
            filtrados = filtrados.filter(pago => pago.estado === estado);
        }

        if (mes) {
            filtrados = filtrados.filter(pago => {
                const fechaVenc = pago.fechaVencimiento.split('/');
                return fechaVenc[1] === mes && fechaVenc[2] === anio;
            });
        }

        this.mostrarPagosFiltrados(filtrados);
    },

    filtrarPagos: function() {
        const searchTerm = document.getElementById('searchPagos').value.toLowerCase();
        
        const filtrados = this.pagos.filter(pago => 
            pago.residente.toLowerCase().includes(searchTerm) ||
            pago.propiedad.toLowerCase().includes(searchTerm) ||
            pago.concepto.toLowerCase().includes(searchTerm)
        );

        this.mostrarPagosFiltrados(filtrados);
    },

    mostrarPagosFiltrados: function(pagos) {
        const tbody = document.getElementById('pagosTableBody');
        tbody.innerHTML = '';

        pagos.forEach(pago => {
            const row = this.crearFilaPago(pago);
            tbody.appendChild(row);
        });

        this.actualizarTotalPagos(pagos);
    },

    limpiarFiltrosPagos: function() {
        document.getElementById('searchPagos').value = '';
        document.getElementById('filterEstadoPago').value = '';
        document.getElementById('filterMes').value = '';
        document.getElementById('filterAnio').value = '2024';
        
        this.cargarPagos();
    },

    actualizarTotalPagos: function(pagos = null) {
        const pagosArray = pagos || this.pagos;
        const total = pagosArray.reduce((sum, pago) => sum + pago.monto, 0);
        document.getElementById('totalPagos').textContent = `$${total.toLocaleString()}`;
    },

    // Modal Functions
    openNuevoPago: function() {
        document.getElementById('pagoModalTitle').textContent = 'Registrar Pago';
        document.getElementById('pagoForm').reset();
        
        const modal = new bootstrap.Modal(document.getElementById('pagoModal'));
        modal.show();
    },

    openNuevoGasto: function() {
        document.getElementById('gastoForm').reset();
        
        const modal = new bootstrap.Modal(document.getElementById('gastoModal'));
        modal.show();
    },

    guardarPago: function() {
        const form = document.getElementById('pagoForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const nuevoPago = {
            id: Date.now(),
            residente: this.residentes.find(r => r.id == document.getElementById('pagoResidente').value).nombre,
            propiedad: document.getElementById('pagoPropiedad').value,
            concepto: document.getElementById('pagoConcepto').value,
            fechaVencimiento: this.getProximoVencimiento(),
            fechaPago: document.getElementById('pagoFecha').value,
            monto: parseFloat(document.getElementById('pagoMonto').value),
            metodo: document.getElementById('pagoMetodo').value,
            estado: 'pagado',
            referencia: document.getElementById('pagoReferencia').value || null
        };

        this.pagos.push(nuevoPago);
        this.cargarPagos();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('pagoModal'));
        modal.hide();

        this.showNotification('Pago registrado exitosamente', 'success');
    },

    guardarGasto: function() {
        const form = document.getElementById('gastoForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const nuevoGasto = {
            id: Date.now(),
            fecha: document.getElementById('gastoFecha').value,
            concepto: document.getElementById('gastoConcepto').value,
            categoria: document.getElementById('gastoCategoria').value,
            proveedor: document.getElementById('gastoProveedor').value || null,
            monto: parseFloat(document.getElementById('gastoMonto').value),
            metodoPago: document.getElementById('gastoMetodoPago').value,
            estado: 'pagado',
            descripcion: document.getElementById('gastoDescripcion').value || null,
            comprobante: document.getElementById('gastoComprobante').value || null
        };

        this.gastos.push(nuevoGasto);
        this.cargarGastos();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('gastoModal'));
        modal.hide();

        this.showNotification('Gasto registrado exitosamente', 'success');
    },

    // Acciones
    verPago: function(id) {
        const pago = this.pagos.find(p => p.id === id);
        this.showNotification(`Viendo pago de ${pago.residente} - $${pago.monto}`, 'info');
    },

    registrarPago: function(id) {
        const pago = this.pagos.find(p => p.id === id);
        pago.estado = 'pagado';
        pago.fechaPago = new Date().toLocaleDateString('es-ES');
        pago.metodo = 'efectivo'; // Por defecto
        
        this.cargarPagos();
        this.showNotification(`Pago de ${pago.residente} registrado`, 'success');
    },

    enviarRecordatorio: function(id) {
        const pago = this.pagos.find(p => p.id === id);
        this.showNotification(`Recordatorio enviado a ${pago.residente}`, 'info');
    },

    verGasto: function(id) {
        const gasto = this.gastos.find(g => g.id === id);
        this.showNotification(`Viendo gasto: ${gasto.concepto} - $${gasto.monto}`, 'info');
    },

    editarGasto: function(id) {
        this.showNotification('Funcionalidad de edición en desarrollo', 'info');
    },

    generarRecibos: function() {
        this.showNotification('Generando recibos para todos los residentes...', 'info');
        
        // Simular proceso
        setTimeout(() => {
            this.showNotification('Recibos generados exitosamente', 'success');
        }, 2000);
    },

    // Gráficos
    inicializarGraficos: function() {
        this.graficoIngresos();
        this.graficoDistribucionPagos();
        this.graficoGastos();
        this.graficoDistribucionGastos();
        this.graficoPresupuesto();
    },

    graficoIngresos: function() {
        const ctx = document.getElementById('ingresosChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Ingresos Mensuales',
                    data: [42000, 39800, 45000, 43200, 45680, 47000],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ingresos: $${context.raw.toLocaleString()}`;
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

    graficoDistribucionPagos: function() {
        const ctx = document.getElementById('distribucionPagosChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pagados', 'Pendientes', 'Vencidos'],
                datasets: [{
                    data: [24, 5, 2],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
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
                cutout: '65%'
            }
        });
    },

    graficoGastos: function() {
        const ctx = document.getElementById('gastosChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Gastos Operativos',
                    data: [11500, 12400, 11800, 13200, 12450, 13000],
                    backgroundColor: '#fd7e14',
                    borderColor: '#fd7e14',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Gastos: $${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
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

    graficoDistribucionGastos: function() {
        const ctx = document.getElementById('distribucionGastosChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Mantenimiento', 'Servicios', 'Nómina', 'Administrativo', 'Seguros'],
                datasets: [{
                    data: [4200, 2500, 4000, 1500, 250],
                    backgroundColor: [
                        '#0d6efd', '#6f42c1', '#20c997', '#fd7e14', '#e83e8c'
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

    graficoPresupuesto: function() {
        const ctx = document.getElementById('presupuestoChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.presupuesto.map(item => item.categoria),
                datasets: [
                    {
                        label: 'Presupuesto',
                        data: this.presupuesto.map(item => item.presupuesto),
                        backgroundColor: 'rgba(13, 110, 253, 0.6)',
                        borderColor: '#0d6efd',
                        borderWidth: 1
                    },
                    {
                        label: 'Gastado',
                        data: this.presupuesto.map(item => item.gastado),
                        backgroundColor: 'rgba(253, 126, 20, 0.6)',
                        borderColor: '#fd7e14',
                        borderWidth: 1
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
                        beginAtZero: true,
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

    // Helper functions
    getProximoVencimiento: function() {
        const hoy = new Date();
        const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 5);
        return proximoMes.toLocaleDateString('es-ES');
    },

    getConceptoTexto: function(concepto) {
        const conceptos = {
            'renta': 'Renta Mensual',
            'mantenimiento': 'Mantenimiento',
            'servicios': 'Servicios',
            'multa': 'Multa',
            'otros': 'Otros'
        };
        return conceptos[concepto] || concepto;
    },

    getCategoriaTexto: function(categoria) {
        const categorias = {
            'mantenimiento': 'Mantenimiento',
            'servicios': 'Servicios Públicos',
            'nomina': 'Nómina',
            'administrativo': 'Administrativo',
            'seguros': 'Seguros',
            'impuestos': 'Impuestos',
            'otros': 'Otros'
        };
        return categorias[categoria] || categoria;
    },

    getMetodoTexto: function(metodo) {
        const metodos = {
            'efectivo': 'Efectivo',
            'transferencia': 'Transferencia',
            'tarjeta': 'Tarjeta',
            'cheque': 'Cheque'
        };
        return metodos[metodo] || metodo;
    },

    getMetodoIcono: function(metodo) {
        const iconos = {
            'efectivo': 'fa-money-bill-wave',
            'transferencia': 'fa-exchange-alt',
            'tarjeta': 'fa-credit-card',
            'cheque': 'fa-file-invoice-dollar'
        };
        return iconos[metodo] || 'fa-money-bill-wave';
    },

    getEstadoTexto: function(estado) {
        const estados = {
            'pagado': 'Pagado',
            'pendiente': 'Pendiente',
            'vencido': 'Vencido'
        };
        return estados[estado] || estado;
    },

    getEstadoPresupuesto: function(porcentaje) {
        if (porcentaje <= 75) {
            return { clase: 'bg-success', badge: 'badge-success', texto: 'Dentro del presupuesto' };
        } else if (porcentaje <= 90) {
            return { clase: 'bg-warning', badge: 'badge-warning', texto: 'Cerca del límite' };
        } else {
            return { clase: 'bg-danger', badge: 'badge-danger', texto: 'Excedido' };
        }
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
    finanzasManager.init();
});