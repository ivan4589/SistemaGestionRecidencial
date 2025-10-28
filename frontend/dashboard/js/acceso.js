class AccesoManager {
    constructor() {
        this.visitas = [];
        this.historial = [];
        this.currentVisita = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initEventListeners();
        this.initDatePicker();
        this.loadVisitas();
        this.loadHistorial();
        this.generateHourOptions();
    }

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            window.location.href = '../login.html';
            return;
        }

        this.displayUserInfo(JSON.parse(user));
    }

    displayUserInfo(user) {
        const userInfoElements = document.querySelectorAll('.user-name, .user-role');
        userInfoElements.forEach(element => {
            if (element.classList.contains('user-name')) {
                element.textContent = `${user.nombre} ${user.apellidos}`;
            }
        });
    }

    initEventListeners() {
        // Formulario de visita
        document.getElementById('visitaForm').addEventListener('submit', (e) => this.registrarVisita(e));
        
        // Filtros
        document.getElementById('filterStatus').addEventListener('change', () => this.filterVisitas());
        document.getElementById('searchVisitas').addEventListener('input', () => this.searchVisitas());
        
        // Botón nueva visita
        document.getElementById('nuevaVisitaBtn').addEventListener('click', () => this.scrollToForm());
        
        // Modal actions
        document.getElementById('editVisitaBtn').addEventListener('click', () => this.editVisita());
        document.getElementById('cancelVisitaBtn').addEventListener('click', () => this.cancelVisita());
        
        // QR code buttons
        document.querySelectorAll('.btn-outline-primary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showQRCode();
            });
        });
    }

    initDatePicker() {
        const fechaInput = document.getElementById('fechaVisita');
        if (fechaInput) {
            flatpickr(fechaInput, {
                locale: 'es',
                minDate: 'today',
                maxDate: new Date().fp_incr(7), // 7 días desde hoy
                dateFormat: 'd/m/Y',
                defaultDate: 'today'
            });
        }
    }

    generateHourOptions() {
        const horaSelect = document.getElementById('horaVisita');
        if (!horaSelect) return;

        // Generar opciones de hora cada 30 minutos de 6:00 AM a 10:00 PM
        for (let hour = 6; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = `${hour}:${minute.toString().padStart(2, '0')}`;
                
                const option = document.createElement('option');
                option.value = timeString;
                option.textContent = displayTime;
                horaSelect.appendChild(option);
            }
        }

        // Establecer hora actual + 1 hora como predeterminada
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        const nextHourString = nextHour.getHours().toString().padStart(2, '0') + ':' + 
                             nextHour.getMinutes().toString().padStart(2, '0');
        
        horaSelect.value = nextHourString;
    }

    async loadVisitas() {
        try {
            this.visitas = await this.fetchVisitas();
            this.renderVisitasList();
        } catch (error) {
            console.error('Error loading visits:', error);
        }
    }

    async fetchVisitas() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        nombre: 'María González',
                        tipo: 'familiar',
                        documento: '12345678A',
                        telefono: '+34 612 345 678',
                        fecha: new Date(2024, 10, 20, 14, 0), // Hoy 14:00
                        duracion: 2,
                        area: 'departamento',
                        motivo: 'Visita familiar',
                        accesoVehiculo: false,
                        estado: 'activa',
                        codigoAcceso: 'VST-2024-001'
                    },
                    {
                        id: 2,
                        nombre: 'Carlos López',
                        tipo: 'amigo',
                        documento: '87654321B',
                        telefono: '+34 623 456 789',
                        fecha: new Date(2024, 10, 21, 16, 0), // Mañana 16:00
                        duracion: 3,
                        area: 'piscina',
                        motivo: 'Día de piscina',
                        accesoVehiculo: true,
                        estado: 'programada',
                        codigoAcceso: 'VST-2024-002'
                    },
                    {
                        id: 3,
                        nombre: 'Ana Martínez',
                        tipo: 'servicio',
                        documento: '11223344C',
                        telefono: '+34 634 567 890',
                        fecha: new Date(2024, 10, 19, 10, 0), // Ayer 10:00
                        duracion: 1,
                        area: 'departamento',
                        motivo: 'Entrega de paquete',
                        accesoVehiculo: false,
                        estado: 'completada',
                        codigoAcceso: 'VST-2024-003'
                    },
                    {
                        id: 4,
                        nombre: 'Roberto Díaz',
                        tipo: 'trabajo',
                        documento: '44332211D',
                        telefono: '+34 645 678 901',
                        fecha: new Date(2024, 10, 18, 9, 0), // Hace 2 días
                        duracion: 4,
                        area: 'departamento',
                        motivo: 'Reparación aire acondicionado',
                        accesoVehiculo: true,
                        estado: 'expirada',
                        codigoAcceso: 'VST-2024-004'
                    }
                ]);
            }, 1000);
        });
    }

    renderVisitasList() {
        const visitasList = document.getElementById('visitasList');
        if (!visitasList) return;

        visitasList.innerHTML = '';

        this.visitas.forEach(visita => {
            const visitaElement = this.createVisitaElement(visita);
            visitasList.appendChild(visitaElement);
        });
    }

    createVisitaElement(visita) {
        const div = document.createElement('div');
        div.className = `visita-item ${visita.estado}`;
        div.addEventListener('click', () => this.showVisitaDetails(visita));

        const avatarIcon = this.getTipoIcon(visita.tipo);
        const statusClass = `status-${visita.estado}`;
        const statusText = this.getEstadoText(visita.estado);
        const tipoClass = `tipo-${visita.tipo}`;
        const tipoText = this.getTipoText(visita.tipo);

        div.innerHTML = `
            <div class="visita-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="visita-details">
                <h6>${visita.nombre}</h6>
                <div class="visita-meta">
                    <span><i class="fas fa-calendar"></i> ${visita.fecha.toLocaleDateString('es-ES')}</span>
                    <span><i class="fas fa-clock"></i> ${visita.fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${this.getAreaText(visita.area)}</span>
                </div>
                <span class="visita-status ${statusClass}">${statusText}</span>
                <span class="tipo-badge ${tipoClass}">${tipoText}</span>
            </div>
            <div class="visita-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); accesoManager.generateQRCode(${visita.id})">
                    <i class="fas fa-qrcode"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="event.stopPropagation(); accesoManager.editVisitaForm(${visita.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;

        return div;
    }

    getTipoIcon(tipo) {
        const icons = {
            'familiar': 'fas fa-users',
            'amigo': 'fas fa-user-friends',
            'conocido': 'fas fa-user',
            'servicio': 'fas fa-truck',
            'trabajo': 'fas fa-tools',
            'otro': 'fas fa-user-tag'
        };
        return icons[tipo] || 'fas fa-user';
    }

    getTipoText(tipo) {
        const tipos = {
            'familiar': 'Familiar',
            'amigo': 'Amigo',
            'conocido': 'Conocido',
            'servicio': 'Servicio',
            'trabajo': 'Trabajador',
            'otro': 'Otro'
        };
        return tipos[tipo] || tipo;
    }

    getEstadoText(estado) {
        const estados = {
            'activa': 'Activa',
            'programada': 'Programada',
            'completada': 'Completada',
            'expirada': 'Expirada'
        };
        return estados[estado] || estado;
    }

    getAreaText(area) {
        const areas = {
            'departamento': 'Departamento',
            'piscina': 'Piscina',
            'gimnasio': 'Gimnasio',
            'salon': 'Salón de Eventos',
            'areas_comunes': 'Áreas Comunes'
        };
        return areas[area] || area;
    }

    async loadHistorial() {
        try {
            this.historial = await this.fetchHistorial();
            this.renderHistorialTable();
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    async fetchHistorial() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        visitante: 'María González',
                        fecha: new Date(2024, 10, 20, 14, 5),
                        tipo: 'Entrada',
                        area: 'Departamento',
                        estado: 'access-granted'
                    },
                    {
                        id: 2,
                        visitante: 'Carlos López',
                        fecha: new Date(2024, 10, 19, 16, 30),
                        tipo: 'Salida',
                        area: 'Piscina',
                        estado: 'access-granted'
                    },
                    {
                        id: 3,
                        visitante: 'Ana Martínez',
                        fecha: new Date(2024, 10, 19, 10, 15),
                        tipo: 'Entrada',
                        area: 'Departamento',
                        estado: 'access-granted'
                    },
                    {
                        id: 4,
                        visitante: 'Visitante No Registrado',
                        fecha: new Date(2024, 10, 18, 11, 0),
                        tipo: 'Intento de Entrada',
                        area: 'Gimnasio',
                        estado: 'access-denied'
                    }
                ]);
            }, 1000);
        });
    }

    renderHistorialTable() {
        const historialTable = document.getElementById('historialTable');
        if (!historialTable) return;

        historialTable.innerHTML = '';

        this.historial.forEach(registro => {
            const row = this.createHistorialRow(registro);
            historialTable.appendChild(row);
        });
    }

    createHistorialRow(registro) {
        const row = document.createElement('tr');
        const estadoClass = registro.estado;
        const estadoText = this.getAccessEstadoText(registro.estado);
        const estadoIcon = this.getAccessEstadoIcon(registro.estado);

        row.innerHTML = `
            <td>${registro.visitante}</td>
            <td>${registro.fecha.toLocaleString('es-ES')}</td>
            <td>${registro.tipo}</td>
            <td>${registro.area}</td>
            <td>
                <span class="access-indicator ${estadoClass}">
                    <i class="${estadoIcon}"></i>
                    ${estadoText}
                </span>
            </td>
        `;

        return row;
    }

    getAccessEstadoText(estado) {
        const estados = {
            'access-granted': 'Permitido',
            'access-denied': 'Denegado',
            'access-pending': 'Pendiente'
        };
        return estados[estado] || estado;
    }

    getAccessEstadoIcon(estado) {
        const icons = {
            'access-granted': 'fas fa-check-circle',
            'access-denied': 'fas fa-times-circle',
            'access-pending': 'fas fa-clock'
        };
        return icons[estado] || 'fas fa-question-circle';
    }

    async registrarVisita(e) {
        e.preventDefault();
        
        if (!this.validateVisitaForm()) {
            return;
        }

        const visitaData = this.getVisitaFormData();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        this.setLoading(submitBtn, true);

        try {
            await this.saveVisita(visitaData);
            this.showNotification('Visita registrada exitosamente', 'success');
            this.resetForm();
            this.loadVisitas(); // Recargar lista
        } catch (error) {
            this.showNotification('Error al registrar la visita', 'error');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    validateVisitaForm() {
        const nombre = document.getElementById('nombreVisitante').value;
        const tipo = document.getElementById('tipoVisitante').value;
        const fecha = document.getElementById('fechaVisita').value;
        const hora = document.getElementById('horaVisita').value;
        const motivo = document.getElementById('motivoVisita').value;

        if (!nombre.trim()) {
            this.showNotification('Por favor ingresa el nombre del visitante', 'error');
            return false;
        }

        if (!tipo) {
            this.showNotification('Por favor selecciona el tipo de visitante', 'error');
            return false;
        }

        if (!fecha) {
            this.showNotification('Por favor selecciona la fecha de visita', 'error');
            return false;
        }

        if (!hora) {
            this.showNotification('Por favor selecciona la hora de visita', 'error');
            return false;
        }

        if (!motivo.trim()) {
            this.showNotification('Por favor describe el motivo de la visita', 'error');
            return false;
        }

        return true;
    }

    getVisitaFormData() {
        return {
            nombre: document.getElementById('nombreVisitante').value,
            tipo: document.getElementById('tipoVisitante').value,
            documento: document.getElementById('documentoVisitante').value,
            telefono: document.getElementById('telefonoVisitante').value,
            fecha: document.getElementById('fechaVisita').value,
            hora: document.getElementById('horaVisita').value,
            duracion: parseInt(document.getElementById('duracionVisita').value),
            area: document.getElementById('areaAcceso').value,
            motivo: document.getElementById('motivoVisita').value,
            accesoVehiculo: document.getElementById('accesoVehiculo').checked,
            estado: 'programada',
            codigoAcceso: `VST-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        };
    }

    async saveVisita(visitaData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Visita guardada:', visitaData);
                // En una implementación real, enviarías los datos al servidor
                resolve({ success: true, id: Date.now() });
            }, 1500);
        });
    }

    showVisitaDetails(visita) {
        this.currentVisita = visita;
        
        const modalBody = document.getElementById('visitaModalBody');
        const fechaHora = `${visita.fecha.toLocaleDateString('es-ES')} ${visita.fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;
        
        modalBody.innerHTML = `
            <div class="visita-detail-item">
                <strong>Visitante:</strong>
                <span class="value">${visita.nombre}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Tipo:</strong>
                <span class="value">
                    <span class="tipo-badge tipo-${visita.tipo}">${this.getTipoText(visita.tipo)}</span>
                </span>
            </div>
            <div class="visita-detail-item">
                <strong>Documento:</strong>
                <span class="value">${visita.documento || 'No especificado'}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Teléfono:</strong>
                <span class="value">${visita.telefono || 'No especificado'}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Fecha y Hora:</strong>
                <span class="value">${fechaHora}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Duración:</strong>
                <span class="value">${visita.duracion} hora${visita.duracion > 1 ? 's' : ''}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Área de Acceso:</strong>
                <span class="value">${this.getAreaText(visita.area)}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Motivo:</strong>
                <span class="value">${visita.motivo}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Acceso con Vehículo:</strong>
                <span class="value">${visita.accesoVehiculo ? 'Sí' : 'No'}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Código de Acceso:</strong>
                <span class="value">${visita.codigoAcceso}</span>
            </div>
            <div class="visita-detail-item">
                <strong>Estado:</strong>
                <span class="value">
                    <span class="visita-status status-${visita.estado}">${this.getEstadoText(visita.estado)}</span>
                </span>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('visitaModal'));
        modal.show();
    }

    generateQRCode(visitaId) {
        const visita = this.visitas.find(v => v.id === visitaId);
        if (!visita) return;

        // Actualizar información del QR
        document.getElementById('qrExpiry').textContent = 
            `${visita.fecha.toLocaleDateString('es-ES')} ${visita.fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;

        const modal = new bootstrap.Modal(document.getElementById('qrModal'));
        modal.show();
    }

    showQRCode() {
        // Mostrar QR genérico
        const modal = new bootstrap.Modal(document.getElementById('qrModal'));
        modal.show();
    }

    editVisita() {
        if (!this.currentVisita) return;
        
        this.showNotification('Funcionalidad de edición en desarrollo', 'info');
        // Aquí implementarías la lógica para editar la visita
    }

    async cancelVisita() {
        if (!this.currentVisita) return;

        if (!confirm('¿Estás seguro de que quieres cancelar esta visita?')) {
            return;
        }

        try {
            await this.cancelVisitaInAPI(this.currentVisita.id);
            this.showNotification('Visita cancelada exitosamente', 'success');
            this.closeModal();
            this.loadVisitas(); // Recargar lista
        } catch (error) {
            this.showNotification('Error al cancelar la visita', 'error');
        }
    }

    async cancelVisitaInAPI(visitaId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Visita cancelada:', visitaId);
                resolve({ success: true });
            }, 1000);
        });
    }

    editVisitaForm(visitaId) {
        const visita = this.visitas.find(v => v.id === visitaId);
        if (!visita) return;

        // Llenar el formulario con los datos de la visita
        document.getElementById('tipoVisitante').value = visita.tipo;
        document.getElementById('nombreVisitante').value = visita.nombre;
        document.getElementById('documentoVisitante').value = visita.documento || '';
        document.getElementById('telefonoVisitante').value = visita.telefono || '';
        document.getElementById('fechaVisita').value = visita.fecha.toLocaleDateString('es-ES');
        document.getElementById('horaVisita').value = visita.fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
        document.getElementById('duracionVisita').value = visita.duracion;
        document.getElementById('areaAcceso').value = visita.area;
        document.getElementById('motivoVisita').value = visita.motivo;
        document.getElementById('accesoVehiculo').checked = visita.accesoVehiculo;

        // Scroll al formulario
        this.scrollToForm();
    }

    filterVisitas() {
        const filterStatus = document.getElementById('filterStatus').value;
        const visitasItems = document.querySelectorAll('.visita-item');
        
        visitasItems.forEach(item => {
            if (!filterStatus || item.classList.contains(filterStatus)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    searchVisitas() {
        const searchTerm = document.getElementById('searchVisitas').value.toLowerCase();
        const visitasItems = document.querySelectorAll('.visita-item');
        
        visitasItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    scrollToForm() {
        document.getElementById('visitaForm').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    resetForm() {
        document.getElementById('visitaForm').reset();
        // Restablecer fecha a hoy
        const fechaInput = document.getElementById('fechaVisita');
        if (fechaInput._flatpickr) {
            fechaInput._flatpickr.setDate(new Date());
        }
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('visitaModal'));
        modal.hide();
    }

    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Registrar Visita';
        }
    }

    showNotification(message, type = 'success') {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info';
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show access-notification`;
        
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icon} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar el manager de acceso
const accesoManager = new AccesoManager();